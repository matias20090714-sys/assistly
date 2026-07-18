import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'El ID del workspace es requerido.' }, { status: 400 });
    }

    // Verificar si ya cuenta con alguna suscripción previa (evita abuso del trial)
    const existingSub = await prisma.subscription.findFirst({
      where: { workspaceId },
    });

    if (existingSub) {
      return NextResponse.json(
        { error: 'Este espacio de trabajo ya ha disfrutado de una prueba gratuita o posee una suscripción activa.' },
        { status: 400 }
      );
    }

    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días de duración

    await prisma.$transaction(async (tx) => {
      // Crear registro de suscripción en estado de prueba (TRIAL)
      await tx.subscription.create({
        data: {
          workspaceId,
          providerSubscriptionId: `trial_starter_${workspaceId}`,
          providerName: 'paypal',
          status: 'TRIAL',
          priceId: 'P-5YT747867K2659343NJNPIQY', // PayPal Plan ID de Starter
          currentPeriodEnd: trialEnd,
        },
      });

      // Actualizar el plan del workspace a Starter
      await tx.workspace.update({
        where: { id: workspaceId },
        data: {
          plan: 'STARTER',
          billingSubscriptionId: `trial_starter_${workspaceId}`,
        },
      });
    });

    return NextResponse.json({ success: true, trialEnd });
  } catch (err: any) {
    console.error('Error al iniciar prueba gratuita del plan Starter:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor al procesar la prueba gratuita.' },
      { status: 500 }
    );
  }
}
