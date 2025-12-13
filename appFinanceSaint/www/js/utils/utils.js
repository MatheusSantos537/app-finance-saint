export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const formatDate = (isoString) => {
    if (!isoString) return '--/--/----';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const secureSum =  (valor1, valor2)  => {
 /**para 2 casas 0.00 */
  const fator = 100; 

  // Multiplica, arredonda para garantir que virou inteiro, soma e divide
  const soma = (Math.round(valor1 * fator) + Math.round(valor2 * fator)) / fator;

  return soma;
}



// constants/loader.js

export const AppLoader = (() => {

    /* =========================
       HTML
    ========================= */
    const html = `
        <div id="app-loader-overlay" class="app-loader-hidden">
            <div class="app-loader-box">
                <div class="app-loader-spinner"></div>
                <span class="app-loader-text">Carregando...</span>
            </div>
        </div>
    `;

    /* =========================
       CSS
    ========================= */
    const css = `
        #app-loader-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.2s ease;
        }

        .app-loader-hidden {
            opacity: 0;
            pointer-events: none;
        }

        .app-loader-box {
            background: var(--cor-card, #fff);
            padding: 20px 26px;
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            min-width: 160px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: app-loader-scale-in 0.2s ease;
        }

        .app-loader-spinner {
            width: 36px;
            height: 36px;
            border: 4px solid rgba(0,0,0,0.15);
            border-top-color: var(--cor-primaria, #4f46e5);
            border-radius: 50%;
            animation: app-loader-spin 0.8s linear infinite;
        }

        .app-loader-text {
            font-size: 0.9rem;
            color: var(--cor-texto, #333);
        }

        @keyframes app-loader-spin {
            to { transform: rotate(360deg); }
        }

        @keyframes app-loader-scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `;

    /* =========================
       PRIVATE HELPERS
    ========================= */
    const ensureLoaderExists = () => {
        // HTML
        if (!document.getElementById('app-loader-overlay')) {
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // CSS
        if (!document.getElementById('app-loader-style')) {
            const style = document.createElement('style');
            style.id = 'app-loader-style';
            style.innerHTML = css;
            document.head.appendChild(style);
        }
    };

    /* =========================
       PUBLIC API
    ========================= */
    const show = (text = 'Carregando...') => {
        ensureLoaderExists();
        const overlay = document.getElementById('app-loader-overlay');
        const label = overlay.querySelector('.app-loader-text');

        if (label) label.innerText = text;

        overlay.classList.remove('app-loader-hidden');
    };

    const hide = () => {
        const overlay = document.getElementById('app-loader-overlay');
        if (!overlay) return;
        overlay.classList.add('app-loader-hidden');
    };

    return {
        show,
        hide
    };

})();
