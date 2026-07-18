import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPayPalWebhookSignature, PAYPAL_PLAN_MAP } from '@/services/paypal';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers = req.headers;

  // 1. Verificar firma de autenticidad del webhook con PayPal
  const isSignatureValid = await verifyPayPalWebhookSignature(headers, rawBody);
  if (!isSignatureValid) {
    console.error('Firma de webhook de PayPal no válida.');
    return NextResponse.json({ error: 'Firma de webhook inválida.' }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    console.log(`Recibido evento de webhook de PayPal: ${event.event_type}`, event.id);

    const resource = event.resource;
    const eventType = event.event_type;

    switch (eventType) {
      // Notificaciones de creación y activación de suscripciones
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = resource.id;
        const paypalPlanId = resource.plan_id;
        const workspaceId = resource.custom_id;
        const status = resource.status;

        const planType = PAYPAL_PLAN_MAP[paypalPlanId];
        if (!planType) {
          console.error(`Plan ID no configurado en Assistly: ${paypalPlanId}`);
          break;
        }

        const nextBillingTime = resource.billing_info?.next_billing_time 
          ? new Date(resource.billing_info.next_billing_time)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await prisma.$transaction(async (tx) => {
          await tx.subscription.upsert({
            where: { providerSubscriptionId: subscriptionId },
            update: {
              status: status,
              currentPeriodEnd: nextBillingTime,
              updatedAt: new Date(),
            },
            create: {
              workspaceId: workspaceId,
              providerSubscriptionId: subscriptionId,
              providerName: 'paypal',
              status: status,
              priceId: paypalPlanId,
              currentPeriodEnd: nextBillingTime,
            },
          });

          // Actualizar el plan del workspace si está activo
          if (status === 'ACTIVE') {
            const payerId = resource.subscriber?.payer_id || 'paypal_customer';
            await tx.workspace.update({
              where: { id: workspaceId },
              data: {
                plan: planType,
                billingCustomerId: payerId,
                billingSubscriptionId: subscriptionId,
              },
            });
          }
        });
        break;
      }

      // Notificaciones de pago recurrente completado con éxito
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id;
        if (!subscriptionId) break;

        const dbSub = await prisma.subscription.findUnique({
          where: { providerSubscriptionId: subscriptionId },
        });

        if (dbSub) {
          const newPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await prisma.$transaction(async (tx) => {
            await tx.subscription.update({
              where: { providerSubscriptionId: subscriptionId },
              data: {
                status: 'ACTIVE',
                currentPeriodEnd: newPeriodEnd,
                updatedAt: new Date(),
              },
            });

            const planType = PAYPAL_PLAN_MAP[dbSub.priceId];
            if (planType) {
              await tx.workspace.update({
                where: { id: dbSub.workspaceId },
                data: {
                  plan: planType,
                },
              });
            }
          });
        }
        break;
      }

      // Notificaciones de cancelación, suspensión o expiración de planes
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = resource.id;
        const status = resource.status;

        const dbSub = await prisma.subscription.findUnique({
          where: { providerSubscriptionId: subscriptionId },
        });

        if (dbSub) {
          await prisma.$transaction(async (tx) => {
            await tx.subscription.update({
              where: { providerSubscriptionId: subscriptionId },
              data: {
                status: status,
                updatedAt: new Date(),
              },
            });

            // Degradamos la cuenta del cliente a plan TRIAL cuando la suscripción se cancela/expira
            await tx.workspace.update({
              where: { id: dbSub.workspaceId },
              data: {
                plan: 'TRIAL',
              },
            });
          });
        }
        break;
      }

      default:
        console.log(`Evento de webhook de PayPal no registrado en lógica: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error procesando webhook de PayPal:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al procesar webhook.' },
      { status: 500 }
    );
  }
}
