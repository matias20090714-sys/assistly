import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBotResponse } from '@/services/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botId, conversationId, message, history } = body;

    if (!botId) {
      return NextResponse.json(
        { error: 'El parámetro botId es requerido.' },
        { status: 400 }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (botId !== 'demo' && !uuidRegex.test(botId)) {
      return NextResponse.json(
        { error: 'El parámetro botId provisto tiene un formato de UUID inválido.' },
        { status: 400 }
      );
    }

    if (conversationId && !uuidRegex.test(conversationId)) {
      return NextResponse.json(
        { error: 'El parámetro conversationId provisto tiene un formato de UUID inválido.' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío.' },
        { status: 400 }
      );
    }

    // --- CASO DE DEMOSTRACIÓN (DEMO) ---
    if (botId === 'demo') {
      const activeConversationId = conversationId || 'demo-session';
      const response = await generateBotResponse('demo', activeConversationId, message, history);
      return NextResponse.json({
        success: true,
        conversationId: activeConversationId,
        response: response || 'No tengo esa información. ¿Deseas que un asesor del negocio te ayude?',
        status: 'BOT',
      });
    }

    // --- CASO DE BOT REAL ---
    let activeConversationId = conversationId;

    // 1. Si no hay conversación activa, crear una nueva
    if (!activeConversationId) {
      // Validar si el bot existe
      const botExists = await prisma.bot.findUnique({
        where: { id: botId },
      });

      if (!botExists) {
        return NextResponse.json(
          { error: 'El bot especificado no existe.' },
          { status: 404 }
        );
      }

      const randomCustId = `visitante_${Math.floor(1000 + Math.random() * 9000)}`;

      const newConv = await prisma.conversation.create({
        data: {
          botId,
          customerIdentifier: randomCustId,
          customerEmail: null,
          status: 'ACTIVE',
        },
      });

      activeConversationId = newConv.id;
    }

    // 2. Invocar el motor de IA (que guarda los mensajes de USER y BOT en la BD)
    const response = await generateBotResponse(botId, activeConversationId, message, history);

    return NextResponse.json({
      success: true,
      conversationId: activeConversationId,
      response: response || 'Atención en pausa por intervención humana. Un asesor responderá pronto.',
      status: response ? 'BOT' : 'HUMAN',
    });
  } catch (err: any) {
    console.error('Error en API chat:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
