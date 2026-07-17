'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { addDocument, updateDocument, deleteDocument, reprocessDocument } from '@/app/(dashboard)/training/actions';
import { Document, SourceType } from '@prisma/client';
import {
  Sparkles,
  MessageSquare,
  Info,
  Database,
  FileText,
  Globe,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface TrainingClientProps {
  botId: string;
  initialDocuments: Document[];
}

export function TrainingClient({ botId, initialDocuments }: TrainingClientProps) {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments);
  
  // Modales
  const [activeModal, setActiveModal] = React.useState<'faq' | 'text' | 'pdf' | 'url' | 'edit-faq' | 'edit-text' | null>(null);
  const [selectedDoc, setSelectedDoc] = React.useState<Document | null>(null);

  // Estados de animación de aprendizaje
  const [learningStep, setLearningStep] = React.useState<'idle' | 'learning' | 'ready'>('idle');

  // Estados del Formulario
  const [formName, setFormName] = React.useState('');
  const [formContent, setFormContent] = React.useState('');
  const [formUrl, setFormUrl] = React.useState('');
  const [formFile, setFormFile] = React.useState<File | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sincronizar documentos del servidor
  React.useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Contar palabras estimadas cargadas
  const totalWords = React.useMemo(() => {
    return documents.reduce((acc, doc) => {
      const content = doc.content || '';
      return acc + (content.split(/\s+/).filter(Boolean).length);
    }, 0);
  }, [documents]);

  // Última actualización
  const lastUpdatedText = React.useMemo(() => {
    if (documents.length === 0) return 'Sin actualizaciones';
    const dates = documents.map(d => new Date(d.updatedAt).getTime());
    const maxDate = new Date(Math.max(...dates));
    return maxDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' de hoy';
  }, [documents]);

  const resetForm = () => {
    setFormName('');
    setFormContent('');
    setFormUrl('');
    setFormFile(null);
    setFormError(null);
    setSelectedDoc(null);
  };

  const closeModal = () => {
    setActiveModal(null);
    resetForm();
  };

  // Disparar la animación de aprendizaje
  const triggerLearningAnimation = (callback: () => Promise<any>) => {
    setLearningStep('learning');
    
    // Esperar al menos 2.2 segundos simulando que la IA aprende
    const animationPromise = new Promise((resolve) => setTimeout(resolve, 2200));

    Promise.all([callback(), animationPromise])
      .then(() => {
        setLearningStep('ready');
        // Mostrar estado LISTO por 1.3 segundos
        setTimeout(() => {
          setLearningStep('idle');
          closeModal();
          router.refresh();
        }, 1300);
      })
      .catch((err: any) => {
        setLearningStep('idle');
        setFormError(err.message || 'Ocurrió un error al procesar el conocimiento.');
      });
  };

  // Guardar FAQ
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim()) {
      setFormError('Por favor, completa la pregunta y la respuesta.');
      return;
    }

    triggerLearningAnimation(async () => {
      await addDocument(botId, 'FAQ', formName, formContent);
    });
  };

  // Guardar Texto Manual
  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim()) {
      setFormError('Por favor, completa el título y el contenido.');
      return;
    }

    triggerLearningAnimation(async () => {
      await addDocument(botId, 'TEXT', formName, formContent);
    });
  };

  // Guardar PDF
  const handleSavePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFile) {
      setFormError('Por favor, selecciona un archivo PDF.');
      return;
    }

    triggerLearningAnimation(async () => {
      const mockPDFText = `Contenido indexado del archivo PDF ${formFile.name}. Tamaño: ${formFile.size} bytes.`;
      await addDocument(botId, 'PDF', formFile.name, mockPDFText);
    });
  };

  // Guardar URL
  const handleSaveURL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl.trim()) {
      setFormError('Por favor, ingresa una URL válida.');
      return;
    }

    triggerLearningAnimation(async () => {
      const parsedUrlName = formUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
      const mockWebText = `Contenido raspado del sitio web ${formUrl}. Incluye información de inicio y preguntas frecuentes del portal.`;
      await addDocument(botId, 'URL', `Sitio: ${parsedUrlName}`, mockWebText, formUrl);
    });
  };

  // Editar FAQ o Texto
  const handleOpenEdit = (doc: Document) => {
    setSelectedDoc(doc);
    setFormName(doc.name);
    setFormContent(doc.content || '');
    if (doc.type === 'FAQ') {
      setActiveModal('edit-faq');
    } else {
      setActiveModal('edit-text');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!formName.trim() || !formContent.trim()) {
      setFormError('Por favor, completa todos los campos.');
      return;
    }

    triggerLearningAnimation(async () => {
      await updateDocument(selectedDoc.id, formName, formContent);
    });
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta fuente de conocimiento? La IA ya no podrá responder sobre este tema.')) return;
    
    try {
      await deleteDocument(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la fuente.');
    }
  };

  // Reprocesar
  const handleReprocess = async (doc: Document) => {
    // Activamos la animación de aprendizaje
    setLearningStep('learning');
    const animationPromise = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await Promise.all([reprocessDocument(doc.id), animationPromise]);
      setLearningStep('ready');
      setTimeout(() => {
        setLearningStep('idle');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setLearningStep('idle');
      alert(err.message || 'Error al reprocesar la fuente.');
    }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Indicadores de Estado y Entrenamiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Estado */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Estado del Asistente</span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Listo para Responder</span>
          </div>
        </div>

        {/* Última Actualización */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Última Actualización</span>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold">{lastUpdatedText}</span>
          </div>
        </div>

        {/* Conocimiento Aprendido */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Información Aprendida</span>
          <div className="flex items-center gap-1.5 text-sm text-foreground font-semibold">
            <Database className="h-4 w-4 text-violet-500 shrink-0" />
            <span>{documents.length} fuentes • {totalWords.toLocaleString()} palabras</span>
          </div>
        </div>

        {/* Progreso del Entrenamiento */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Progreso del Entrenamiento</span>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-primary">100% Completado</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-full shadow-[0_0_8px_rgba(109,94,246,0.5)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Título de Métodos */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Métodos de Entrenamiento</h2>
        <p className="text-muted-foreground text-sm font-light mt-1">Elige una de las siguientes opciones para alimentar el conocimiento de tu asistente.</p>
      </div>

      {/* Tarjetas Grandes y Modernas para Métodos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Método 1: FAQ */}
        <button
          onClick={() => setActiveModal('faq')}
          className="p-6 rounded-2xl border border-border bg-card text-left flex flex-col justify-between h-52 hover:border-primary/40 hover:shadow-lg transition-all group duration-200"
        >
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-primary group-hover:text-white transition-all duration-200">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold mb-1.5 text-foreground flex items-center gap-1.5">
              <span>Preguntas Frecuentes</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Agrega preguntas comunes y sus respuestas oficiales en texto. Ideal para políticas claras.
            </p>
          </div>
        </button>

        {/* Método 2: Texto */}
        <button
          onClick={() => setActiveModal('text')}
          className="p-6 rounded-2xl border border-border bg-card text-left flex flex-col justify-between h-52 hover:border-primary/40 hover:shadow-lg transition-all group duration-200"
        >
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500 group-hover:bg-primary group-hover:text-white transition-all duration-200">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold mb-1.5 text-foreground flex items-center gap-1.5">
              <span>Texto Manual</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Escribe libremente información histórica, valores de marca o guías para entrenar al bot.
            </p>
          </div>
        </button>

        {/* Método 3: PDF */}
        <button
          onClick={() => setActiveModal('pdf')}
          className="p-6 rounded-2xl border border-border bg-card text-left flex flex-col justify-between h-52 hover:border-primary/40 hover:shadow-lg transition-all group duration-200"
        >
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-primary group-hover:text-white transition-all duration-200">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold mb-1.5 text-foreground flex items-center gap-1.5">
              <span>Subir PDF</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Carga manuales, políticas de devoluciones o catálogos completos en formato PDF.
            </p>
          </div>
        </button>

        {/* Método 4: URL */}
        <button
          onClick={() => setActiveModal('url')}
          className="p-6 rounded-2xl border border-border bg-card text-left flex flex-col justify-between h-52 hover:border-primary/40 hover:shadow-lg transition-all group duration-200"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-primary group-hover:text-white transition-all duration-200">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold mb-1.5 text-foreground flex items-center gap-1.5">
              <span>Escanear URL</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Ingresa el enlace de tu sitio web o sección de ayuda para extraer información automáticamente.
            </p>
          </div>
        </button>
      </div>

      {/* Listado de Conocimientos Aprendidos */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Conocimiento Aprendido</h2>
          <p className="text-muted-foreground text-xs font-light mt-0.5">Listado de todas las fuentes que alimentan las respuestas de tu bot.</p>
        </div>

        {documents.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-border rounded-xl bg-muted/10">
            <Database className="h-8 w-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">Aún no hay conocimiento cargado</p>
            <p className="text-xs text-muted-foreground mt-1">Elige uno de los métodos de arriba para empezar a enseñarle a Assistly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all duration-150 relative group"
              >
                <div className="flex items-start gap-4 justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-lg shrink-0 ${
                      doc.type === 'FAQ' ? 'bg-blue-500/10 text-blue-500' :
                      doc.type === 'TEXT' ? 'bg-violet-500/10 text-violet-500' :
                      doc.type === 'PDF' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {doc.type === 'FAQ' && <MessageSquare className="h-5 w-5" />}
                      {doc.type === 'TEXT' && <Info className="h-5 w-5" />}
                      {doc.type === 'PDF' && <FileText className="h-5 w-5" />}
                      {doc.type === 'URL' && <Globe className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate max-w-[240px] md:max-w-[320px]">{doc.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{doc.type}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(doc.updatedAt).toLocaleDateString()} • {(doc.content || '').split(/\s+/).filter(Boolean).length} palabras
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badge de Estado */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    doc.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    doc.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' :
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {doc.status === 'COMPLETED' ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Listo</span>
                      </>
                    ) : doc.status === 'PROCESSING' ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Aprendiendo</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        <span>Fallo</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Acciones de la Fuente */}
                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleReprocess(doc)}
                    className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg border border-border bg-background text-[11px] font-medium text-slate-300 hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reprocesar</span>
                  </button>

                  {(doc.type === 'TEXT' || doc.type === 'FAQ') && (
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg border border-border bg-background text-[11px] font-medium text-slate-300 hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-red-500 hover:bg-red-500/5 hover:border-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODALES DE INGRESO DE DATOS ================= */}

      {/* Modal FAQ */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>Añadir Pregunta Frecuente</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              Registra una consulta usual de tus usuarios para entrenar al bot.
            </p>

            <form onSubmit={handleSaveFAQ} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pregunta del Cliente</label>
                <textarea
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: ¿Cuáles son las políticas de devolución?"
                  rows={2}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Respuesta Oficial del Negocio</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Ej: Aceptamos devoluciones gratis dentro de los primeros 10 días tras recibir la compra, siempre que el producto conserve su sello original."
                  rows={4}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                  required
                />
              </div>

              {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-primary text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
                >
                  Guardar y Aprender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Texto Manual */}
      {activeModal === 'text' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Info className="h-5 w-5 text-violet-500" />
              <span>Añadir Texto Manual</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              Escribe directamente información institucional, catálogos o pautas comerciales.
            </p>

            <form onSubmit={handleSaveText} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Título de la Información</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Historia de la Pastelería"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contenido / Detalles</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escribe aquí toda la información de soporte detallada..."
                  rows={5}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                  required
                />
              </div>

              {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-primary text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
                >
                  Guardar y Aprender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal PDF */}
      {activeModal === 'pdf' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span>Subir Archivo PDF</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              Sube tus catálogos o guías para que Assistly extraiga la información.
            </p>

            <form onSubmit={handleSavePDF} className="space-y-6">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-950/40 hover:border-primary/30 transition-colors relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormFile(file);
                      setFormError(null);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
                <Database className="h-10 w-10 text-slate-500 mb-3" />
                {formFile ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-primary">{formFile.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{(formFile.size / 1024).toFixed(1)} KB • Listo para procesar</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-300">Arrastra tu PDF aquí o haz clic</p>
                    <p className="text-[10px] text-slate-400 mt-1">Soporta archivos de hasta 5MB</p>
                  </div>
                )}
              </div>

              {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-primary text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
                >
                  Procesar Archivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal URL */}
      {activeModal === 'url' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-500" />
              <span>Escanear Sitio Web</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              Ingresa la URL del sitio de donde el bot debe absorber información.
            </p>

            <form onSubmit={handleSaveURL} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dirección Web (URL)</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://minegocio.com/nosotros"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                  required
                  autoFocus
                />
              </div>

              {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-primary text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
                >
                  Escanear e Indexar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar FAQ */}
      {activeModal === 'edit-faq' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>Editar Pregunta Frecuente</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              Modifica la pregunta o la respuesta asociada.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pregunta del Cliente</label>
                <textarea
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Respuesta Oficial</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                  required
                />
              </div>

              {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-primary text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Texto Manual */}
      {activeModal === 'edit-text' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Info className="h-5 w-5 text-violet-500" />
              <span>Editar Texto Manual</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              Modifica el título o el contenido del bloque de texto.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Título de la Información</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contenido / Detalles</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                  required
                />
              </div>

              {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-primary text-xs font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PANTALLA COMPLETA: ANIMACIÓN DE APRENDIZAJE ================= */}
      {learningStep !== 'idle' && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-10 flex flex-col items-center max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,94,246,0.1),transparent)] pointer-events-none" />
            
            {learningStep === 'learning' ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Loader Animado de Cerebro/Procesamiento */}
                <div className="relative h-20 w-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-100">Assistly está aprendiendo...</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Estructurando los datos, vectorizando los contenidos y calibrando el modelo de lenguaje de soporte.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                {/* Éxito Checkmark */}
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <Check className="h-10 w-10 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-100">¡Conocimiento Asimilado!</h3>
                  <p className="text-xs text-emerald-400 font-semibold">
                    Assistly está listo para responder clientes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
