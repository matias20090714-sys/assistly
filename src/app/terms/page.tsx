import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Luz ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(circle_at_top,rgba(109,94,246,0.06),transparent)] pointer-events-none" />

      {/* Navegación Superior */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <span className="font-extrabold text-xl font-sans">A</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Assistly
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-95"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Cuerpo del Contenido */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        
        {/* Cabecera */}
        <div className="space-y-4 mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la Página de Inicio</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <span>Términos y Condiciones de Uso</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-light">
            <Clock className="h-3.5 w-3.5" />
            <span>Última actualización: 17 de Julio de 2026</span>
          </div>
        </div>

        {/* Cláusulas de los Términos */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-400 font-light leading-relaxed select-text">
          
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">1.</span>
              <span>Aceptación de los Términos</span>
            </h2>
            <p>
              Al registrarte y utilizar la plataforma SaaS de Assistly ("el Servicio"), aceptas quedar vinculado por estos Términos y Condiciones de Uso. Si no estás de acuerdo con alguna de las cláusulas establecidas, no debes registrarte ni consumir nuestros servicios.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">2.</span>
              <span>Uso Permitido del Servicio</span>
            </h2>
            <p>
              Assistly otorga al usuario una licencia revocable, limitada, no exclusiva e intransferible para acceder al panel de control, cargar bases de conocimiento y embeber el widget flotante en los dominios web autorizados de su propiedad comercial. Queda estrictamente prohibido utilizar el servicio para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Alojar o transmitir contenido ilegal, difamatorio, de odio o que infrinja la propiedad intelectual de terceros.</li>
              <li>Someter a la IA (RAG) a cargas de información falsa o abusar del límite de llamadas a la API de OpenAI.</li>
              <li>Intentar realizar ingeniería inversa, hacking o ataques de denegación de servicio (DDoS) contra los servidores de Assistly.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">3.</span>
              <span>Responsabilidad del Usuario</span>
            </h2>
            <p>
              El usuario es el único responsable de la precisión, calidad y legalidad de toda la información comercial que cargue en la base de conocimiento de Assistly (incluyendo archivos PDF y respuestas de FAQ). Asimismo, es responsable de supervisar las conversaciones del Inbox e intervenir de forma manual si la IA responde consultas que requieren derivación especializada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">4.</span>
              <span>Disponibilidad del Servicio y SLA</span>
            </h2>
            <p>
              Aunque nos esforzamos por mantener un tiempo de actividad del 99.9%, Assistly se proporciona "tal cual" y "según disponibilidad". No nos hacemos responsables de las interrupciones del servicio derivadas de cortes de energía en la nube de terceros, caídas de los servidores globales de OpenAI o fallos de conexión a Internet del cliente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">5.</span>
              <span>Cancelación y Suspensión de Cuentas</span>
            </h2>
            <p>
              Nos reservamos el derecho de suspender o cancelar tu cuenta de Assistly de forma inmediata si detectamos un incumplimiento grave de estos términos, fraude en el procesamiento de pagos de Stripe o uso abusivo de la cuota mensual de chats de soporte.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">6.</span>
              <span>Propiedad Intelectual</span>
            </h2>
            <p>
              El código fuente de Assistly, diseño de interfaces, logotipos, base de datos y tecnologías RAG asociadas son propiedad exclusiva de Assistly. El registro al servicio no transfiere ningún derecho de propiedad intelectual sobre el software al usuario comercial.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">7.</span>
              <span>Limitación de Responsabilidad</span>
            </h2>
            <p>
              En ningún caso Assistly o sus fundadores serán responsables por daños indirectos, incidentales, especiales o consecuentes (incluyendo pérdida de ganancias comerciales, interrupción del negocio o pérdida de reputación de marca) que surjan de respuestas incorrectas, desactualizadas o alucinatorias brindadas por el bot a tus clientes finales en tu sitio web.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">8.</span>
              <span>Modificaciones del Servicio</span>
            </h2>
            <p>
              Nos reservamos el derecho de modificar o discontinuar secciones de la plataforma, cambiar tarifas de suscripción (previo aviso de 30 días) o alterar las pautas de soporte del servicio para cumplir con políticas legales o técnicas de nuestros proveedores (Clerk, Stripe, OpenAI).
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Assistly. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-300">Términos</Link>
            <Link href="/privacy" className="hover:text-slate-300">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
