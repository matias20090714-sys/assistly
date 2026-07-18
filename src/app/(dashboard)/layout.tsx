import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/login');
  }

  // Buscar si el usuario local existe y tiene un negocio asociado
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      user: {
        clerkUserId: clerkUserId,
      },
    },
    include: {
      workspace: true,
    },
  });

  // Si no tiene negocio asociado (primer login), redirigir al Onboarding
  if (!membership || !membership.workspace) {
    redirect('/onboarding');
  }

  // Buscar si posee una suscripción de prueba activa (TRIAL)
  let trialDaysRemaining: number | null = null;

  if (membership && membership.workspace) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        workspaceId: membership.workspace.id,
        status: 'TRIAL',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (activeSubscription) {
      const nowTime = Date.now();
      const endTime = activeSubscription.currentPeriodEnd.getTime();

      if (endTime <= nowTime) {
        // Si el período de 7 días expiró, degradamos el plan del workspace a EXPIRED
        if (membership.workspace.plan === 'STARTER') {
          await prisma.workspace.update({
            where: { id: membership.workspace.id },
            data: { plan: 'EXPIRED' },
          });
          membership.workspace.plan = 'EXPIRED';
        }
      } else {
        const diffTime = endTime - nowTime;
        trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    }
  }

  return (
    <DashboardLayoutClient 
      workspaceName={membership?.workspace?.name || 'Mi Negocio'}
      trialDaysRemaining={trialDaysRemaining}
    >
      {children}
    </DashboardLayoutClient>
  );
}
