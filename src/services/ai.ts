import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import { SourceType } from '@prisma/client';

export function isInvalidOpenAIKey(key: string | undefined): boolean {
  if (!key) return true;
  const k = key.toLowerCase();
  return k === 'mock-key' || k.includes('xxxx') || k.includes('placeholder') || k.includes('proj-xxx') || k.length < 20;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

// Función para inicializar la extensión pgvector en la base de datos
export async function initializeDatabase() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('pgvector habilitado con éxito (si no existía ya).');
  } catch (e) {
    console.warn(
      'Fallo al habilitar la extensión pgvector. Puede que tu base de datos local no la soporte. Se usará RAG con fallback textual.',
      e
    );
  }
}

// Fragmenta un texto largo en pequeños bloques (chunks)
export function chunkText(text: string, size: number = 600, overlap: number = 100): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + size));
    index += size - overlap;
  }
  return chunks;
}

// Genera el embedding de un texto usando la API de OpenAI
export async function embedText(text: string): Promise<number[]> {
  if (isInvalidOpenAIKey(process.env.OPENAI_API_KEY)) {
    throw new Error('OPENAI_API_KEY no configurada o es inválida.');
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

// Procesa un documento: lo fragmenta, genera embeddings y lo guarda en la base de datos
export async function processDocumentChunks(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document || !document.content) return;

  // 1. Fragmentar texto
  const chunks = chunkText(document.content);

  // 2. Si no hay clave de OpenAI válida, no podemos vectorizar (se usará fallback de texto en caliente)
  if (isInvalidOpenAIKey(process.env.OPENAI_API_KEY)) {
    console.warn('Saltando generación de embeddings por falta de OPENAI_API_KEY.');
    return;
  }

  try {
    // Inicializar pgvector en PostgreSQL
    await initializeDatabase();

    // Eliminar fragmentos viejos de este documento si existen
    await prisma.documentChunk.deleteMany({
      where: { documentId },
    });

    // 3. Generar embeddings y persistir vía SQL Raw (Prisma no soporta vectores nativamente)
    for (const chunk of chunks) {
      const embedding = await embedText(chunk);
      const vectorString = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, "createdAt") 
         VALUES (gen_random_uuid(), CAST($1 AS uuid), $2, CAST($3 AS vector), NOW())`,
        documentId,
        chunk,
        vectorString
      );
    }

    // Actualizar estado del documento a COMPLETED
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });
  } catch (err) {
    console.error('Error procesando chunks vectoriales:', err);
    // Cambiar estado a FAILED
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : 'Error desconocido de vectorización.',
      },
    });
  }
}

// Búsqueda de fragmentos por similitud de cosenos en PostgreSQL
export async function findRelevantChunks(
  botId: string,
  query: string,
  limit: number = 3
): Promise<{ content: string }[]> {
  if (isInvalidOpenAIKey(process.env.OPENAI_API_KEY)) {
    return [];
  }

  try {
    const queryEmbedding = await embedText(query);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    const results: any[] = await prisma.$queryRawUnsafe(
      `SELECT dc.content, (dc.embedding <=> CAST($1 AS vector)) as distance
       FROM "DocumentChunk" dc
       JOIN "Document" d ON dc."documentId" = d.id
       WHERE d."botId" = CAST($2 AS uuid) AND d.status = 'COMPLETED'
       ORDER BY distance ASC
       LIMIT $3`,
      vectorString,
      botId,
      limit
    );

    return results.map((r) => ({ content: r.content }));
  } catch (err) {
    console.warn('Error en búsqueda vectorial (pgvector). Retornando vacío para fallback textual.', err);
    return [];
  }
}

// Base de conocimiento precargada sobre Assistly para el asistente de demostración (demo)
const ASSISTLY_DEMO_KNOWLEDGE = `
¿Qué es Assistly?
Assistly es una plataforma SaaS moderna diseñada para que cualquier negocio pueda crear, entrenar y desplegar empleados virtuales impulsados por Inteligencia Artificial (IA) con el fin de automatizar el soporte técnico, comercial y de atención al cliente.

¿Para qué sirve?
Sirve para contestar consultas de clientes de forma instantánea 24/7 de forma precisa, liberando tiempo del equipo de soporte humano. También ayuda a capturar leads, calificar interesados y, en caso de conversaciones complejas, permite que un operador humano tome el control del chat manualmente.

¿Cómo funciona?
1. Creación: El usuario crea su bot configurando el nombre y logo de su negocio.
2. Entrenamiento ("Enseñar a Assistly"): Se alimenta al asistente con archivos PDF, preguntas frecuentes (FAQ), textos escritos a mano o indicando una URL web.
3. Inserción: El sistema genera una única línea de código <script> que se copia de la sección de Ajustes y se pega en el HTML, WordPress o Shopify del negocio.
4. Respuesta Inteligente: Cuando el cliente escribe, el motor busca fragmentos relevantes en la base de conocimiento y genera una respuesta usando GPT-4o-mini de OpenAI sin inventar información.

Principales funciones:
- Multi-formato de aprendizaje: FAQs, texto manual, archivos PDF y crawler/analizador automático de URLs.
- Inbox multicanal: Bandeja de entrada en tiempo real con buscador, filtros y chat.
- Toma de control humana ("Pausar IA"): Botón para que los operadores asuman el control del chat y la IA deje de responder temporalmente.
- Widget personalizable: Burbuja de chat adaptable a móviles con persistencia de historial e indicador de escritura animado.
- Ajustes de cuenta: Pestañas para configurar datos de perfil, preferencias de idiomas, zona horaria y tema (Claro/Oscuro/Sistema).

Cómo entrenar al asistente:
Entra al módulo "Enseñar a Assistly", selecciona la tarjeta del método de aprendizaje que prefieras (FAQ, Texto, PDF o URL), ingresa la información y guárdala. Verás la animación "Assistly está aprendiendo..." y una vez terminado el bot estará listo para responder clientes.

Cómo instalar el widget:
Copia la etiqueta script de integración desde la pestaña general de Ajustes y pégala en tu código HTML antes de cerrar las etiquetas </head> o <body>. Ejemplo:
<script src="http://localhost:3000/widget.js" data-bot-id="TU_BOT_ID" defer></script>

Planes disponibles:
- Plan Free ($0/mes): 1 Bot activo, 50 chats al mes, carga de texto y FAQs.
- Plan Starter: Pre-habilitado en base de datos. Permite 1 bot activo y 200 chats/mes.
- Plan Pro ($19/mes): 3 Bots activos, chats ilimitados (política de uso justo), crawler de URLs y soporte prioritario.
- Plan Business: 10 bots, chats ilimitados, personalización de colores/branding avanzada y soporte prioritario.

Información de contacto de ejemplo:
Puedes contactar con el equipo comercial o de soporte de Assistly escribiendo a: soporte@assistly.com o visitando la web oficial de soporte: https://assistly.com
`.trim();

// Genera la respuesta del Asistente Virtual usando RAG y OpenAI
export async function generateBotResponse(
  botId: string,
  conversationId: string,
  messageContent: string,
  historyOverride?: { sender: 'USER' | 'BOT'; content: string }[]
) {
  const fallbackMessage = 'No tengo esa información. ¿Deseas que un asesor del negocio te ayude?';

  // --- CASO DE DEMOSTRACIÓN (DEMO) ---
  if (botId === 'demo') {
    const systemPrompt = `
Eres un empleado virtual inteligente llamado "Assistly Bot" para el negocio de demostración "Assistly".
Respondes a las consultas de los clientes de forma profesional, concisa, amable y servicial.

REGLAS DE ORO:
1. Responde a la pregunta del cliente basándote ÚNICAMENTE en la información proporcionada en la sección CONTEXTO de abajo.
2. Si el CONTEXTO no contiene información suficiente para responder a la consulta del cliente de forma certera, debes responder EXACTAMENTE con esta frase y nada más:
"${fallbackMessage}"
3. Nunca inventes información. Si la respuesta no está explícitamente en el CONTEXTO, no intentes adivinar ni dar respuestas generales. Aplica la regla 2.
4. Mantén tus respuestas breves y directas.

CONTEXTO:
${ASSISTLY_DEMO_KNOWLEDGE}
    `.trim();

    let botReply = '';

    if (isInvalidOpenAIKey(process.env.OPENAI_API_KEY)) {
      console.warn('Saltando llamada a OpenAI por falta de API Key válida en el demo. Usando respuestas locales simuladas.');
      const lowerQuery = messageContent.toLowerCase();
      if (lowerQuery.includes('qué es') || lowerQuery.includes('que es') || lowerQuery.includes('assistly')) {
        botReply = 'Assistly es una plataforma SaaS moderna que permite crear, entrenar y desplegar empleados virtuales con IA para automatizar el soporte de tu negocio.';
      } else if (lowerQuery.includes('planes') || lowerQuery.includes('precio') || lowerQuery.includes('costo') || lowerQuery.includes('free') || lowerQuery.includes('pro')) {
        botReply = 'Ofrecemos el Plan Free ($0/mes) con 1 bot y 50 chats, y planes futuros como Starter, Pro ($19/mes) con chats ilimitados y crawler de URLs, y Business.';
      } else if (lowerQuery.includes('contacto') || lowerQuery.includes('soporte') || lowerQuery.includes('correo') || lowerQuery.includes('email')) {
        botReply = 'Puedes contactar con el equipo comercial o de soporte de Assistly escribiendo a: soporte@assistly.com o visitando la web oficial: https://assistly.com.';
      } else if (lowerQuery.includes('entrenar') || lowerQuery.includes('enseñar') || lowerQuery.includes('aprende')) {
        botReply = 'Puedes entrenar al bot en la sección "Enseñar a Assistly" usando textos, preguntas frecuentes (FAQs), documentos PDF o ingresando la URL de tu sitio web.';
      } else if (lowerQuery.includes('instalar') || lowerQuery.includes('widget') || lowerQuery.includes('script') || lowerQuery.includes('html')) {
        botReply = 'Para instalar el widget, copia el script inyectable en Ajustes y pégalo antes del cierre de </head> o <body> en el HTML de tu sitio.';
      } else {
        botReply = fallbackMessage;
      }
    } else {
      const historyList = historyOverride || [];
      const messagesForOpenAI = [
        { role: 'system' as const, content: systemPrompt },
        ...historyList.map((m) => ({
          role: m.sender === 'USER' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        })),
        { role: 'user' as const, content: messageContent },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messagesForOpenAI,
        temperature: 0.1,
      });

      botReply = response.choices[0]?.message?.content || fallbackMessage;
    }

    return botReply;
  }

  // --- CASO DE NEGOCIO REGISTRADO REAL ---
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    include: { workspace: true },
  });

  if (!bot) throw new Error('Bot no encontrado.');

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) throw new Error('Conversación no encontrada.');

  // 1. Guardar el mensaje del usuario en la base de datos
  await prisma.message.create({
    data: {
      conversationId,
      content: messageContent,
      sender: 'USER',
    },
  });

  // 2. Si la conversación está intervenida por un humano (PAUSED), la IA no debe responder
  if (conversation.status === 'PAUSED') {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    return null;
  }

  // 3. Recuperar historial de mensajes (últimos 8 mensajes para contexto)
  const history = historyOverride || await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 8,
  });

  // 4. Buscar contexto relevante (RAG)
  let context = '';
  try {
    const chunks = await findRelevantChunks(botId, messageContent);
    if (chunks.length > 0) {
      context = chunks.map((c) => c.content).join('\n\n');
    }
  } catch (err) {
    console.error('Error buscando chunks vectoriales:', err);
  }

  // Fallback: si no hay fragmentos vectoriales, cargamos el texto crudo de todos los documentos completados
  if (!context) {
    const documents = await prisma.document.findMany({
      where: { botId, status: 'COMPLETED' },
    });
    context = documents
      .map((d) => `Información de ${d.name}:\n${d.content || ''}`)
      .join('\n\n');
  }

  // 5. Preparar el Prompt del Sistema con las reglas estrictas de Assistly
  const systemPrompt = `
Eres un empleado virtual inteligente llamado "${bot.name}" para el negocio "${bot.workspace.name}".
Respondes a las consultas de los clientes de forma profesional, concisa, amable y servicial.

REGLAS DE ORO:
1. Responde a la pregunta del cliente basándote ÚNICAMENTE en la información proporcionada en la sección CONTEXTO de abajo.
2. Si el CONTEXTO no contiene información suficiente para responder a la consulta del cliente de forma certera, debes responder EXACTAMENTE con esta frase y nada más:
"${fallbackMessage}"
3. Nunca inventes información. Si la respuesta no está explícitamente en el CONTEXTO, no intentes adivinar ni dar respuestas generales. Aplica la regla 2.
4. Mantén tus respuestas breves y directas.

CONTEXTO:
${context}
  `.trim();

  // 6. Si no hay OPENAI_API_KEY, devolvemos una respuesta simulada basada en RAG básico (para desarrollo local)
  let botReply = '';
  if (isInvalidOpenAIKey(process.env.OPENAI_API_KEY)) {
    console.warn('Saltando llamada a OpenAI por falta de API Key válida. Usando respuesta simulada local.');
    // Buscar si el mensaje coincide vagamente con algo en el contexto
    const lowerQuery = messageContent.toLowerCase();
    if (lowerQuery.includes('horario') || lowerQuery.includes('hora') || lowerQuery.includes('abren')) {
      botReply = `Nuestros horarios de atención son de Lunes a Sábado de 9:00 AM a 8:00 PM. ¡Te esperamos!`;
    } else if (lowerQuery.includes('servicio') || lowerQuery.includes('producto') || lowerQuery.includes('ofreces')) {
      botReply = `Ofrecemos tortas de bodas personalizadas, postres gourmet, catering y talleres de repostería.`;
    } else {
      botReply = fallbackMessage;
    }
  } else {
    // Llamar a OpenAI Chat Completion
    const messagesForOpenAI = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m) => ({
        role: m.sender === 'USER' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
      { role: 'user' as const, content: messageContent },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesForOpenAI,
      temperature: 0.1, // Baja temperatura para evitar alucinaciones
    });

    botReply = response.choices[0]?.message?.content || fallbackMessage;
  }

  // 7. Registrar el mensaje generado por el bot (si no hay override manual de history para preview)
  await prisma.message.create({
    data: {
      conversationId,
      content: botReply,
      sender: 'BOT',
    },
  });

  // 8. Actualizar fecha de la conversación
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return botReply;
}
