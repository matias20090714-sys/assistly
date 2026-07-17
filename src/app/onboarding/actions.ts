'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export interface OnboardingData {
  businessName: string;
  category: string;
  description: string;
  schedule: string;
  services: string;
  contactEmail: string;
  contactPhone: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios por -
    .replace(/[^\w\-]+/g, '') // Eliminar caracteres no válidos
    .replace(/\-\-+/g, '-') // Reemplazar múltiples - por uno solo
    .replace(/^-+/, '') // Quitar guiones al inicio
    .replace(/-+$/, ''); // Quitar guiones al final
}

export async function submitOnboarding(data: OnboardingData) {
  const { userId: clerkUserId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkUserId || !clerkUser) {
    throw new Error('No estás autenticado.');
  }

  const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
  const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuario';

  // 1. Obtener o crear el usuario local
  let dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkUserId,
        email: userEmail,
        name: userName,
      },
    });
  }

  // Generar un slug único para el Workspace
  const baseSlug = slugify(data.businessName) || 'mi-negocio';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findUnique({
      where: { slug },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // 2. Transacción de creación: Workspace, Miembro, Bot, y Documento Inicial
  await prisma.$transaction(async (tx) => {
    // Crear el Workspace con la categoría
    const workspace = await tx.workspace.create({
      data: {
        name: data.businessName,
        slug,
        category: data.category,
        plan: 'TRIAL',
      },
    });

    // Crear la relación del usuario como OWNER del Workspace
    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: dbUser.id,
        role: 'OWNER',
      },
    });

    // Crear el Bot por defecto para el negocio
    const bot = await tx.bot.create({
      data: {
        workspaceId: workspace.id,
        name: 'Asistente Virtual',
        greetingMessage: `¡Hola! Bienvenido a ${data.businessName}. ¿En qué puedo ayudarte hoy hoy?`,
        systemPrompt: `Eres un asistente virtual de soporte inteligente para ${data.businessName}. Tu objetivo es responder dudas basadas exclusivamente en la información provista. Si no conoces la respuesta, solicita amablemente los datos de contacto del cliente.`,
        themeColor: '#6D5EF6', // Color primario de ASSISTLY
        isActive: true,
      },
    });

    // Crear el Documento Inicial de Entrenamiento (TEXT) con los datos del Onboarding
    const trainingText = `
Información General de la Empresa:
Nombre del negocio: ${data.businessName}
Categoría: ${data.category}
Descripción: ${data.description}
Horario de atención: ${data.schedule}
Servicios o Productos principales: ${data.services}
Email de contacto: ${data.contactEmail}
Teléfono de contacto: ${data.contactPhone}
    `.trim();

    await tx.document.create({
      data: {
        botId: bot.id,
        type: 'TEXT',
        name: 'Información Inicial de Onboarding',
        content: trainingText,
        status: 'COMPLETED', // Ya procesado
      },
    });
  });

  // Redirigir al dashboard tras completar la creación
  redirect('/dashboard');
}
