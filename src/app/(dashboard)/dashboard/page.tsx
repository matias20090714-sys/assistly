import * as React from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import {
  Bot,
  MessageSquare,
  Database,
  Users,
  CreditCard,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Code2,
  Zap,
} from 'lucide-react';

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/login');
  }

  // Obtener espacio de trabajo, bot y recuentos
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

  if (!membership || !membership.workspace) {
    redirect('/onboarding');
  }

  const workspace = membership.workspace;
  const bot = workspace.bots[0]; // Bot por defecto creado en Onboarding

  // Ejecutar consultas de estadísticas si el bot existe
  let totalConversations = 0;
  let uniqueCustomers = 0;
  let totalDocuments = 0;
  let recentConversations: any[] = [];
  let recentDocuments: any[] = [];

  if (bot) {
    const [convCount, docsCount, conversations, documents] = await Promise.all([
      prisma.conversation.count({
        where: { botId: bot.id },
      }),
      prisma.document.count({
        where: { botId: bot.id },
      }),
      prisma.conversation.findMany({
        where: { botId: bot.id },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.document.findMany({
        where: { botId: bot.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    totalConversations = convCount;
    totalDocuments = docsCount;
    recentConversations = conversations;
    recentDocuments = documents;

    // Calcular clientes únicos
    const distinctCustomers = await prisma.conversation.findMany({
      where: { botId: bot.id },
      distinct: ['customerIdentifier'],
    });
    uniqueCustomers = distinctCustomers.length;
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground text-sm font-light mt-1">
            Bienvenido a {workspace.name}. Aquí tienes un resumen de la actividad de tu asistente virtual.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Plan {workspace.plan}
          </span>
        </div>
      </div>

      {/* Banner de Bienvenida Post-Onboarding */}
      {totalConversations === 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(to_right,rgba(109,94,246,0.1),transparent)] p-6 shadow-md">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,rgba(109,94,246,0.1),transparent)] pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Asistente IA Configurado</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                ¡Tu asistente virtual ya fue creado con éxito! 🎉
              </h2>
              <p className="text-sm text-muted-foreground font-light max-w-2xl">
                Su núcleo inicial está activado. El siguiente paso es enseñarle más detalles sobre tu negocio cargando documentos, PDFs o tu sitio web para que aprenda a responder.
              </p>
            </div>
            <Link
              href="/training"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-95 shrink-0"
            >
              <span>Enseñar sobre mi negocio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Chats Totales */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversaciones</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{totalConversations}</span>
            <p className="text-xs text-muted-foreground font-light mt-1">Chats atendidos por la IA</p>
          </div>
        </div>

        {/* Clientes Únicos */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clientes Únicos</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{uniqueCustomers}</span>
            <p className="text-xs text-muted-foreground font-light mt-1">Visitantes que han interactuado</p>
          </div>
        </div>

        {/* Conocimiento Cargado */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conocimiento</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{totalDocuments}</span>
            <p className="text-xs text-muted-foreground font-light mt-1">Fuentes de datos activas</p>
          </div>
        </div>

        {/* Suscripción SaaS */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suscripción</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold truncate block">
              {workspace.plan === 'TRIAL'
                ? 'Prueba (Trial)'
                : workspace.plan === 'STARTER'
                ? 'Plan Starter'
                : workspace.plan === 'PRO'
                ? 'Plan Pro'
                : workspace.plan === 'BUSINESS'
                ? 'Plan Business'
                : 'Suscripción Expirada'}
            </span>
            <p className="text-xs text-muted-foreground font-light mt-1.5">Límite mensual: 50 chats</p>
          </div>
        </div>
      </div>

      {/* Fila Central: Estado de la IA y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Estado de la IA */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
                <h2 className="text-lg font-semibold">Estado del Asistente Virtual</h2>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                bot?.isActive 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${bot?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {bot?.isActive ? 'Online y Activo' : 'Pausado'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Nombre de la IA</p>
                <p className="font-semibold text-foreground">{bot?.name || 'No configurado'}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Mensaje de Bienvenida</p>
                <p className="text-foreground italic font-light">"{bot?.greetingMessage}"</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-light">Color del widget: <span className="font-mono text-foreground font-semibold">{bot?.themeColor}</span></span>
            <Link
              href="/chatbots"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 font-semibold"
            >
              <span>Personalizar asistente</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
            <div className="space-y-3">
              <Link
                href="/training"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-accent transition-colors group text-sm"
              >
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-violet-500" />
                  <span className="font-medium text-slate-300 group-hover:text-foreground">Cargar más PDFs</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/inbox"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-accent transition-colors group text-sm"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-slate-300 group-hover:text-foreground">Ir al Inbox de Chats</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-accent transition-colors group text-sm"
              >
                <div className="flex items-center gap-3">
                  <Code2 className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-slate-300 group-hover:text-foreground">Obtener código embebible</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-border mt-6">
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-blue-400">¿Necesitas automatizar WhatsApp?</p>
                <p className="text-slate-400 font-light mt-0.5">El soporte para canales externos estará disponible pronto en planes Pro.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fila Inferior: Conocimiento Cargado y Conversaciones Recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Conocimiento Cargado */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Conocimiento Cargado</h2>
              <Link href="/training" className="text-xs text-blue-500 hover:text-blue-400 font-semibold">
                Ver todas
              </Link>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground font-light">
                No hay documentos cargados para entrenamiento.
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <Database className="h-4 w-4 text-violet-500 shrink-0" />
                      <span className="font-medium truncate max-w-[200px]">{doc.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Listo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversaciones Recientes */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Últimas Conversaciones</h2>
              <Link href="/inbox" className="text-xs text-blue-500 hover:text-blue-400 font-semibold">
                Ver inbox
              </Link>
            </div>

            {recentConversations.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl bg-muted/10 flex flex-col items-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-foreground">Aún no hay chats</p>
                <p className="text-xs text-muted-foreground font-light mt-1 max-w-[250px] text-center">
                  Copia el script de Assistly en tu sitio web para recibir las primeras conversaciones.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversations.map((conv) => {
                  const lastMsg = conv.messages[0]?.content || 'Sin mensajes';
                  return (
                    <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50 text-sm">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="font-semibold truncate text-xs sm:text-sm">{conv.customerEmail || conv.customerIdentifier}</p>
                        <p className="text-xs text-muted-foreground truncate font-light mt-0.5">"{lastMsg}"</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-light">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
