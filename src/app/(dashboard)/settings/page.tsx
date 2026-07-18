import * as React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { SettingsClient } from '@/components/dashboard/settings-client';

export default async function SettingsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/login');
  }

  // Obtener espacio de trabajo con bots, y usuario local
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      user: {
        clerkUserId,
      },
    },
    include: {
      user: true,
      workspace: {
        include: {
          bots: true,
        },
      },
    },
  });

  if (!membership || !membership.workspace || !membership.user) {
    redirect('/onboarding');
  }

  const trialSub = await prisma.subscription.findFirst({
    where: {
      workspaceId: membership.workspace.id,
      priceId: 'P-5YT747867K2659343NJNPIQY',
    },
  });

  const workspace = {
    id: membership.workspace.id,
    name: membership.workspace.name,
    slug: membership.workspace.slug,
    category: membership.workspace.category,
    plan: membership.workspace.plan,
    hasUsedTrial: !!trialSub,
    botId: membership.workspace.bots[0]?.id || '',
  };

  const user = {
    name: membership.user.name,
    email: membership.user.email,
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-sans">Ajustes de la Cuenta</h1>
        <p className="text-muted-foreground text-sm font-light mt-1">
          Administra las preferencias generales de tu negocio, perfil de usuario, facturación y seguridad.
        </p>
      </div>

      <SettingsClient user={user} workspace={workspace} />
    </div>
  );
}
