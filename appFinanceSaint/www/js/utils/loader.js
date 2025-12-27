export class Loader {
  constructor() {
    this.overlayId = 'custom-loader-overlay';
    this.hasInitialized = false;
    this._init();
  }

  /**
   * Método privado para criar o CSS e o HTML
   */
  _init() {
    if (document.getElementById(this.overlayId)) {
      return; // Evita criar duplicatas se a classe for instanciada mais de uma vez
    }

    // 1. Injetar o CSS
    const css = `
      #${this.overlayId} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8); /* Fundo branco semi-transparente */
        z-index: 9999;
        display: none; /* Oculto por padrão */
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(2px); /* Efeito de desfoque opcional */
      }

      .custom-loader-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3; /* Cinza claro */
        border-top: 5px solid #28a745; /* Verde (a cor pedida) */
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // 2. Criar o HTML (Overlay + Spinner)
    const overlay = document.createElement('div');
    overlay.id = this.overlayId;
    
    const spinner = document.createElement('div');
    spinner.className = 'custom-loader-spinner';

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    
    this.hasInitialized = true;
  }

  /**
   * Exibe o loader na tela
   */
  show() {
    const loader = document.getElementById(this.overlayId);
    if (loader) {
      loader.style.display = 'flex';
    }
  }

  /**
   * Remove o loader da tela
   */
  hide() {
    const loader = document.getElementById(this.overlayId);
    if (loader) {
      loader.style.display = 'none';
    }
  }
}