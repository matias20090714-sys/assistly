'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  PlayCircle,
  Database,
  Code,
  Sparkles,
  User,
  AlertTriangle,
  Mail,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface Article {
  id: string;
  title: string;
  content: string;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  articles: Article[];
}

const HELP_DATA: HelpCategory[] = [
  {
    id: 'get-started',
    name: 'Primeros pasos',
    description: 'Aprende a crear tu cuenta, configurar tu negocio y desplegar tu primer agente.',
    icon: PlayCircle,
    articles: [
      { id: 'gs-1', title: '¿Cómo empezar con Assistly?', content: 'Para comenzar, completa el asistente de onboarding de primer ingreso donde configuras el nombre, descripción y horarios de tu negocio. Una vez finalizado, se creará tu espacio de trabajo y bot por defecto automáticamente en el panel de control.' },
      { id: 'gs-2', title: 'Navegación general del panel', content: 'El panel cuenta con un menú lateral donde puedes acceder al Dashboard (resumen), Enseñar a Assistly (carga de datos), Conversaciones (Inbox para chatear con clientes) y Ajustes (configuraciones de cuenta).' }
    ]
  },
  {
    id: 'teaching',
    name: 'Enseñar a Assistly',
    description: 'Descubre cómo entrenar a tu bot con PDFs, URLs, Texto manual y FAQs.',
    icon: Database,
    articles: [
      { id: 't-1', title: 'Subir y procesar archivos PDF', content: 'Ve a la sección "Enseñar a Assistly" en tu menú lateral, selecciona la tarjeta "Subir PDF" y arrastra tu archivo. Nuestro sistema procesará el texto, lo dividirá en fragmentos semánticos y creará vectores de búsqueda. Tamaño máximo soportado: 5MB.' },
      { id: 't-2', title: 'Uso del crawler de URLs', content: 'El escáner de URLs te permite ingresar la dirección de tu página de ayuda o sección comercial. El bot leerá la estructura HTML, extraerá el contenido de texto plano relevante y lo indexará en su base de conocimiento en segundos.' }
    ]
  },
  {
    id: 'widget',
    name: 'Widget de Chat',
    description: 'Incrusta la burbuja de soporte flotante en tu web en cuestión de minutos.',
    icon: Code,
    articles: [
      { id: 'w-1', title: '¿Cómo incrustar el script flotante?', content: 'En la sección Ajustes de tu dashboard, copia la línea de código provista. Debe lucir similar a esto:\n<script src="https://assistly.com/widget.js" data-bot-id="TU_BOT_ID" defer></script>.\nInsértala dentro de la etiqueta <head> o al final del <body> de tu HTML.' },
      { id: 'w-2', title: 'Seguridad y dominios autorizados (CORS)', content: 'Para prevenir que otros sitios web roben tu bot y consuman tu límite de mensajes, debes configurar los dominios web autorizados en Ajustes > Seguridad. Solo las peticiones provenientes de las URLs especificadas serán atendidas.' }
    ]
  },
  {
    id: 'conversations',
    name: 'Conversaciones',
    description: 'Administra el Inbox, audita las respuestas de la IA e interviene chats en vivo.',
    icon: MessageSquare,
    articles: [
      { id: 'c-1', title: '¿Cómo funciona el Inbox de 2 columnas?', content: 'La columna izquierda lista todos los chats activos en tu widget web. Al seleccionar un chat, la columna derecha muestra el historial completo identificando si el mensaje fue enviado por el Cliente, por la IA o por un operador de soporte.' },
      { id: 'c-2', title: 'Tomar control manual y pausar la IA', content: 'Si deseas chatear en vivo con el cliente, haz clic en el botón "Tomar Control" en la cabecera del chat. Esto pausará temporalmente las respuestas de la IA. Si envías una respuesta manual en la caja de texto, la IA se pausará automáticamente para no interferir.' }
    ]
  },
  {
    id: 'ai-engine',
    name: 'Inteligencia Artificial',
    description: 'Reglas de prompts, límites de contexto y control de alucinaciones.',
    icon: Sparkles,
    articles: [
      { id: 'ai-1', title: 'Límites estrictos de respuesta', content: 'El motor RAG de Assistly inyecta fragmentos de tu conocimiento dentro del prompt de OpenAI. La IA tiene prohibido inventar o adivinar datos que no figuren en los documentos cargados, garantizando la veracidad de la información comercial.' },
      { id: 'ai-2', title: 'El mensaje de fallback de Assistly', content: 'Si el bot no localiza información suficiente en tus documentos, responderá exactamente: "No tengo esa información. ¿Deseas que un asesor del negocio te ayude?". Esto previene alucinaciones y permite derivar el caso a humanos.' }
    ]
  },
  {
    id: 'account',
    name: 'Cuenta',
    description: 'Administra tus preferencias, exportación de datos y seguridad.',
    icon: User,
    articles: [
      { id: 'a-1', title: 'Exportación de datos de entrenamiento', content: 'Puedes descargar un respaldo completo de tu base de conocimiento y chats en formato JSON yendo a Ajustes > Cuenta y haciendo clic en "Exportar Datos".' },
      { id: 'a-2', title: 'Eliminación del Workspace', content: 'Si decides darte de baja, puedes eliminar tu espacio de trabajo desde Ajustes > Cuenta. Ten en cuenta que esta acción es inmediata e irreversible, borrando todos tus bots, documentos e historiales.' }
    ]
  },
  {
    id: 'troubleshooting',
    name: 'Solución de problemas',
    description: 'Resuelve errores de CORS, fallos de lectura de PDF y widget inactivo.',
    icon: AlertTriangle,
    articles: [
      { id: 'ts-1', title: 'El widget no carga en mi página web', content: '1. Verifica que el data-bot-id en el script coincida exactamente con tu ID de bot.\n2. Asegúrate de que el dominio de tu sitio esté en la lista de dominios autorizados de Ajustes.\n3. Revisa la consola del navegador para descartar bloqueos de seguridad HTTPS.' },
      { id: 'ts-2', title: 'Fallo al procesar mi archivo PDF', content: 'Si tu PDF marca error de vectorización, asegúrate de que no sea un archivo escaneado como imagen (debe tener texto seleccionable) y que no se encuentre protegido por contraseña.' }
    ]
  }
];

