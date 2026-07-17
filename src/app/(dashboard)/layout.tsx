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

  return (
    <DashboardLayoutClient workspaceName={membership.workspace.name}>
      {children}
    </DashboardLayoutClient>
  );
}
