'use client';

import * as React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Bot, Shield, Zap, Database, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navegación Superior */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <span className="font-extrabold text-xl font-sans text-white">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
              Assistly
            </span>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Características</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-foreground transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 hover:shadow-primary/10 active:scale-95"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-primary-foreground),transparent)] opacity-10 dark:opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>Presentamos Assistly MVP</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-none">
            Your AI employee for{' '}
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              every business.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Crea, entrena e inserta un widget de chat inteligente en tu web en cuestión de minutos. Deja que la IA responda las consultas de tus clientes sin interrupciones.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/95 hover:shadow-primary/10 active:scale-98 w-full sm:w-auto"
            >
              Crear Bot Gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button
              onClick={() => {
                const btn = document.querySelector('.assistly-widget-btn') as HTMLButtonElement;
                if (btn) btn.click();
              }}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-6 font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-98 w-full sm:w-auto cursor-pointer"
            >
              Ver Demostración
            </button>
          </div>
        </div>
      </section>

      {/* Características (Bento Grid) */}
      <section id="features" className="py-20 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Todo lo que necesitas para automatizar tu soporte
            </h2>
            <p className="mt-4 text-muted-foreground font-light">
               Assistly extrae conocimiento de tus fuentes y responde con precisión quirúrgica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tarjeta 1 */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/30">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entrenamiento RAG</h3>
              <p className="text-muted-foreground text-sm font-light">
                Sube catálogos en PDF, políticas en texto o simplemente ingresa tu URL para extraer los datos del sitio de manera automática.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/30">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Widget de Chat</h3>
              <p className="text-muted-foreground text-sm font-light">
                Inserta una sola línea de código en tu HTML, WordPress o Shopify para activar el chat de soporte flotante premium.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="flex flex-col p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/30">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aislamiento & Seguridad</h3>
              <p className="text-muted-foreground text-sm font-light">
                Asegura que tu bot solo se ejecute en los dominios web autorizados y mantén tus conversaciones 100% aisladas y encriptadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planes y Precios */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Planes simples, sin sorpresas
            </h2>
            <p className="mt-4 text-muted-foreground font-light">
              Comienza gratis hoy mismo y escala a medida que tu negocio crece.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Starter */}
            <div className="flex flex-col p-8 rounded-3xl border border-border bg-card text-card-foreground relative overflow-hidden">
              <div className="mb-6">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-muted-foreground text-sm mt-1">Ideal para pequeños negocios</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">$9.99</span>
                  <span className="text-muted-foreground ml-1 text-sm">/ mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-grow">
                <li className="flex items-center gap-2">✓ 1 Bot Activo</li>
                <li className="flex items-center gap-2">✓ 200 Chats al mes</li>
                <li className="flex items-center gap-2">✓ Carga de FAQs y PDFs</li>
                <li className="flex items-center gap-2">✗ Carga de URLs (Crawler)</li>
              </ul>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 font-medium text-foreground transition-all hover:bg-accent active:scale-98"
              >
                Comenzar con Starter
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="flex flex-col p-8 rounded-3xl border-2 border-primary bg-card text-card-foreground relative overflow-hidden shadow-lg shadow-primary/5">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-xl text-xs font-semibold uppercase tracking-wide">
                Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold">Plan Pro</h3>
                <p className="text-muted-foreground text-sm mt-1">Para negocios en crecimiento</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">$19.99</span>
                  <span className="text-muted-foreground ml-1 text-sm">/ mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-grow">
                <li className="flex items-center gap-2 text-foreground font-medium">✓ 3 Bots Activos</li>
                <li className="flex items-center gap-2 text-foreground font-medium">✓ 1000 Chats al mes</li>
                <li className="flex items-center gap-2 text-foreground font-medium">✓ PDFs y URL Crawler</li>
                <li className="flex items-center gap-2 text-foreground font-medium">✓ Personalización Visual</li>
              </ul>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-98"
              >
                Obtener Plan Pro
              </Link>
            </div>

            {/* Plan Business */}
            <div className="flex flex-col p-8 rounded-3xl border border-border bg-card text-card-foreground relative overflow-hidden">
              <div className="mb-6">
                <h3 className="text-2xl font-bold">Business</h3>
                <p className="text-muted-foreground text-sm mt-1">Para grandes volúmenes y corporativos</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">$49.99</span>
                  <span className="text-muted-foreground ml-1 text-sm">/ mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-grow">
                <li className="flex items-center gap-2">✓ 10 Bots Activos</li>
                <li className="flex items-center gap-2">✓ 10000 Chats al mes</li>
                <li className="flex items-center gap-2">✓ Todas las fuentes</li>
                <li className="flex items-center gap-2">✓ Soporte prioritario</li>
              </ul>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 font-medium text-foreground transition-all hover:bg-accent active:scale-98"
              >
                Comenzar con Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-muted/40 py-8">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Assistly. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Términos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
      <script src="/widget.js?v=3" data-bot-id="demo" defer></script>
    </div>
  );
}
