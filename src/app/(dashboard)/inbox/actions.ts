'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { ConversationStatus, SenderType } from '@prisma/client';

export async function sendMessage(conversationId: string, content: string) {
  if (!conversationId) throw new Error('El ID de la conversación es requerido.');
  if (!content.trim()) throw new Error('El contenido del mensaje no puede estar vacío.');

  // 1. Crear el mensaje del Agente
  const message = await prisma.message.create({
    data: {
      conversationId,
      content,
      sender: 'AGENT', // Respuesta manual humana
    },
  });

  // 2. Actualizar la conversación: colocar en PAUSED (control manual) y actualizar fecha
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: 'PAUSED', // Pausar IA automáticamente al enviar mensaje manual
      updatedAt: new Date(),
    },
  });

  revalidatePath('/dashboard/inbox');
  return { success: true, message };
}

export async function toggleBotControl(conversationId: string, pause: boolean) {
  if (!conversationId) throw new Error('El ID de la conversación es requerido.');

  const newStatus: ConversationStatus = pause ? 'PAUSED' : 'ACTIVE';

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  revalidatePath('/dashboard/inbox');
  return { success: true };
}

// Inicializa datos de prueba si no existen conversaciones en la base de datos
export async function seedConversations(botId: string) {
  if (!botId) throw new Error('El ID del bot es requerido.');

  const count = await prisma.conversation.count({
    where: { botId },
  });

  if (count > 0) {
    return { success: false, message: 'Ya existen conversaciones en la base de datos.' };
  }

  // Conversación 1: Cliente 1 (IA activa)
  const conv1 = await prisma.conversation.create({
    data: {
      botId,
      customerIdentifier: 'cust_1111',
      customerEmail: 'soporte@cliente.com',
      status: 'ACTIVE',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        content: 'Hola, ¿cómo puedo ver mis facturas descargadas?',
        sender: 'USER',
        createdAt: new Date(Date.now() - 3600000 * 2), // Hace 2 horas
      },
      {
        conversationId: conv1.id,
        content: '¡Hola! Para descargar tus facturas, dirígete a la pestaña "Facturación" dentro del menú de Configuración en Assistly, e ingresa al portal de Stripe.',
        sender: 'BOT',
        createdAt: new Date(Date.now() - 3600000 * 2 + 5000), // Hace 2 horas, 5 segs después
      },
    ],
  });

  // Conversación 2: Cliente 2 (IA pausada - Humano al control)
  const conv2 = await prisma.conversation.create({
    data: {
      botId,
      customerIdentifier: 'cust_2222',
      customerEmail: 'ventas@interesado.com',
      status: 'PAUSED',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        content: 'Hola, me interesa contratar el Plan Pro de $19 dólares. ¿Ofrecen descuentos anuales?',
        sender: 'USER',
        createdAt: new Date(Date.now() - 600000), // Hace 10 min
      },
      {
        conversationId: conv2.id,
        content: '¡Hola! El Plan Pro incluye bots ilimitados y soporte. Respecto a los descuentos anuales, déjame consultar con un asesor de ventas para que te responda en este chat.',
        sender: 'BOT',
        createdAt: new Date(Date.now() - 595000), // Hace 10 min
      },
      {
        conversationId: conv2.id,
        content: 'Perfecto, quedo a la espera. ¿Hay alguien disponible?',
        sender: 'USER',
        createdAt: new Date(Date.now() - 300000), // Hace 5 min
      },
    ],
  });

  // Conversación 3: Cliente 3 (IA activa)
  const conv3 = await prisma.conversation.create({
    data: {
      botId,
      customerIdentifier: 'cust_3333',
      customerEmail: 'info@local.com',
      status: 'ACTIVE',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv3.id,
        content: '¿A qué hora abren los sábados?',
        sender: 'USER',
        createdAt: new Date(Date.now() - 3600000 * 5), // Hace 5 horas
      },
      {
        conversationId: conv3.id,
        content: 'Nuestros horarios de atención para los sábados son de 9:00 AM a 8:00 PM. ¡Te esperamos!',
        sender: 'BOT',
        createdAt: new Date(Date.now() - 3600000 * 5 + 8000),
      },
    ],
  });

  revalidatePath('/dashboard/inbox');
  return { success: true };
}
