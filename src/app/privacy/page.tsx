import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Clock, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PrivacyPolicyPage() {
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
            <Shield className="h-8 w-8 text-primary" />
            <span>Política de Privacidad</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-light">
            <Clock className="h-3.5 w-3.5" />
            <span>Última actualización: 17 de Julio de 2026</span>
          </div>
        </div>

        {/* Artículos de la Política */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-400 font-light leading-relaxed select-text">
          
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">1.</span>
              <span>Introducción</span>
            </h2>
            <p>
              En Assistly, valoramos y respetamos profundamente la privacidad de nuestros usuarios y la de sus clientes finales. Esta Política de Privacidad describe detalladamente qué información recopilamos, cómo la almacenamos, la protegemos y cómo la compartimos cuando utilizas nuestra plataforma SaaS de empleados virtuales con Inteligencia Artificial.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">2.</span>
              <span>Información que Recopilamos</span>
            </h2>
            <p>
              Para prestar nuestro servicio de forma óptima, recopilamos las siguientes categorías de datos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Datos de la Cuenta:</strong> Nombre, dirección de correo electrónico, credenciales de inicio de sesión y datos comerciales asociados (nombre de la empresa, logo, rubro y canales de comunicación) procesados a través de nuestro proveedor de autenticación Clerk.
              </li>
              <li>
                <strong>Base de Conocimiento:</strong> Todos los documentos cargados a la plataforma (archivos PDF, preguntas frecuentes y URLs de sitios web) con el fin exclusivo de entrenar al asistente de soporte del usuario.
              </li>
              <li>
                <strong>Historial de Conversaciones:</strong> El contenido de los mensajes de chat enviados por los clientes a través del widget de Assistly embebido en tu sitio web. Esto incluye metadatos de mensajería (marca de tiempo, identificador de sesión y correo del cliente si lo provee).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">3.</span>
              <span>Almacenamiento y Seguridad de los Datos</span>
            </h2>
            <p>
              Toda la información es almacenada en servidores seguros en la nube y bases de datos relacionales encriptadas en reposo. Implementamos protocolos SSL/TLS de última generación para proteger la información en tránsito. El acceso a los datos está limitado estrictamente mediante roles y tokens de seguridad autenticados por Clerk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">4.</span>
              <span>Uso de la Información</span>
            </h2>
            <p>
              Utilizamos los datos recopilados para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configurar, operar y mantener tu espacio de trabajo en Assistly.</li>
              <li>Entrenar y alimentar el motor de inteligencia artificial local (RAG) asociado a tu bot.</li>
              <li>Permitir a los operadores del negocio monitorear chats históricos e intervenir en vivo a través del Inbox.</li>
              <li>Procesar pagos y suscripciones de forma segura a través de Stripe.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">5.</span>
              <span>Integración y Uso de OpenAI</span>
            </h2>
            <p>
              El motor de respuestas de Assistly utiliza los modelos de lenguaje de OpenAI (como GPT-4o-mini y embeddings) para vectorizar el conocimiento y formular respuestas. Para garantizar tu privacidad:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Aislamiento de Prompts:</strong> El contexto de tu negocio se inyecta en caliente en la API de OpenAI por consulta y no se comparte con otros bots ni inquilinos.
              </li>
              <li>
                <strong>No Entrenamiento de Terceros:</strong> De acuerdo con las políticas comerciales de OpenAI, los datos enviados a través de sus APIs no se utilizan para entrenar ni mejorar los modelos globales públicos de OpenAI.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">6.</span>
              <span>Política de Cookies</span>
            </h2>
            <p>
              Utilizamos cookies esenciales y almacenamiento local (`localStorage`) únicamente para mantener tu sesión activa y persistir el historial de mensajes de los visitantes en el widget flotante de chat, previniendo que pierdan su contexto al recargar o navegar por el portal. No utilizamos cookies de rastreo publicitario de terceros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-xs">7.</span>
              <span>Derechos de los Usuarios</span>
            </h2>
            <p>
              Tienes el derecho de acceder, corregir, exportar o eliminar de forma definitiva toda la información almacenada en Assistly en cualquier momento. Puedes descargar tu base de datos de entrenamiento en JSON y borrar tu cuenta de forma autónoma desde el menú de Ajustes en tu panel de control, lo cual destruirá de forma irrevocable todos tus registros en un lapso de 24 horas.
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
