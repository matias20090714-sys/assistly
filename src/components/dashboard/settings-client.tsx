'use client';

import * as React from 'react';
import { useTheme as useNextThemes } from 'next-themes';
import {
  Building,
  User as UserIcon,
  Shield,
  Sliders,
  Settings as SettingsIcon,
  Save,
  CreditCard,
  Trash2,
  Download,
  AlertTriangle,
  Lock,
  Globe,
  Upload,
} from 'lucide-react';

import Script from 'next/script';

interface SettingsClientProps {
  user: {
    name: string | null;
    email: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    plan: string;
    hasUsedTrial: boolean;
  };
}

export function SettingsClient({ user, workspace }: SettingsClientProps) {
  const { theme, setTheme } = useNextThemes();
  const [activeTab, setActiveTab] = React.useState<'general' | 'profile' | 'security' | 'preferences' | 'account'>('general');
  const [paypalLoaded, setPaypalLoaded] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState(workspace.plan);

  React.useEffect(() => {
    // Escuchar si el SDK de PayPal se carga en window
    if ((window as any).paypal) {
      setPaypalLoaded(true);
      return;
    }

    const interval = setInterval(() => {
      if ((window as any).paypal) {
        setPaypalLoaded(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!paypalLoaded || activeTab !== 'account') return;

    const plans = [
      { key: 'STARTER', id: 'P-5YT747867K2659343NJNPIQY' },
      { key: 'PRO', id: 'P-00K90185YF944794SNJNPJ2I' },
      { key: 'BUSINESS', id: 'P-19U157436X5071221NJNPKII' },
    ];

    plans.forEach((p) => {
      const containerId = `paypal-button-${p.key.toLowerCase()}`;
      const container = document.getElementById(containerId);
      if (container) {
        // Limpiar para evitar duplicaciones de botones al cambiar de pestaña
        container.innerHTML = '';
        
        (window as any).paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: p.id,
              custom_id: workspace.id,
            });
          },
          onApprove: async function(data: any, actions: any) {
            try {
              const res = await fetch('/api/subscriptions/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscriptionId: data.subscriptionID,
                  workspaceId: workspace.id,
                }),
              });
              const resData = await res.json();
              if (resData.success) {
                alert(`¡Felicidades! Tu plan ha sido actualizado a ${p.key}.`);
                setCurrentPlan(p.key);
                window.location.reload();
              } else {
                alert(`Error al registrar la suscripción: ${resData.error}`);
              }
            } catch (err) {
              console.error(err);
              alert('Error conectando con el servidor al registrar el pago de PayPal.');
            }
          },
          onError: function(err: any) {
            console.error('PayPal Button Error:', err);
          }
        }).render(`#${containerId}`);
      }
    });
  }, [paypalLoaded, activeTab]);

  // Estados Perfil
  const [profileName, setProfileName] = React.useState(user.name || '');
  const [profileEmail, setProfileEmail] = React.useState(user.email);
  const [businessName, setBusinessName] = React.useState(workspace.name);
  const [businessSlug, setBusinessSlug] = React.useState(workspace.slug);

  // Estados Seguridad
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [enable2FA, setEnable2FA] = React.useState(false);

  // Estados Preferencias
  const [language, setLanguage] = React.useState('es');
  const [timezone, setTimezone] = React.useState('America/Argentina/Buenos_Aires');

  // Guardar General (Simulado)
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Configuración general guardada con éxito.');
  };

  // Guardar Perfil (Simulado)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Perfil y datos de negocio actualizados.');
  };

  // Guardar Seguridad (Simulado)
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && !currentPassword) {
      alert('Debes ingresar la contraseña actual para establecer una nueva.');
      return;
    }
    alert('Preferencias de seguridad actualizadas con éxito.');
    setCurrentPassword('');
    setNewPassword('');
  };

  // Exportar datos (Simulado)
  const handleExportData = () => {
    const dataStr = JSON.stringify({ user, workspace, exportDate: new Date() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `assistly_backup_${workspace.slug}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Eliminar Cuenta (Simulado)
  const handleDeleteAccount = () => {
    const confirmDelete = prompt(
      `ATENCIÓN: Esto eliminará permanentemente tu cuenta y todos los datos asociados de Assistly.\nEscribe "ELIMINAR MI CUENTA" para proceder.`
    );
    if (confirmDelete === 'ELIMINAR MI CUENTA') {
      alert('Tu cuenta está siendo eliminada. Serás redirigido...');
      window.location.href = '/';
    } else if (confirmDelete !== null) {
      alert('Confirmación incorrecta. Cancelando eliminación.');
    }
  };

  const [isStartingTrial, setIsStartingTrial] = React.useState(false);

  const handleStartTrial = async () => {
    if (isStartingTrial) return;
    setIsStartingTrial(true);
    try {
      const res = await fetch('/api/subscriptions/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Prueba gratuita de 7 días del plan Starter activada exitosamente!');
        window.location.reload();
      } else {
        alert(`Error al iniciar la prueba: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor al iniciar la prueba.');
    } finally {
      setIsStartingTrial(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      
      {/* Menú de Pestañas (Navegación de Ajustes) */}
      <aside className="w-full lg:w-64 bg-card border border-border rounded-xl p-3 flex flex-row lg:flex-col gap-1 shrink-0 overflow-x-auto lg:overflow-x-visible select-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
            activeTab === 'general'
              ? 'bg-primary text-white shadow-md shadow-primary/10'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Building className="h-4 w-4 shrink-0" />
          <span>General</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
            activeTab === 'profile'
              ? 'bg-primary text-white shadow-md shadow-primary/10'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <UserIcon className="h-4 w-4 shrink-0" />
          <span>Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
            activeTab === 'security'
              ? 'bg-primary text-white shadow-md shadow-primary/10'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Shield className="h-4 w-4 shrink-0" />
          <span>Seguridad</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
            activeTab === 'preferences'
              ? 'bg-primary text-white shadow-md shadow-primary/10'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Sliders className="h-4 w-4 shrink-0" />
          <span>Preferencias</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
            activeTab === 'account'
              ? 'bg-primary text-white shadow-md shadow-primary/10'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <SettingsIcon className="h-4 w-4 shrink-0" />
          <span>Cuenta</span>
        </button>
      </aside>

      {/* Contenido de Ajustes */}
      <div className="flex-grow w-full">
        
        {/* PESTAÑA: GENERAL */}
        {activeTab === 'general' && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold">Ajustes del Negocio</h2>
              <p className="text-xs text-muted-foreground font-light">Configura los parámetros clave de tu sitio web e integración.</p>
            </div>
            
            <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-lg">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Slug de URL (URL identificadora)</label>
                <div className="flex rounded-lg border border-border bg-muted/30 overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                  <span className="text-xs text-muted-foreground flex items-center px-3 border-r border-border bg-muted/50">assistly.com/</span>
                  <input
                    type="text"
                    value={businessSlug}
                    onChange={(e) => setBusinessSlug(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA: PERFIL */}
        {activeTab === 'profile' && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold">Perfil del Operador</h2>
              <p className="text-xs text-muted-foreground font-light">Administra tu perfil personal y de marca.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              
              {/* Fotos Avatar y Logo */}
              <div className="flex flex-col sm:flex-row gap-6 border-b border-border pb-6">
                {/* Foto Perfil */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Foto de Perfil</span>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                      {profileName.substring(0, 2).toUpperCase() || 'OP'}
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg border border-border bg-background text-[11px] font-semibold text-foreground hover:bg-accent"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Subir Foto</span>
                    </button>
                  </div>
                </div>

                {/* Logo Negocio */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Logo del Negocio</span>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-slate-900 border border-white/5 text-slate-400 flex items-center justify-center font-extrabold text-lg shrink-0">
                      {businessName.substring(0, 2).toUpperCase() || 'CO'}
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg border border-border bg-background text-[11px] font-semibold text-foreground hover:bg-accent"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Subir Logo</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Guardar Perfil</span>
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA: SEGURIDAD */}
        {activeTab === 'security' && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold">Seguridad de la Cuenta</h2>
              <p className="text-xs text-muted-foreground font-light">Actualiza tus credenciales y protege tu cuenta.</p>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-6 max-w-lg">
              
              {/* Cambiar Contraseña */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Cambiar Contraseña</span>
                </h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contraseña Actual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña de min 8 caracteres"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* 2FA */}
              <div className="border-t border-border pt-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Autenticación en Dos Pasos (2FA)</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Añade una capa adicional de seguridad a tu cuenta solicitando un código adicional en cada inicio de sesión.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enable2FA}
                    onChange={(e) => setEnable2FA(e.target.checked)}
                    className="h-4 w-4 text-primary border-border rounded bg-background focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-300">Activar autenticación multifactor (MFA)</span>
                </label>
              </div>

              {/* Cierre Dispositivos */}
              <div className="border-t border-border pt-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Sesiones Activas</h3>
                <p className="text-xs text-muted-foreground font-light">Si has perdido o cambiado de dispositivo, cierra sesión en todos los demás portales.</p>
                <button
                  type="button"
                  onClick={() => alert('Sesiones globales finalizadas con éxito.')}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-semibold text-red-500 hover:bg-red-500/5 transition-all"
                >
                  Cerrar sesión en todos los dispositivos
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Guardar Seguridad</span>
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA: PREFERENCIAS */}
        {activeTab === 'preferences' && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold">Preferencias del Sistema</h2>
              <p className="text-xs text-muted-foreground font-light">Ajusta la interfaz de Assistly a tus necesidades de flujo de trabajo.</p>
            </div>

            <div className="space-y-4 max-w-lg">
              {/* Idioma */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Idioma de la Interfaz</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                >
                  <option value="es">Español (ES)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>

              {/* Tema */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tema Visual</label>
                <select
                  value={theme || 'system'}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="system">Sistema (Predeterminado)</option>
                </select>
              </div>

              {/* Zona Horaria */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Zona Horaria</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                >
                  <option value="America/Argentina/Buenos_Aires">America/Buenos_Aires (GMT-3)</option>
                  <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                  <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: CUENTA */}
        {activeTab === 'account' && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold">Gestión de la Cuenta</h2>
              <p className="text-xs text-muted-foreground font-light">Controla la suscripción actual, exporta tus datos o borra el entorno.</p>
            </div>

            {/* Plan actual */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    Plan actual:{' '}
                    {workspace.plan === 'TRIAL'
                      ? 'Prueba (Trial)'
                      : workspace.plan === 'STARTER'
                      ? 'Starter'
                      : workspace.plan === 'PRO'
                      ? 'Pro'
                      : workspace.plan === 'BUSINESS'
                      ? 'Business'
                      : 'Expirado'}
                  </h4>
                  <p className="text-xs text-muted-foreground font-light mt-0.5">Soporta los límites de tu plan contratado.</p>
                </div>
              </div>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 self-start sm:self-auto uppercase tracking-wide">
                Activo
              </span>
            </div>

            {/* Carga del SDK de PayPal para Subscripciones */}
            <Script
              src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&vault=true&intent=subscription`}
              strategy="lazyOnload"
            />

            {/* Planes de Suscripción de PayPal */}
            <div className="pt-6 border-t border-border space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Planes y Suscripción</h3>
                <p className="text-xs text-muted-foreground font-light">Elige el plan que mejor se adapte a tu volumen y necesidades de negocio.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan Starter */}
                <div className={`p-5 rounded-2xl border bg-card text-card-foreground flex flex-col justify-between relative overflow-hidden ${currentPlan === 'STARTER' ? 'border-primary shadow-sm bg-primary/5' : 'border-border'}`}>
                  {currentPlan === 'STARTER' && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                      Activo
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base">Starter</h4>
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">7 días gratis</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Plan inicial para pequeños negocios</p>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-extrabold">$9.99</span>
                      <span className="text-xs text-muted-foreground ml-1">/ mes</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                      <li>✓ 1 Bot Activo</li>
                      <li>✓ 200 Chats mensuales</li>
                      <li>✓ Soporte para PDFs</li>
                      <li>✓ Funciones Básicas</li>
                    </ul>
                  </div>
                  {currentPlan === 'STARTER' ? (
                    <div className="mt-5 text-center text-xs font-semibold text-primary py-2 bg-primary/10 rounded-lg">
                      Tu plan actual
                    </div>
                  ) : (
                    <div className="mt-5">
                      {!workspace.hasUsedTrial ? (
                        <button
                          type="button"
                          onClick={handleStartTrial}
                          disabled={isStartingTrial}
                          className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all disabled:opacity-50 active:scale-95"
                        >
                          {isStartingTrial ? 'Iniciando...' : 'Iniciar 7 Días Gratis'}
                        </button>
                      ) : (
                        <div id="paypal-button-starter" className="relative z-10" />
                      )}
                    </div>
                  )}
                </div>

                {/* Plan Pro */}
                <div className={`p-5 rounded-2xl border-2 bg-card text-card-foreground flex flex-col justify-between relative overflow-hidden shadow-md ${currentPlan === 'PRO' ? 'border-primary bg-primary/5 shadow-primary/5' : 'border-primary/50'}`}>
                  <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">
                    {currentPlan === 'PRO' ? 'Activo' : 'Más Popular'}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-base">Pro</h4>
                      <p className="text-[11px] text-muted-foreground">Plan recomendado para crecimiento</p>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-extrabold">$19.99</span>
                      <span className="text-xs text-muted-foreground ml-1">/ mes</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                      <li className="text-foreground">✓ 3 Bots Activos</li>
                      <li className="text-foreground">✓ 1000 Chats mensuales</li>
                      <li className="text-foreground">✓ PDFs y URL Crawler</li>
                      <li className="text-foreground">✓ Personalización Visual</li>
                      <li className="text-foreground">✓ Funciones Avanzadas</li>
                    </ul>
                  </div>
                  {currentPlan === 'PRO' ? (
                    <div className="mt-5 text-center text-xs font-semibold text-primary py-2 bg-primary/10 rounded-lg">
                      Tu plan actual
                    </div>
                  ) : (
                    <div className="mt-5">
                      <div id="paypal-button-pro" className="relative z-10" />
                    </div>
                  )}
                </div>

                {/* Plan Business */}
                <div className={`p-5 rounded-2xl border bg-card text-card-foreground flex flex-col justify-between relative overflow-hidden ${currentPlan === 'BUSINESS' ? 'border-primary shadow-sm bg-primary/5' : 'border-border'}`}>
                  {currentPlan === 'BUSINESS' && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                      Activo
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-base">Business</h4>
                      <p className="text-[11px] text-muted-foreground">Para corporaciones y gran volumen</p>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-extrabold">$49.99</span>
                      <span className="text-xs text-muted-foreground ml-1">/ mes</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                      <li>✓ 10 Bots Activos</li>
                      <li>✓ 10000 Chats mensuales</li>
                      <li>✓ Todas las fuentes</li>
                      <li>✓ Soporte prioritario</li>
                      <li>✓ Funciones Completas</li>
                    </ul>
                  </div>
                  {currentPlan === 'BUSINESS' ? (
                    <div className="mt-5 text-center text-xs font-semibold text-primary py-2 bg-primary/10 rounded-lg">
                      Tu plan actual
                    </div>
                  ) : (
                    <div className="mt-5">
                      <div id="paypal-button-business" className="relative z-10" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exportar datos */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold">Respaldo y Exportación de Información</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Descarga un archivo JSON completo que contiene la información de tus documentos de entrenamiento, estadísticas del bot y miembros del espacio de trabajo.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex h-9 items-center justify-center gap-1.5 px-4 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-accent transition-all"
              >
                <Download className="h-4 w-4 text-primary" />
                <span>Exportar Datos en JSON</span>
              </button>
            </div>

            {/* Eliminar cuenta */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10 max-w-2xl">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-red-400">Zona de Riesgo: Eliminar Cuenta de Assistly</p>
                  <p className="text-slate-400 font-light mt-0.5 leading-relaxed">
                    Esta acción es irreversible. Se borrarán permanentemente tu bot, tu workspace, tus documentos cargados y todo el historial de conversaciones de soporte de forma irrevocable.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-red-500 transition-all active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar mi Cuenta Permanentemente</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
