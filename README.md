# ASSISTLY 🤖
> Your AI employee for every business.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmatias20090714-sys%2Fassistly)

**Assistly** es una plataforma SaaS B2B moderna y minimalista que permite a cualquier pequeño negocio crear y desplegar un empleado virtual con Inteligencia Artificial para atender a sus clientes de forma automática las 24 horas del día.

Esta primera versión (MVP) está diseñada con una estética premium inspirada en **Stripe, Linear, Vercel y Notion**, priorizando interfaces limpias, el modo oscuro por defecto y animaciones sutiles.

---

## 🚀 Características Clave (MVP)

*   **Landing Page:** Presentación comercial interactiva de alta tecnología y simulador de chat en vivo.
*   **Onboarding Paso a Paso:** Configuración inicial del negocio (nombre, horarios, descripción, servicios y contacto) para pre-entrenar al bot inmediatamente.
*   **Dashboard General:** Vista de métricas avanzadas, estado de la IA, últimas conversaciones e historial de datos cargados.
*   **Módulo de Entrenamiento (RAG):** Carga de datos mediante texto manual, FAQs estructuradas, documentos PDF y un escáner/crawler de URLs externas.
*   **Inbox de Mensajería:** Bandeja de entrada de 3 columnas para leer las conversaciones, auditar las respuestas del bot e intervenir pausando la IA en vivo.
*   **Widget Embebible:** Burbuja de chat flotante minimalista lista para incrustar en cualquier sitio web (HTML, WordPress, Shopify, Webflow) con restricciones de seguridad de dominios (CORS).
*   **Autenticación & Permisos:** Gestión de usuarios integrada con Clerk, aislamiento lógico multi-inquilino (*multi-tenancy*) y roles de miembros.
*   **Suscripciones:** Integración con Stripe Checkout y Portal de Clientes para planes y facturación.

---

## 🛠️ Stack Tecnológico

*   **Frontend & Backend:** Next.js (App Router, React 19, TypeScript)
*   **Estilos:** Tailwind CSS v4 (Enfoque CSS-first, soporte clase `.dark` y variables CSS)
*   **Base de Datos:** PostgreSQL con la extensión `pgvector`
*   **ORM:** Prisma Client & CLI v6
*   **Autenticación:** Clerk Next.js SDK
*   **Facturación:** Stripe Node SDK & Stripe JS
*   **Motor de IA:** OpenAI API (`text-embedding-3-small` para vectorización y `gpt-4o-mini` para streaming) junto con Vercel AI SDK

---

## 📁 Estructura del Directorio

```text
src/
├── app/                  # Rutas y layouts del App Router (Next.js)
│   ├── (auth)/           # Rutas públicas de Login/Registro (Clerk)
│   ├── (dashboard)/      # Panel de administración e Inbox privado
│   ├── onboarding/       # Asistente de configuración de primer ingreso
│   ├── api/              # Controladores y Webhooks API
│   ├── globals.css       # Estilos globales y paleta de colores de Assistly
│   └── layout.tsx        # Layout raíz con Clerk y Theme Providers
├── components/           # Componentes atómicos e interfaces
│   ├── ui/               # Botones, tarjetas y campos de formulario
│   ├── dashboard/        # Layout y barras laterales del panel
│   └── theme-provider.tsx# Manejo de tema claro/oscuro
├── lib/                  # Singletons e integraciones (Prisma, OpenAI, Stripe)
├── services/             # Lógica de negocio (RAG, Web Scraping, PDF processing)
└── types/                # Definiciones globales de TypeScript
```

---

## 💻 Configuración de Desarrollo

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    Copia el archivo `.env.example` a `.env` y rellena tus claves de Clerk, Stripe, OpenAI y tu URL de base de datos PostgreSQL:
    ```bash
    cp .env.example .env
    ```

3.  **Generar el cliente de Prisma:**
    ```bash
    npx prisma generate
    ```

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando.
