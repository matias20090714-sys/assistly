'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { submitOnboarding, OnboardingData } from './actions';
import {
  Bot,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Building,
  Info,
  Clock,
  Briefcase,
  Mail,
  Cpu,
  ShoppingBag,
  HeartPulse,
  Utensils,
  Laptop,
  Compass,
  Check,
  AlertCircle,
} from 'lucide-react';

const STEPS_COUNT = 7;

interface CategoryOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'retail', name: 'E-commerce & Retail', description: 'Tiendas online, moda, calzado y productos físicos.', icon: ShoppingBag },
  { id: 'health', name: 'Salud & Bienestar', description: 'Clínicas, consultorios, gimnasios y cuidado personal.', icon: HeartPulse },
  { id: 'food', name: 'Gastronomía & Cafés', description: 'Restaurantes, cafeterías, repostería y delivery.', icon: Utensils },
  { id: 'tech', name: 'Tecnología & SaaS', description: 'Software, startups, agencias digitales y soporte técnico.', icon: Laptop },
  { id: 'services', name: 'Servicios Profesionales', description: 'Consultorías, abogados, contadores y educación.', icon: Compass },
  { id: 'other', name: 'Otra Categoría', description: 'Negocios locales, hotelería, inmobiliarias, etc.', icon: Building },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = React.useState<OnboardingData>({
    businessName: '',
    category: '',
    description: '',
    schedule: 'Lunes a Viernes, 9:00 AM - 6:00 PM',
    services: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectCategory = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, category: categoryId }));
    setError(null);
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !formData.businessName.trim()) {
      setError('Por favor, ingresa el nombre de tu negocio para iniciar la IA.');
      return;
    }
    if (currentStep === 2 && !formData.category) {
      setError('Por favor, selecciona una categoría para mapear las habilidades de la IA.');
      return;
    }
    if (currentStep === 3 && !formData.description.trim()) {
      setError('Por favor, describe tu negocio para transferir el contexto.');
      return;
    }
    if (currentStep === 5) {
      if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
        setError('Por favor, ingresa un correo de contacto válido.');
        return;
      }
      if (!formData.contactPhone.trim()) {
        setError('Por favor, ingresa un teléfono para derivaciones.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS_COUNT));
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitOnboarding(formData);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al activar tu asistente virtual.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Luces de Fondo y Estructura Digital */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(55rem_55rem_at_center,rgba(109,94,246,0.15),transparent)]" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 mb-4 relative group">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
          <Cpu className="h-7 w-7 relative z-10" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Construye tu Empleado IA
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-light max-w-md mx-auto">
          Inicializa los módulos de conocimiento y calibra la personalidad de tu asistente virtual.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Indicador de Pasos Digitales */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-slate-400 mb-3 font-medium">
              <span>Módulo {currentStep} de {STEPS_COUNT}</span>
              <span className="font-semibold text-primary">
                {Math.round(((currentStep - 1) / (STEPS_COUNT - 1)) * 100)}% Calibrado
              </span>
            </div>
            <div className="flex justify-between items-center gap-1.5">
              {Array.from({ length: STEPS_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i + 1 < currentStep
                      ? 'bg-primary'
                      : i + 1 === currentStep
                      ? 'bg-primary shadow-[0_0_8px_rgba(109,94,246,0.8)]'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Paso 1: Nombre del Negocio */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Building className="h-4 w-4" />
                    <span>NÚCLEO DE IDENTIDAD</span>
                  </div>
                  <h3 className="text-xl font-bold">¿Cuál es el nombre de tu empresa?</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Este nombre se inyectará como la marca oficial en el cerebro del bot. Responderá a tus clientes en representación de este negocio.
                  </p>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Ej: Pastelería Dulce Sabor"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                    required
                    autoFocus
                  />
                </div>
                {/* Visualización */}
                <div className="w-full md:w-48 h-48 rounded-2xl border border-white/5 bg-slate-950/60 flex flex-col items-center justify-center relative p-4 shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,94,246,0.1),transparent)]" />
                  <div className="h-16 w-16 rounded-full border border-primary/20 flex items-center justify-center mb-3 animate-spin duration-10000">
                    <Bot className="h-8 w-8 text-primary/70" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">NÚCLEO IA</span>
                  <span className="text-xs font-semibold text-slate-300 mt-1 max-w-[150px] truncate text-center">
                    {formData.businessName || 'Esperando Nombre...'}
                  </span>
                </div>
              </div>
            )}

            {/* Paso 2: Categoría */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>MODULACIÓN DE HABILIDADES</span>
                </div>
                <h3 className="text-xl font-bold">Selecciona la industria de tu negocio</h3>
                <p className="text-xs text-slate-400 font-light">
                  Esto le enseña a tu empleado de soporte los modismos de comunicación y las intenciones de chat típicas de tu sector.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat.id)}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between h-36 transition-all duration-200 relative group ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-[0_0_12px_rgba(109,94,246,0.15)]'
                            : 'border-white/10 bg-slate-950/40 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-400'}`}>
                            <cat.icon className="h-5 w-5" />
                          </div>
                          {isSelected && (
                            <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{cat.name}</h4>
                          <p className="text-[10px] text-slate-400 font-light mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paso 3: Descripción */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Info className="h-4 w-4" />
                    <span>CARGA DE MEMORIA CONTEXTUAL</span>
                  </div>
                  <h3 className="text-xl font-bold">Enseña a tu empleado de qué trata tu negocio</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Escribe un párrafo detallando a qué se dedica tu negocio, cuáles son tus políticas o qué te diferencia. Esta descripción se convertirá en la memoria central de la IA.
                  </p>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Ej: Somos una pastelería artesanal enfocada en tortas personalizadas, postres gourmet y opciones sin gluten. Realizamos envíos a domicilio los fines de semana y atendemos pedidos especiales..."
                    rows={5}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                    required
                    autoFocus
                  />
                </div>
                {/* Visualización */}
                <div className="w-full md:w-48 h-52 rounded-2xl border border-white/5 bg-slate-950/60 flex flex-col items-center justify-center p-4 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,94,246,0.1),transparent)]" />
                  <div className="w-full flex items-center justify-between text-[9px] text-slate-500 mb-2 border-b border-white/5 pb-2">
                    <span>CONTEXT_MAP</span>
                    <span className="animate-pulse">LOAD_MEM</span>
                  </div>
                  <div className="flex-1 w-full text-[10px] text-slate-400 font-mono overflow-hidden">
                    {formData.description ? (
                      <p className="line-clamp-6 leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                    ) : (
                      <p className="text-slate-600 italic">Esperando que describas tu negocio para inicializar contexto...</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4: Horarios */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Clock className="h-4 w-4" />
                  <span>CALIBRACIÓN DEL RELOJ DE ACTIVIDAD</span>
                </div>
                <h3 className="text-xl font-bold">¿Cuáles son tus horarios de atención al público?</h3>
                <p className="text-xs text-slate-400 font-light">
                  La IA utilizará esto para informar con precisión cuándo está abierto tu local físico o cuándo respondes llamadas de soporte en vivo.
                </p>
                
                {/* Selectores Rápidos de Horario */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    'Lunes a Viernes, 9:00 AM - 6:00 PM',
                    'Lunes a Sábado, 9:00 AM - 8:00 PM',
                    'Soporte 24/7 (Siempre abierto)',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, schedule: preset }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        formData.schedule === preset
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/10 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  placeholder="Ej: Lunes a Sábado de 9:00 AM a 8:00 PM"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                  required
                />
              </div>
            )}

            {/* Paso 5: Contacto */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Mail className="h-4 w-4" />
                    <span>ENLACE DE COMUNICACIÓN</span>
                  </div>
                  <h3 className="text-xl font-bold">Establece tus vías de contacto</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Si el bot encuentra una pregunta muy compleja sobre facturación o reclamos, ofrecerá derivar al cliente compartiendo estos datos.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email de Contacto</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="ejemplo@negocio.com"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Teléfono o WhatsApp</label>
                      <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="+54 11 1234-5678"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Visualización */}
                <div className="w-full md:w-48 h-48 rounded-2xl border border-white/5 bg-slate-950/60 flex flex-col items-center justify-center p-4 shrink-0 relative overflow-hidden text-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,94,246,0.1),transparent)]" />
                  <Mail className="h-10 w-10 text-primary/60 mb-3" />
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">CANALES CONFIGURADOS</span>
                  <p className="text-xs font-semibold text-slate-300 truncate max-w-[150px] mt-1">{formData.contactEmail || 'Sin email...'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formData.contactPhone || 'Sin teléfono...'}</p>
                </div>
              </div>
            )}

            {/* Paso 6: Servicios */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>DICCIONARIO DE CAPACIDADES</span>
                </div>
                <h3 className="text-xl font-bold">¿Qué servicios o productos principales ofreces?</h3>
                <p className="text-xs text-slate-400 font-light">
                  Menciona tus servicios estrella para que la IA responda con un gancho comercial e incentive al cliente a comprar o agendar.
                </p>
                <textarea
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  placeholder="Ej: Tortas de bodas personalizadas, postres individuales, catering para eventos corporativos, talleres presenciales..."
                  rows={5}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none"
                  required
                  autoFocus
                />
              </div>
            )}

            {/* Paso 7: Confirmación */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>PLANO DE ACTIVACIÓN</span>
                </div>
                <h3 className="text-xl font-bold text-center">Planos del Empleado IA listos</h3>
                <p className="text-xs text-slate-400 text-center max-w-md mx-auto font-light leading-relaxed">
                  Hemos ensamblado el mapa de conocimiento de tu asistente virtual. Confirma los datos para activar el bot en tu dashboard de Assistly.
                </p>
                
                {/* Blueprint Card */}
                <div className="rounded-xl border border-primary/20 bg-slate-950/80 p-6 space-y-4 max-w-lg mx-auto relative overflow-hidden font-mono text-xs text-slate-300">
                  <div className="absolute top-0 right-0 h-24 w-24 border-l border-b border-primary/10 rounded-bl-3xl bg-[linear-gradient(to_bottom_right,rgba(109,94,246,0.05),transparent)] flex items-center justify-center">
                    <Bot className="h-10 w-10 text-primary/20" />
                  </div>
                  <div className="text-[10px] text-primary font-bold border-b border-white/5 pb-2">
                    STATUS_BLUEPRINT: READY_TO_INSTALL
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-slate-500">NEGOCIO:</div>
                    <div className="col-span-2 text-slate-100 font-sans">{formData.businessName}</div>

                    <div className="text-slate-500">INDUSTRIA:</div>
                    <div className="col-span-2 text-slate-100 uppercase">{formData.category}</div>

                    <div className="text-slate-500">RELOJ_INTERNO:</div>
                    <div className="col-span-2 text-slate-100 font-sans">{formData.schedule}</div>

                    <div className="text-slate-500">CONTACT_GATE:</div>
                    <div className="col-span-2 text-slate-100 font-sans">{formData.contactEmail}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex gap-2 items-center">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botones de Navegación */}
            <div className="flex justify-between items-center gap-4 pt-6 border-t border-white/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950 px-6 font-medium text-slate-200 hover:bg-slate-900 transition-all disabled:opacity-50 active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>
              ) : (
                <div /> // Espaciador
              )}

              {currentStep < STEPS_COUNT ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all ml-auto active:scale-95"
                >
                  <span>Continuar</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all ml-auto disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Iniciando Activación...</span>
                    </>
                  ) : (
                    <>
                      <span>Activar Asistente Virtual</span>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
