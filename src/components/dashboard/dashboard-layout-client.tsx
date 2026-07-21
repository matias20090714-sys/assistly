'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  Database,
  Settings,
  Menu,
  X,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chatbots', href: '/chatbots', icon: Bot },
  { name: 'Entrenamiento', href: '/training', icon: Database },
  { name: 'Conversaciones', href: '/inbox', icon: MessageSquare },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function DashboardLayoutClient({
  children,
  workspaceName,
  trialDaysRemaining,
}: {
  children: React.ReactNode;
  workspaceName: string;
  trialDaysRemaining?: number | null;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen h-[100dvh] bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/10">
            <span className="font-extrabold text-sm font-sans text-white">A</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Assistly</span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3 shrink-0">
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-light font-sans">
            <Link href="/help" className="hover:text-foreground transition-colors">
              Centro de Ayuda
            </Link>
            <div className="flex gap-2">
              <Link href="/terms" className="hover:text-foreground transition-colors">Términos</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidad</Link>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground/60 font-light font-mono">Versión 0.1.0 (MVP)</div>
        </div>
      </aside>

      {/* Sidebar - Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-extrabold text-sm font-sans text-white">A</span>
            </div>
            <span className="font-bold text-lg">Assistly</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md hover:bg-accent text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3 shrink-0">
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-light font-sans">
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              Centro de Ayuda
            </Link>
            <div className="flex gap-2">
              <Link
                href="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-foreground transition-colors"
              >
                Términos
              </Link>
              <span>•</span>
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-foreground transition-colors"
              >
                Privacidad
              </Link>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground/60 font-light font-mono">Versión 0.1.0 (MVP)</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-md hover:bg-accent text-foreground md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Breadcrumb Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-light">
              <span>Workspace</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{workspaceName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8 rounded-lg border border-border shadow-sm',
                },
              }}
            />
          </div>
        </header>

        {/* Dynamic Page view wrapper */}
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-muted/20 p-2 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full flex-1 min-h-0 flex flex-col space-y-2 md:space-y-6">
            {trialDaysRemaining !== null && trialDaysRemaining !== undefined && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs sm:text-sm font-medium animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                  <span>Tu prueba gratuita del plan Starter termina en {trialDaysRemaining} {trialDaysRemaining === 1 ? 'día' : 'días'}.</span>
                </div>
                <Link
                  href="/settings?tab=account"
                  className="px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary/95 transition-all shadow-md shrink-0 ml-4"
                >
                  Activar Plan Completo
                </Link>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
