import prisma from '@/lib/prisma';
import { PlanType } from '@prisma/client';

export interface PlanLimits {
  name: string;
  maxBots: number;
  maxMonthlyChats: number;
  allowedSources: ('TEXT' | 'FAQ' | 'PDF' | 'URL')[];
  features: ('CORS_SECURITY' | 'CUSTOM_THEMES' | 'PRIORITY_SUPPORT' | 'AI_RAG')[];
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  TRIAL: {
    name: 'Prueba (Trial)',
    maxBots: 1,
    maxMonthlyChats: 50,
    allowedSources: ['TEXT', 'FAQ'],
    features: ['AI_RAG'],
  },
  STARTER: {
    name: 'Starter',
    maxBots: 1,
    maxMonthlyChats: 200,
    allowedSources: ['TEXT', 'FAQ', 'PDF'],
    features: ['AI_RAG', 'CORS_SECURITY'],
  },
  PRO: {
    name: 'Pro',
    maxBots: 3,
    maxMonthlyChats: 1000,
    allowedSources: ['TEXT', 'FAQ', 'PDF', 'URL'],
    features: ['AI_RAG', 'CORS_SECURITY', 'CUSTOM_THEMES'], // wait, CUSTOM_THEMES!
  },
  BUSINESS: {
    name: 'Business',
    maxBots: 10,
    maxMonthlyChats: 10000,
    allowedSources: ['TEXT', 'FAQ', 'PDF', 'URL'],
    features: ['AI_RAG', 'CORS_SECURITY', 'CUSTOM_THEMES', 'PRIORITY_SUPPORT'],
  },
  EXPIRED: {
    name: 'Expirado',
    maxBots: 0,
    maxMonthlyChats: 0,
    allowedSources: [],
    features: [],
  },
};

// Obtiene los límites asociados a un plan específico
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.TRIAL;
}

// Obtiene los límites del plan contratado por un espacio de trabajo
export async function getWorkspaceLimits(workspaceId: string): Promise<PlanLimits> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });

  if (!workspace) {
    return PLAN_LIMITS.TRIAL;
  }

  return getPlanLimits(workspace.plan);
}

// Verifica si un espacio de trabajo tiene acceso a una característica específica
export async function canWorkspaceUseFeature(
  workspaceId: string,
  feature: 'CORS_SECURITY' | 'CUSTOM_THEMES' | 'PRIORITY_SUPPORT' | 'AI_RAG' | 'PDF_TRAINING' | 'URL_TRAINING'
): Promise<boolean> {
  const limits = await getWorkspaceLimits(workspaceId);

  // Mapear fuentes específicas a características
  if (feature === 'PDF_TRAINING') {
    return limits.allowedSources.includes('PDF');
  }
  if (feature === 'URL_TRAINING') {
    return limits.allowedSources.includes('URL');
  }

  // Características directas
  return limits.features.includes(feature as any);
}

// Verifica si un espacio de trabajo ha superado su límite mensual de conversaciones
export async function hasExceededMonthlyChatLimit(workspaceId: string): Promise<boolean> {
  const limits = await getWorkspaceLimits(workspaceId);

  // Obtener el inicio del mes actual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Contar conversaciones creadas este mes para los bots del workspace
  const chatCount = await prisma.conversation.count({
    where: {
      bot: {
        workspaceId,
      },
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  return chatCount >= limits.maxMonthlyChats;
}

// Hook de simulación para verificar si se puede agregar un bot nuevo
export async function canAddBot(workspaceId: string): Promise<boolean> {
  const limits = await getWorkspaceLimits(workspaceId);

  const botCount = await prisma.bot.count({
    where: { workspaceId },
  });

  return botCount < limits.maxBots;
}
