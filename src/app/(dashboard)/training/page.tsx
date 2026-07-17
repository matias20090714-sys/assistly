import * as React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { TrainingClient } from '@/components/dashboard/training-client';

export default async function TrainingPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/login');
  }

  // Obtener espacio de trabajo y bot
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      user: {
        clerkUserId,
      },
    },
    include: {
      workspace: {
        include: {
          bots: true,
        },
      },
    },
  });

  if (!membership || !membership.workspace || !membership.workspace.bots[0]) {
    redirect('/onboarding');
  }

  const bot = membership.workspace.bots[0];

  // Obtener documentos (conocimiento) del bot
  const documents = await prisma.document.findMany({
    where: {
      botId: bot.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enseñar a Assistly</h1>
        <p className="text-muted-foreground text-sm font-light mt-1">
          Alimenta de conocimiento a tu bot cargando manuales, FAQs o indexando tu sitio web para que aprenda a responder.
        </p>
      </div>

      <TrainingClient botId={bot.id} initialDocuments={documents} />
    </div>
  );
}
