import * as React from 'react';
import prisma from '@/lib/prisma';
import { ChatWidgetClient } from '@/components/widget/chat-widget-client';

export default async function WidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ botId?: string }>;
}) {
  const { botId } = await searchParams;

  let bot = null;

  if (botId) {
    // Validar formato UUID para evitar errores de base de datos
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(botId)) {
      bot = await prisma.bot.findUnique({
        where: { id: botId },
        include: {
          workspace: true,
        },
      });
    }
  }

  const businessName = bot?.workspace?.name || 'Asistente Demo';
  const greetingMessage =
    bot?.greetingMessage ||
    '¡Hola! Soy tu asistente inteligente de demostración. ¿En qué puedo ayudarte hoy?';
  const themeColor = bot?.themeColor || '#6D5EF6';

  return (
    <ChatWidgetClient
      botId={botId || 'demo'}
      businessName={businessName}
      greetingMessage={greetingMessage}
      themeColor={themeColor}
    />
  );
}
