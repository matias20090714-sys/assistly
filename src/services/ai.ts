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
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });
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
  const fallbacks = [
    'Lo siento, no dispongo de esa información específica en este momento. ¿Te gustaría que un asesor humano se ponga en contacto contigo?',
    'Lamentablemente no tengo registrado ese detalle. Si lo deseas, puedo avisar a un asesor del negocio para que te ayude directamente.',
    'Esa información no se encuentra en mi base de conocimientos. ¿Quieres que le pase tu consulta a un representante humano de nuestro equipo?',
    'No tengo esa información disponible por ahora. ¿Deseas que un asesor del negocio te contacte para resolver tu duda?'
  ];
  const fallbackMessage = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  // --- CASO DE DEMOSTRACIÓN (DEMO) ---
  if (botId === 'demo') {
    const systemPrompt = `
Eres un empleado virtual inteligente llamado "Assistly Bot" para el negocio de demostración "Assistly".
Respondes a las consultas de los clientes de forma profesional, concisa, amable y servicial.

INSTRUCCIONES DE ATENCIÓN Y COMPORTAMIENTO:
- Responde siempre de forma amable, clara y conversacional.
- Tu prioridad absoluta es responder utilizando la información provista en el CONTEXTO de abajo. Analiza el contexto de forma flexible e inteligente; si la respuesta está implícita o se relaciona de forma lógica con los datos provistos, utilízala para responder al cliente de forma completa.
- No respondas con evasivas (como "no tengo esta información") si la respuesta se puede deducir o estructurar razonablemente a partir de los datos enseñados.
- Si el usuario te saluda o agradece de forma general, sé servicial y de tono cálido, respondiendo de forma natural sin requerir buscar en el contexto.

REGLAS DE SEGURIDAD CONTRA ALUCINACIONES:
1. Básate en la información proporcionada en el CONTEXTO de abajo para responder sobre el negocio.
2. Si la consulta del cliente no tiene absolutamente ninguna relación con los temas enseñados o está completamente ausente del CONTEXTO, indícale de forma atenta que no dispones de esa información en este momento y ofrece que un asesor del negocio se ponga en contacto con él.
3. Nunca inventes información comercial ficticia (como precios falsos o direcciones no registradas) que contradigan o no tengan sustento en el contexto.

CONTEXTO:
${ASSISTLY_DEMO_KNOWLEDGE}
    `.trim();

    let botReply = '';

    if (isInvalidOpenAIKey(process.env.OPENAI_API_KEY)) {
      console.warn('Saltando llamada a OpenAI por falta de API Key válida en el demo. Usando respuestas locales simuladas.');
      const lowerQuery = messageContent.toLowerCase().trim();
      
      // 1. Saludos
      if (lowerQuery === 'hola' || lowerQuery === 'buen dia' || lowerQuery === 'buen día' || lowerQuery === 'buenos dias' || lowerQuery === 'buenos días' || lowerQuery === 'buenas tardes' || lowerQuery === 'buenas noches' || lowerQuery.startsWith('hola ')) {
        botReply = '¡Hola! Bienvenido a la demostración en vivo de Assistly. Soy tu empleado virtual inteligente. ¿En qué puedo ayudarte hoy?';
      }
      // 2. Agradecimientos o despedidas
      else if (lowerQuery === 'gracias' || lowerQuery === 'muchas gracias' || lowerQuery === 'ok' || lowerQuery === 'listo' || lowerQuery === 'perfecto' || lowerQuery === 'adios' || lowerQuery === 'adiós' || lowerQuery === 'chau') {
        botReply = '¡De nada! Si tienes alguna otra duda sobre cómo automatizar tu soporte con Assistly, pregúntame. ¡Estoy aquí para ayudarte!';
      }
      // 3. Utilidad / Para qué sirve / Qué hace (priorizar sobre qué es)
      else if (lowerQuery.includes('sirve') || lowerQuery.includes('para que') || lowerQuery.includes('para qué') || lowerQuery.includes('hace') || lowerQuery.includes('hacer') || lowerQuery.includes('funcion') || lowerQuery.includes('función') || lowerQuery.includes('beneficio') || lowerQuery.includes('ventaja')) {
        botReply = 'Assistly sirve para responder consultas de tus clientes 24/7 de forma instantánea y precisa. Te ayuda a automatizar el soporte repetitivo, capturar leads (contactos) y liberar tiempo para tu equipo. Si una consulta es muy compleja, un operador humano puede tomar el control del chat manualmente.';
      }
      // 4. Qué es / Definición
      else if (lowerQuery.includes('que es') || lowerQuery.includes('qué es') || lowerQuery.includes('definicion') || lowerQuery.includes('definición') || lowerQuery.includes('quien es') || lowerQuery.includes('quién es') || lowerQuery === 'assistly') {
        botReply = 'Assistly es una plataforma SaaS moderna que permite a cualquier negocio crear, entrenar y desplegar empleados virtuales con Inteligencia Artificial para automatizar la atención al cliente y soporte de forma premium.';
      }
      // 5. Funcionamiento / Cómo funciona / Pasos
      else if (lowerQuery.includes('como funciona') || lowerQuery.includes('cómo funciona') || lowerQuery.includes('funcionamiento') || lowerQuery.includes('paso')) {
        botReply = 'Funciona de manera muy sencilla:\n1. Creas tu bot configurando su nombre e imagen.\n2. Lo entrenas (alimentas) con tus archivos PDF, URLs de tu web o FAQs.\n3. Copias la etiqueta <script> de integración desde Ajustes.\n4. La pegas en tu HTML, Shopify o WordPress. ¡Y listo! El bot responderá usando RAG y GPT-4o-mini.';
      }
      // 6. Entrenamiento / Cómo entrenar / Fuentes de datos
      else if (lowerQuery.includes('entrenar') || lowerQuery.includes('entrena') || lowerQuery.includes('enseñar') || lowerQuery.includes('enseña') || lowerQuery.includes('aprende') || lowerQuery.includes('pdf') || lowerQuery.includes('url') || lowerQuery.includes('faq')) {
        botReply = 'Puedes entrenar a tu asistente en la sección "Enseñar a Assistly". Tienes 4 métodos de aprendizaje:\n- **FAQs:** Preguntas y respuestas hechas por ti.\n- **Texto:** Escribir información manualmente.\n- **PDFs:** Cargar catálogos, manuales o políticas.\n- **URLs:** Ingresar tu sitio web para que el bot lo lea por completo.';
      }
      // 7. Instalación / Integración / Insertar en web
      else if (lowerQuery.includes('instalar') || lowerQuery.includes('instalacion') || lowerQuery.includes('instalación') || lowerQuery.includes('integrar') || lowerQuery.includes('integracion') || lowerQuery.includes('integración') || lowerQuery.includes('widget') || lowerQuery.includes('script') || lowerQuery.includes('html') || lowerQuery.includes('shopify') || lowerQuery.includes('wordpress')) {
        botReply = 'Para instalar el widget, ve a la sección de "Ajustes" de tu bot, copia el script inyectable generado (ej. <script src=".../widget.js" data-bot-id="..."></script>) y pégalo antes del cierre de la etiqueta </head> o <body> del código de tu página web.';
      }
      // 8. Planes / Precios / Costo
      else if (lowerQuery.includes('planes') || lowerQuery.includes('precio') || lowerQuery.includes('costo') || lowerQuery.includes('cuesta') || lowerQuery.includes('cuestan') || lowerQuery.includes('valor') || lowerQuery.includes('valen') || lowerQuery.includes('tarifa') || lowerQuery.includes('tarifas') || lowerQuery.includes('dolar') || lowerQuery.includes('dólar') || lowerQuery.includes('dolares') || lowerQuery.includes('dólares') || lowerQuery.includes('usd') || lowerQuery.includes('gratis') || lowerQuery.includes('free') || lowerQuery.includes('pro') || lowerQuery.includes('pago') || lowerQuery.includes('suscripcion') || lowerQuery.includes('suscripción')) {
        botReply = 'Ofrecemos dos planes principales:\n- **Plan Free ($0/mes):** 1 bot activo, 50 chats al mes, entrenamiento con FAQs y texto.\n- **Plan Pro ($19/mes):** 3 bots activos, chats ilimitados, crawler de URLs/sitios web y soporte prioritario por correo.';
      }
      // 9. Contacto / Soporte / Ayuda
      else if (lowerQuery.includes('contacto') || lowerQuery.includes('soporte') || lowerQuery.includes('correo') || lowerQuery.includes('email') || lowerQuery.includes('ayuda') || lowerQuery.includes('email') || lowerQuery.includes('mail') || lowerQuery.includes('escribir') || lowerQuery.includes('escribo') || lowerQuery.includes('telefono') || lowerQuery.includes('teléfono')) {
        botReply = 'Puedes ponerte en contacto con el equipo comercial o de soporte de Assistly escribiéndonos directamente a **soporte@assistly.com** o visitando nuestra web oficial en https://assistly.com.';
      }
      // 10. Fallback genérico
      else {
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

  // 3. Recuperar historial de mensajes (últimos 8 mensajes en orden cronológico correcto)
  let history = historyOverride;
  if (!history) {
    const dbMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    history = dbMessages.reverse().map((m) => ({
      sender: m.sender === 'USER' ? ('USER' as const) : ('BOT' as const),
      content: m.content,
    }));
  }

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

  // Fallback: si no hay fragmentos vectoriales, cargamos el texto crudo con límite de caracteres para evitar saturación de tokens
  if (!context) {
    const documents = await prisma.document.findMany({
      where: { botId, status: 'COMPLETED' },
    });
    const fullText = documents
      .map((d) => `Información de ${d.name}:\n${d.content || ''}`)
      .join('\n\n');
    context = fullText.slice(0, 8000);
  }

  // 5. Preparar el Prompt del Sistema con las reglas de Assistly
  const baseInstruction = bot.systemPrompt || `Eres un empleado virtual inteligente llamado "${bot.name}" para el negocio "${bot.workspace.name}".`;
  const systemPrompt = `
${baseInstruction}

INSTRUCCIONES DE ATENCIÓN Y COMPORTAMIENTO:
- Responde siempre de forma amable, clara, profesional y conversacional.
- Tu prioridad absoluta es responder utilizando la información provista en el CONTEXTO de abajo. Analiza el contexto de forma flexible e inteligente; si la respuesta está implícita o se relaciona de forma lógica con los datos provistos, utilízala para responder al cliente de forma completa.
- No respondas con evasivas (como "no tengo esta información") si la respuesta se puede deducir o estructurar razonablemente a partir de la información provista.
- Si el usuario te saluda o agradece de forma general, sé servicial y educado respondiendo de forma natural sin requerir buscar en el contexto.

REGLAS DE SEGURIDAD CONTRA ALUCINACIONES:
1. Básate en la información proporcionada en el CONTEXTO de abajo para responder sobre el negocio.
2. Si la consulta del cliente no tiene absolutamente ninguna relación con los temas enseñados o está completamente ausente del CONTEXTO, indícale de forma atenta que no dispones de esa información en este momento y ofrece que un asesor del negocio se ponga en contacto con él.
3. Nunca inventes información comercial ficticia (como precios falsos o direcciones no registradas) que contradigan o no tengan sustento en el contexto.

CONTEXTO DE CONOCIMIENTO:
${context}
  `.trim();

  // 6. Si no hay OPENAI_API_KEY, devolvemos una respuesta simulada basada en un RAG sintáctico local de consulta al contexto (para desarrollo local)
  let botReply = '';
  if (isInvalidOpenAIKey(process.env.OPENAI_API_KEY)) {
    console.warn('Saltando llamada a OpenAI por falta de API Key válida. Usando analizador de contexto local.');
    
    // Función auxiliar para normalizar texto removiendo acentos y diacríticos
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };
    
    const cleanQuery = normalizeText(messageContent);
    
    // Saludos y despedidas rápidas con extracción dinámica de rol desde el prompt
    if (cleanQuery === 'hola' || cleanQuery.startsWith('hola ')) {
      let role = 'asistente virtual';
      const promptLower = baseInstruction.toLowerCase();
      if (promptLower.includes('mozo')) role = 'mozo virtual';
      else if (promptLower.includes('estilista')) role = 'estilista virtual';
      else if (promptLower.includes('recepcionista')) role = 'recepcionista médico virtual';
      else if (promptLower.includes('personal shopper')) role = 'personal shopper virtual';
      else if (promptLower.includes('entrenador')) role = 'entrenador virtual';
      else if (promptLower.includes('consultor')) role = 'consultor virtual';
      
      botReply = `¡Hola! Soy ${bot.name}, tu ${role}. ¿En qué puedo colaborar contigo hoy?`;
    } else if (cleanQuery === 'gracias' || cleanQuery === 'muchas gracias' || cleanQuery === 'adios' || cleanQuery === 'chau') {
      botReply = '¡Con gusto! Quedo a tu disposición si necesitas saber algo más sobre nuestro negocio.';
    } else {
      // Buscar en las líneas del contexto (excluyendo las de cabecera)
      const lines = context.split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !normalizeText(l).startsWith('informacion de'));
      
      let matchedLine = '';
      
      // 0. Qué es / Definición del negocio o chatbot
      if (cleanQuery.includes('que es') || cleanQuery.includes('de que se trata') || cleanQuery.includes('para que sirve') || cleanQuery.includes('que hace') || cleanQuery.includes('explic') || cleanQuery.includes('definici') || cleanQuery.includes('funciona') || cleanQuery.includes('informacion')) {
        matchedLine = lines.find((l) => {
          const cleanLine = normalizeText(l);
          return cleanLine.includes(normalizeText(bot.name)) || cleanLine.includes('plataforma') || cleanLine.includes('servicio') || cleanLine.includes('sistema') || cleanLine.includes('negocio') || cleanLine.includes('ayuda');
        }) || lines[0] || '';
      }

      // 1. Horarios
      if (!matchedLine && (cleanQuery.includes('horari') || cleanQuery.includes('hora') || cleanQuery.includes('abiert') || cleanQuery.includes('abren') || cleanQuery.includes('cierra') || cleanQuery.includes('dia'))) {
        matchedLine = lines.find((l) => {
          const cleanLine = normalizeText(l);
          return cleanLine.includes('horari') || cleanLine.includes('hora') || cleanLine.includes('abiert') || cleanLine.includes('cerrad') || cleanLine.includes('atencion');
        }) || '';
      }
      
      // 2. Servicios
      if (!matchedLine && (cleanQuery.includes('servici') || cleanQuery.includes('ofrece') || cleanQuery.includes('especialidad') || cleanQuery.includes('hace') || cleanQuery.includes('hacer') || cleanQuery.includes('corte') || cleanQuery.includes('lasana') || cleanQuery.includes('clase') || cleanQuery.includes('grupal'))) {
        matchedLine = lines.find((l) => {
          const cleanLine = normalizeText(l);
          return cleanLine.includes('servici') || cleanLine.includes('especialidad') || cleanLine.includes('ofrecemos') || cleanLine.includes('clase') || cleanLine.includes('corte') || cleanLine.includes('lasana') || cleanLine.includes('tratamiento');
        }) || '';
      }
      
      // 3. Precios y Envíos
      if (!matchedLine && (cleanQuery.includes('preci') || cleanQuery.includes('costo') || cleanQuery.includes('cuesta') || cleanQuery.includes('tarifa') || cleanQuery.includes('valor') || cleanQuery.includes('pase') || cleanQuery.includes('mensual') || cleanQuery.includes('gratis') || cleanQuery.includes('free') || cleanQuery.includes('$') || cleanQuery.includes('envi'))) {
        matchedLine = lines.find((l) => {
          const cleanLine = normalizeText(l);
          return cleanLine.includes('$') || cleanLine.includes('preci') || cleanLine.includes('costo') || cleanLine.includes('cuesta') || cleanLine.includes('tarifa') || cleanLine.includes('pase') || cleanLine.includes('gratis') || cleanLine.includes('envi');
        }) || '';
      }
      
      // 4. Turnos / Reservas / Contacto / Soporte
      if (!matchedLine && (cleanQuery.includes('turn') || cleanQuery.includes('reserv') || cleanQuery.includes('contact') || cleanQuery.includes('email') || cleanQuery.includes('mail') || cleanQuery.includes('correo') || cleanQuery.includes('telefon') || cleanQuery.includes('whatsapp') || cleanQuery.includes('web') || cleanQuery.includes('soporte'))) {
        matchedLine = lines.find((l) => {
          const cleanLine = normalizeText(l);
          return cleanLine.includes('turn') || cleanLine.includes('reserv') || cleanLine.includes('@') || cleanLine.includes('+') || cleanLine.includes('web') || cleanLine.includes('contact') || cleanLine.includes('llamar') || cleanLine.includes('soporte');
        }) || '';
      }
      
      // 5. Obras Sociales / Prepaga
      if (!matchedLine && (cleanQuery.includes('social') || cleanQuery.includes('obra') || cleanQuery.includes('osde') || cleanQuery.includes('swiss') || cleanQuery.includes('galeno') || cleanQuery.includes('medicus') || cleanQuery.includes('prepaga') || cleanQuery.includes('cobertur'))) {
        matchedLine = lines.find((l) => {
          const cleanLine = normalizeText(l);
          return cleanLine.includes('social') || cleanLine.includes('obra') || cleanLine.includes('osde') || cleanLine.includes('swiss') || cleanLine.includes('galeno') || cleanLine.includes('medicus') || cleanLine.includes('prepaga') || cleanLine.includes('atendemos');
        }) || '';
      }
      
      botReply = matchedLine || fallbackMessage;
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
