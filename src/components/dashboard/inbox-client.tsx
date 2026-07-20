'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { sendMessage, toggleBotControl, seedConversations } from '@/app/(dashboard)/inbox/actions';
import { Conversation, Message, ConversationStatus } from '@prisma/client';
import {
  Search,
  Bot,
  User,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  Database,
  ArrowLeft,
} from 'lucide-react';

interface InboxClientProps {
  botId: string;
  initialConversations: (Conversation & { messages: Message[] })[];
}

export function InboxClient({ botId, initialConversations }: InboxClientProps) {
  const router = useRouter();
  const [conversations, setConversations] = React.useState(initialConversations);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'ia' | 'manual'>('all');
  const [replyText, setReplyText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Sincronizar conversaciones desde el servidor
  React.useEffect(() => {
    setConversations(initialConversations);
    if (
      initialConversations.length > 0 && 
      !activeId && 
      typeof window !== 'undefined' && 
      window.innerWidth >= 768
    ) {
      setActiveId(initialConversations[0].id);
    }
  }, [initialConversations]);

  // Hacer scroll automático al final cuando cambia el chat o llegan mensajes
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, conversations]);

  const activeChat = React.useMemo(() => {
    return conversations.find((c) => c.id === activeId) || null;
  }, [activeId, conversations]);

  // Filtrado y Búsqueda
  const filteredConversations = React.useMemo(() => {
    return conversations.filter((c) => {
      const email = c.customerEmail?.toLowerCase() || '';
      const identifier = c.customerIdentifier.toLowerCase();
      const term = searchTerm.toLowerCase();
      
      const matchesSearch = email.includes(term) || identifier.includes(term);
      
      if (filter === 'ia') {
        return matchesSearch && c.status === 'ACTIVE';
      }
      if (filter === 'manual') {
        return matchesSearch && c.status === 'PAUSED';
      }
      return matchesSearch;
    });
  }, [conversations, searchTerm, filter]);

  // Enviar mensaje manual (Agente)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !replyText.trim() || isSending) return;

    setIsSending(true);
    const textToSend = replyText;
    setReplyText('');

    try {
      // Optimistic update local
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              status: 'PAUSED', // Se pausa la IA automáticamente
              messages: [
                ...c.messages,
                {
                  id: 'temp-id',
                  conversationId: activeId,
                  content: textToSend,
                  sender: 'AGENT',
                  createdAt: new Date(),
                },
              ],
            };
          }
          return c;
        })
      );

      await sendMessage(activeId, textToSend);
      router.refresh();
    } catch (err) {
      alert('Fallo al enviar el mensaje.');
    } finally {
      setIsSending(false);
    }
  };

  // Alternar el control de la IA
  const handleToggleControl = async () => {
    if (!activeId || isToggling) return;

    setIsToggling(true);
    const isCurrentlyPaused = activeChat?.status === 'PAUSED';

    try {
      // Optimistic update
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return { ...c, status: isCurrentlyPaused ? 'ACTIVE' : 'PAUSED' };
          }
          return c;
        })
      );

      await toggleBotControl(activeId, !isCurrentlyPaused);
      router.refresh();
    } catch (err) {
      alert('Error al modificar el estado de control.');
    } finally {
      setIsToggling(false);
    }
  };

  // Cargar chats de prueba
  const handleSeed = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      await seedConversations(botId);
      router.refresh();
    } catch (err) {
      alert('Error al crear los datos de prueba.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-7.5rem)] md:h-[calc(100vh-8rem)] rounded-xl border border-border bg-card overflow-hidden flex flex-col md:flex-row shadow-sm">
      
      {/* ================= COLUMNA IZQUIERDA: LISTADO DE CHATS ================= */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col bg-card/60 ${activeId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Buscador */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex border-b border-border bg-muted/20 p-1 gap-1 text-[11px] font-semibold">
          {(['all', 'ia', 'manual'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1.5 rounded-md uppercase tracking-wider transition-colors ${
                filter === tab
                  ? 'bg-background text-primary shadow-sm border border-border/20'
                  : 'text-muted-foreground hover:bg-background/40 hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'Todos' : tab === 'ia' ? 'IA' : 'Manual'}
            </button>
          ))}
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-4">
              <p>No se encontraron conversaciones.</p>
              {conversations.length === 0 && (
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-md hover:bg-primary/95 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creando Chats...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-3.5 w-3.5" />
                      <span>Cargar Chats de Prueba</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isSelected = conv.id === activeId;
              const customerLabel = conv.customerEmail || conv.customerIdentifier;
              const initials = customerLabel.substring(0, 2).toUpperCase();

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-muted/40 border-l-2 border-primary' : 'hover:bg-muted/20'
                  }`}
                >
                  {/* Initials Avatar */}
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-semibold text-xs text-foreground truncate">{customerLabel}</h4>
                      <span className="text-[9px] text-muted-foreground shrink-0 font-light">
                        {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate font-light">
                      {lastMsg ? lastMsg.content : 'Sin mensajes'}
                    </p>

                    {/* Badge de control */}
                    <div className="flex justify-between items-center pt-1">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        conv.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/10'
                      }`}>
                        {conv.status === 'ACTIVE' ? 'IA' : 'Agente'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= COLUMNA DERECHA: CHAT COMPLETO ================= */}
      <div className={`flex-1 flex flex-col bg-muted/10 ${!activeId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header de Chat */}
            <div className="h-14 md:h-16 px-3 md:px-6 border-b border-border bg-card flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Botón Atrás Móvil */}
                <button
                  onClick={() => setActiveId(null)}
                  className="p-1 rounded-md hover:bg-accent md:hidden text-foreground mr-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div>
                  <h3 className="font-bold text-sm text-foreground truncate max-w-[160px] sm:max-w-xs">
                    {activeChat.customerEmail || activeChat.customerIdentifier}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${activeChat.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                    <span className="text-[10px] text-muted-foreground font-light">
                      {activeChat.status === 'ACTIVE' ? 'Soporte Automatizado (IA)' : 'Atención Manual (Pausado)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Tomar Control */}
              <button
                onClick={handleToggleControl}
                disabled={isToggling}
                className={`inline-flex h-9 items-center justify-center px-4 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 ${
                  activeChat.status === 'ACTIVE'
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/10'
                    : 'border border-border bg-background text-foreground hover:bg-accent'
                }`}
              >
                {isToggling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : activeChat.status === 'ACTIVE' ? (
                  <>
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Tomar Control</span>
                    <span className="sm:hidden">Pausar IA</span>
                  </>
                ) : (
                  <>
                    <Bot className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    <span className="hidden sm:inline">Devolver a la IA</span>
                    <span className="sm:hidden">Activar IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Burbujas del Chat */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
              {activeChat.messages.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  Comienza la conversación enviando un mensaje.
                </div>
              ) : (
                activeChat.messages.map((msg) => {
                  const isUser = msg.sender === 'USER';
                  const isBot = msg.sender === 'BOT';

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
                    >
                      <div className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed relative ${
                        isUser
                          ? 'bg-slate-800 text-slate-100 rounded-bl-sm border border-white/5'
                          : isBot
                          ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/5'
                          : 'bg-slate-900 text-slate-100 rounded-br-sm border border-white/10'
                      }`}>
                        
                        {/* Indicador de quién habla */}
                        {!isUser && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-white/60 mb-1">
                            {isBot ? (
                              <>
                                <Sparkles className="h-3 w-3" />
                                <span>ASSISTLY BOT</span>
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" />
                                <span>AGENTE HUMANO</span>
                              </>
                            )}
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        <span className={`block text-[9px] mt-1.5 text-right ${isUser ? 'text-slate-400' : 'text-white/60'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Composer */}
            <div className="p-3 md:p-4 border-t border-border bg-card shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    activeChat.status === 'ACTIVE'
                      ? "Responde para pausar la IA y tomar control manual..."
                      : "Escribe tu respuesta aquí..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                  required
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/10 hover:bg-primary/95 transition-all disabled:opacity-50 active:scale-95 shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground font-light">
            <Bot className="h-12 w-12 text-primary mb-3 animate-pulse" />
            <h3 className="font-semibold text-sm text-foreground">Bandeja de Entrada</h3>
            <p className="text-xs max-w-[240px] mt-1">Selecciona una conversación del listado de la izquierda para ver el historial y responder.</p>
          </div>
        )}
      </div>

    </div>
  );
}
