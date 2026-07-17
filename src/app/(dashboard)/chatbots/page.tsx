import * as React from 'react';
import { Bot, Plus, Settings2, Play, AlertCircle } from 'lucide-react';

export default function ChatbotsPage() {
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Chatbots</h1>
          <p className="text-muted-foreground text-sm font-light mt-1">
            Crea, configura y edita las personalidades de tus asistentes virtuales.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/10 transition-all hover:bg-primary/95 active:scale-95">
          <Plus className="h-4 w-4" />
          <span>Crear Nuevo Bot</span>
        </button>
      </div>

      {/* Grid de Chatbots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bot Card 1 */}
        <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Sofía</h3>
                  <span className="text-xs text-muted-foreground font-light">Asistente de Soporte Principal</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Activo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 line-clamp-2 font-light">
              System Prompt: "Eres un asistente virtual de soporte inteligente llamado Sofía. Responde dudas sobre políticas, reembolsos y envíos basados en..."
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
            <span className="text-xs text-muted-foreground">Color de widget: <span className="font-mono text-foreground font-semibold">#2563eb</span></span>
            <div className="flex gap-2">
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent text-foreground transition-all">
                <Settings2 className="h-4 w-4" />
              </button>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent text-foreground transition-all">
                <Play className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bot Card Vacio / Agregar */}
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 flex flex-col items-center justify-center min-h-[220px] text-center hover:bg-muted/40 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-xl bg-accent text-muted-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">Crear Asistente Adicional</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px] font-light">
            Crea un bot adicional para otra sucursal, idioma o línea de negocio específica.
          </p>
        </div>
      </div>

      {/* Alerta de Límite en MVP */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-500 text-sm flex gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Límite de Bots del Plan Gratuito</p>
          <p className="text-xs text-amber-500/80 font-light mt-0.5">
            Actualmente estás usando 1 de 1 bots permitidos en tu plan actual. Si deseas crear más asistentes, considera actualizar a nuestro plan premium.
          </p>
        </div>
      </div>
    </div>
  );
}
