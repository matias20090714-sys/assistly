'use client';

import * as React from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface ChatWidgetClientProps {
  botId: string;
  businessName: string;
  greetingMessage: string;
  themeColor: string;
}

interface WidgetMessage {
  id: string;
  sender: 'USER' | 'BOT';
  content: string;
  createdAt: Date;
}

export function ChatWidgetClient({
  botId,
  businessName,
  greetingMessage,
  themeColor,
}: ChatWidgetClientProps) {
  const [messages, setMessages] = React.useState<WidgetMessage[]>([]);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [inputText, setInputText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Cargar historial de localStorage tras montar en el cliente
  React.useEffect(() => {
    setHasMounted(true);
    
    // Cargar ID de conversación
    const convKey = `assistly_widget_conv_${botId}`;
    const cachedConvId = localStorage.getItem(convKey);
    if (cachedConvId) {
      setConversationId(cachedConvId);
    }

    // Cargar mensajes
    const key = `assistly_widget_chat_${botId}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const formatted = parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }));
        setMessages(formatted);
      } catch (e) {
        initializeDefaultChat();
      }
    } else {
      initializeDefaultChat();
    }
  }, [botId, greetingMessage]);

  // Hacer scroll automático al final
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const initializeDefaultChat = () => {
    const defaultMsg: WidgetMessage = {
      id: 'greeting',
      sender: 'BOT',
      content: greetingMessage,
      createdAt: new Date(),
    };
    setMessages([defaultMsg]);
  };

  const saveMessages = (newMessages: WidgetMessage[]) => {
    const key = `assistly_widget_chat_${botId}`;
    localStorage.setItem(key, JSON.stringify(newMessages));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText;
    setInputText('');

    const userMsg: WidgetMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      content: userText,
      createdAt: new Date(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveMessages(updated);

    // Activar indicador de escritura
    setIsTyping(true);

    try {
      // Llamada real al endpoint API de IA
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          conversationId,
          message: userText,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Guardar el ID de conversación si es nueva
        if (!conversationId && data.conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem(`assistly_widget_conv_${botId}`, data.conversationId);
        }

        const botMsg: WidgetMessage = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          content: data.response,
          createdAt: new Date(),
        };

        const finished = [...updated, botMsg];
        setMessages(finished);
        saveMessages(finished);
      } else {
        throw new Error(data.error || 'Error al procesar la respuesta.');
      }
    } catch (err) {
      console.error('Error enviando mensaje al widget:', err);
      // Fallback en caso de error
      const errorMsg: WidgetMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'BOT',
        content: 'No tengo esa información. ¿Deseas que un asesor del negocio te ayude?',
        createdAt: new Date(),
      };
      const finished = [...updated, errorMsg];
      setMessages(finished);
      saveMessages(finished);
    } finally {
      setIsTyping(false);
    }
  };

  // Limpiar chat
  const handleClearChat = () => {
    if (confirm('¿Deseas reiniciar la conversación?')) {
      localStorage.removeItem(`assistly_widget_chat_${botId}`);
      localStorage.removeItem(`assistly_widget_conv_${botId}`);
      setConversationId(null);
      initializeDefaultChat();
    }
  };

  if (!hasMounted) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = businessName.substring(0, 2).toUpperCase();

  return (
    <div className="h-screen w-full bg-slate-950 border border-white/10 flex flex-col overflow-hidden font-sans relative">
      
      {/* Cabecera del Widget */}
      <div
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        className="h-16 px-4 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0 select-none"
      >
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: themeColor }}
            className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md shadow-black/30 shrink-0"
          >
            {initials}
          </div>

          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-100 tracking-tight truncate max-w-[150px] sm:max-w-[200px]">
              {businessName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-light">Asistente en Línea</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-[10px] text-slate-500 hover:text-slate-300 font-medium py-1 px-2 rounded hover:bg-white/5 transition-all"
        >
          Reiniciar
        </button>
      </div>

      {/* Historial de Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map((msg) => {
          const isBot = msg.sender === 'BOT';
          return (
            <div
              key={msg.id}
              className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-250`}
            >
              <div
                style={isBot ? { borderLeft: `3px solid ${themeColor}` } : {}}
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  isBot
                    ? 'bg-slate-900 text-slate-200 rounded-tl-sm border border-white/5'
                    : 'bg-slate-800 text-slate-100 rounded-tr-sm border border-white/10'
                }`}
              >
                {isBot && (
                  <div className="flex items-center gap-1 text-[8px] font-bold tracking-wider text-slate-500 mb-1">
                    <Sparkles className="h-2.5 w-2.5" style={{ color: themeColor }} />
                    <span>ASSISTLY BOT</span>
                  </div>
                )}
                
                <p className="whitespace-pre-wrap font-light">{msg.content}</p>
                <span className="block text-[8px] mt-1 text-slate-500 text-right font-light">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Indicador de Escritura */}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-xl rounded-tl-sm border border-white/5 p-3.5 flex items-center gap-1 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input de Mensaje */}
      <div
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        className="p-3 bg-slate-900/40 shrink-0"
      >
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe tu mensaje aquí..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700 text-slate-100 disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            style={!isTyping && inputText.trim() ? { backgroundColor: themeColor } : {}}
            className="h-9 w-9 bg-slate-800 text-slate-400 disabled:opacity-50 flex items-center justify-center rounded-lg hover:bg-slate-700 active:scale-95 transition-all shrink-0"
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </button>
        </form>
      </div>

      {/* Watermark de Marca */}
      <div className="bg-slate-950 text-center py-1.5 select-none" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <a
          href="https://assistly.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-slate-600 hover:text-slate-400 font-light transition-all flex items-center justify-center gap-1"
        >
          <span>Powered by</span>
          <span className="font-bold text-slate-500">Assistly</span>
        </a>
      </div>
      
    </div>
  );
}
