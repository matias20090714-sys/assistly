import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBotResponse } from '@/services/ai';
import { PLAN_LIMITS } from '@/services/subscription';

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
    // 1. Validar el bot y su plan
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        workspace: true,
      },
    });

    if (!bot) {
      return NextResponse.json(
        { error: 'El bot especificado no existe.' },
        { status: 404 }
      );
    }

    const plan = bot.workspace.plan;

    // Si el plan expiró, retornar mensaje de error del bot bloqueado
    if (plan === 'EXPIRED') {
      return NextResponse.json({
        success: true,
        conversationId: conversationId || 'expired',
        response: 'El período de prueba de este asistente virtual ha finalizado. Para reactivarlo, por favor actualiza la suscripción en el panel de control de Assistly.',
        status: 'BOT',
      });
    }

    // Contar chats mensuales de este workspace en el mes actual para verificar límites
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const chatsCount = await prisma.conversation.count({
      where: {
        bot: { workspaceId: bot.workspaceId },
        createdAt: { gte: startOfMonth },
      },
    });

    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.TRIAL;

    if (chatsCount >= limits.maxMonthlyChats) {
      return NextResponse.json({
        success: true,
        conversationId: conversationId || 'limit-reached',
        response: 'Lo sentimos, este asistente ha alcanzado el límite de conversaciones mensuales de su plan. Por favor, intenta de nuevo el próximo mes o contacta al negocio por otros canales.',
        status: 'BOT',
      });
    }

    let activeConversationId = conversationId;

    // 2. Si no hay conversación activa, crear una nueva
    if (!activeConversationId) {
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

    // 3. Invocar el motor de IA (que guarda los mensajes de USER y BOT en la BD)
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
