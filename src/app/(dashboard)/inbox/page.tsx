import * as React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { InboxClient } from '@/components/dashboard/inbox-client';

export default async function InboxPage() {
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

  // Obtener las conversaciones de este bot con sus mensajes correspondientes
  const conversations = await prisma.conversation.findMany({
    where: {
      botId: bot.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return (
    <div className="space-y-2 md:space-y-6 h-full flex flex-col">
      {/* Cabecera (solo en pantallas de escritorio) */}
      <div className="shrink-0 hidden md:block">
        <h1 className="text-3xl font-bold tracking-tight">Bandeja de Entrada</h1>
        <p className="text-muted-foreground text-sm font-light mt-1">
          Supervisa las interacciones de tu bot e interviene pausando la IA en vivo para chatear con tus clientes.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <InboxClient botId={bot.id} initialConversations={conversations} />
      </div>
    </div>
  );
}
