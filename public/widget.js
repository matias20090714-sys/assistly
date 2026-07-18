(function () {
  // 1. Obtener atributos del script de inyección
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');

  const botId = scriptTag ? (scriptTag.getAttribute('data-bot-id') || 'demo') : 'demo';
  
  // Extraer la URL base de Assistly
  let baseUrl = window.location.origin;
  if (scriptTag && scriptTag.src && scriptTag.src.startsWith('http')) {
    const parser = document.createElement('a');
    parser.href = scriptTag.src;
    baseUrl = `${parser.protocol}//${parser.host}`;
  }

  // 2. Inyectar estilos CSS para el widget flotante en la página del cliente
  const style = document.createElement('style');
  style.textContent = `
    .assistly-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #6D5EF6;
      box-shadow: 0 4px 16px rgba(109, 94, 246, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      outline: none;
    }
    .assistly-widget-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(109, 94, 246, 0.5);
    }
    .assistly-widget-btn:active {
      transform: scale(0.95);
    }
    .assistly-widget-btn svg {
      width: 26px;
      height: 26px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 0.25s ease;
    }
    .assistly-widget-btn.active svg {
      transform: rotate(90deg);
    }

    .assistly-widget-iframe-container {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      height: 600px;
      border-radius: 16px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background-color: #020617;
      z-index: 999998;
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .assistly-widget-iframe-container.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    .assistly-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    @media (max-width: 640px) {
      .assistly-widget-iframe-container {
        bottom: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .assistly-widget-btn {
        bottom: 16px;
        right: 16px;
        width: 50px;
        height: 50px;
      }
    }
  `;
  document.head.appendChild(style);

  // 3. Crear el contenedor del iframe del chat
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'assistly-widget-iframe-container';
  
  const iframe = document.createElement('iframe');
  iframe.className = 'assistly-widget-iframe';
  iframe.src = `${baseUrl}/widget?botId=${botId}`;
  iframe.allow = 'clipboard-write';
  
  iframeContainer.appendChild(iframe);
  document.body.appendChild(iframeContainer);

  // 4. Crear el botón flotante con el icono SVG del robot
  const button = document.createElement('button');
  button.className = 'assistly-widget-btn';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="assistly-bubble-icon">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  document.body.appendChild(button);

  // 5. Agregar controlador de clic para abrir/cerrar
  let isOpen = false;
  button.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      button.classList.add('active');
      iframeContainer.classList.add('active');
      // Cambiar icono a X al abrir
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      button.classList.remove('active');
      iframeContainer.classList.remove('active');
      // Revertir icono a globo de chat
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="assistly-bubble-icon">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }
  });
})();