const FAQS = [
  { q: '¿Cuántos bots puedo crear gratis?', a: 'En el Plan Free de Assistly puedes crear 1 bot de soporte activo y atender hasta 50 conversaciones mensuales.' },
  { q: '¿Cómo entreno a la IA con un archivo de texto?', a: 'Ve a "Enseñar a Assistly", haz clic en "Texto Manual", escribe un título y pega el texto de tus políticas. El bot asimilará este conocimiento en segundos.' },
  { q: '¿Puedo volver a activar la IA si tomé control manual?', a: 'Sí. En tu bandeja de entrada de Conversaciones, selecciona el chat correspondiente y haz clic en "Devolver a la IA" en la esquina superior derecha.' }
];

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<HelpCategory | null>(null);
  const [expandedArticleId, setExpandedArticleId] = React.useState<string | null>(null);
  
  // Soporte Formulario
  const [supportName, setSupportName] = React.useState('');
  const [supportEmail, setSupportEmail] = React.useState('');
  const [supportMsg, setSupportMsg] = React.useState('');
  const [isSendingSupport, setIsSendingSupport] = React.useState(false);
  const [supportSuccess, setSupportSuccess] = React.useState(false);

  // Filtrado de artículos por búsqueda
  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const results: { category: HelpCategory; article: Article }[] = [];
    HELP_DATA.forEach((cat) => {
      cat.articles.forEach((art) => {
        if (
          art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.content.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          results.push({ category: cat, article: art });
        }
      });
    });
    return results;
  }, [searchTerm]);

  const handleContactSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportMsg) return;

    setIsSendingSupport(true);
    setTimeout(() => {
      setIsSendingSupport(false);
      setSupportSuccess(true);
      setSupportName('');
      setSupportEmail('');
      setSupportMsg('');
      // Reiniciar mensaje de éxito después de 4 segundos
      setTimeout(() => setSupportSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Luz ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(circle_at_top,rgba(109,94,246,0.1),transparent)] pointer-events-none" />

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

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Centro de Ayuda Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            ¿Cómo podemos ayudarte hoy?
          </h1>
          <p className="text-sm text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
            Busca artículos detallados, tutoriales de integración y respuestas a problemas comunes de Assistly.
          </p>

          {/* Buscador */}
          <div className="max-w-lg mx-auto pt-6 relative">
            <Search className="absolute left-4 top-9 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar guías, CORS, vectorización, widgets..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedCategory(null); // Limpiar categoría para mostrar resultados
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Cuerpo Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-20 select-none">
        
        {/* RESULTADOS DE BÚSQUEDA */}
        {searchTerm.trim() !== '' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold border-b border-white/5 pb-2">
              Resultados de Búsqueda ({searchResults.length})
            </h2>
            {searchResults.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No se encontraron artículos para tu búsqueda. Prueba con términos como "CORS" o "PDF".</p>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {searchResults.map(({ category, article }) => (
                  <div key={article.id} className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 space-y-2">
                    <span className="text-[9px] uppercase font-bold text-primary tracking-wider">{category.name}</span>
                    <h3 className="text-sm font-bold text-slate-200">{article.title}</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed whitespace-pre-wrap">{article.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: CATEGORÍA SELECCIONADA */}
        {searchTerm === '' && selectedCategory && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setExpandedArticleId(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-all mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a Categorías</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <selectedCategory.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                <p className="text-xs text-slate-400 font-light mt-0.5">{selectedCategory.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-4xl pt-4">
              {selectedCategory.articles.map((art) => {
                const isExpanded = expandedArticleId === art.id;
                return (
                  <div
                    key={art.id}
                    className="rounded-xl border border-white/5 bg-slate-900/20 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                      className="w-full p-5 text-left flex justify-between items-center font-bold text-sm text-slate-200 hover:bg-white/5"
                    >
                      <span>{art.title}</span>
                      <BookOpen className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="p-5 bg-slate-950/60 text-xs text-slate-400 leading-relaxed border-t border-white/5 whitespace-pre-wrap font-light">
                        {art.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA: TARJETAS PRINCIPALES */}
        {searchTerm === '' && !selectedCategory && (
          <div className="space-y-16">
            
            {/* Categorías Bento Grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-2">Buscar por Categoría</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {HELP_DATA.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="p-6 rounded-2xl border border-white/5 bg-slate-900/20 text-left flex flex-col justify-between h-48 hover:border-primary/40 hover:shadow-lg transition-all group duration-200"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-white">{cat.name}</h3>
                      <p className="text-[10px] text-slate-400 font-light mt-1.5 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs Comunes */}
            <div className="space-y-6 max-w-4xl">
              <h2 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-2">Preguntas Frecuentes</h2>
              <div className="grid grid-cols-1 gap-6">
                {FAQS.map((faq, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-start gap-2">
                      <span className="text-primary font-bold text-xs uppercase pt-0.5">Q:</span>
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-light pl-6 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Soporte Formulario */}
            <div className="border border-white/10 rounded-3xl bg-[linear-gradient(to_bottom_right,rgba(109,94,246,0.05),transparent)] p-8 sm:p-10 max-w-2xl mx-auto text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle,rgba(109,94,246,0.1),transparent)] pointer-events-none" />
              
              <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">¿No encuentras lo que necesitas?</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-light leading-relaxed">
                Contacta directamente con nuestro soporte técnico. Responderemos en un plazo máximo de 24 horas hábiles.
              </p>

              <form onSubmit={handleContactSupport} className="mt-8 space-y-4 max-w-md mx-auto text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={supportName}
                      onChange={(e) => setSupportName(e.target.value)}
                      placeholder="Matias"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Email</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Tu Mensaje</label>
                  <textarea
                    value={supportMsg}
                    onChange={(e) => setSupportMsg(e.target.value)}
                    placeholder="Describe en detalle tu consulta..."
                    rows={4}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    required
                  />
                </div>

                {supportSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex gap-2 items-center">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>¡Mensaje enviado con éxito! Nos contactaremos a la brevedad.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingSupport}
                  className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/95 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSendingSupport ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enviando mensaje...</span>
                    </>
                  ) : (
                    <span>Enviar Mensaje de Soporte</span>
                  )}
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-8 select-none">
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
