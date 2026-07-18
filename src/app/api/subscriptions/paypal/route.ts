import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPayPalSubscriptionDetails, PAYPAL_PLAN_MAP } from '@/services/paypal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId, workspaceId } = body;

    if (!subscriptionId || !workspaceId) {
      return NextResponse.json(
        { error: 'Parámetros subscriptionId y workspaceId son requeridos.' },
        { status: 400 }
      );
    }

    // 1. Obtener detalles de la suscripción desde la API de PayPal
    const details = await getPayPalSubscriptionDetails(subscriptionId);
    
    // Si la suscripción de PayPal tiene el ID del workspace, lo usamos
    const activeWorkspaceId = details.custom_id || workspaceId;
    const paypalPlanId = details.plan_id;
    const status = details.status;

    const planType = PAYPAL_PLAN_MAP[paypalPlanId];
    if (!planType) {
      return NextResponse.json(
        { error: `El Plan ID de PayPal ${paypalPlanId} no está registrado en el sistema de Assistly.` },
        { status: 400 }
      );
    }

    // Determinar la fecha de fin del período de cobro actual
    const nextBillingTime = details.billing_info?.next_billing_time 
      ? new Date(details.billing_info.next_billing_time)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); //Fallback 30 días

    // 2. Transacción atómica de registro y actualización en Base de Datos
    await prisma.$transaction(async (tx) => {
      // Registrar o actualizar la suscripción
      await tx.subscription.upsert({
        where: { providerSubscriptionId: subscriptionId },
        update: {
          status: status,
          priceId: paypalPlanId,
          currentPeriodEnd: nextBillingTime,
          updatedAt: new Date(),
        },
        create: {
          workspaceId: activeWorkspaceId,
          providerSubscriptionId: subscriptionId,
          providerName: 'paypal',
          status: status,
          priceId: paypalPlanId,
          currentPeriodEnd: nextBillingTime,
        },
      });

      // Si la suscripción está activa, actualizamos el plan del workspace
      if (status === 'ACTIVE') {
        const payerId = details.subscriber?.payer_id || 'paypal_customer';
        await tx.workspace.update({
          where: { id: activeWorkspaceId },
          data: {
            plan: planType,
            billingCustomerId: payerId,
            billingSubscriptionId: subscriptionId,
          },
        });
      }
    });

    return NextResponse.json({ success: true, plan: planType });
  } catch (err: any) {
    console.error('Error en API de registro de PayPal:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor al registrar la suscripción.' },
      { status: 500 }
    );
  }
}
