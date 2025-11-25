import { HomePage } from "./homePage.js";
import { ExpensePage } from "./ExpensePage.js";

export class Pages {
    constructor() {
        this.activePageId = null;
        
        // Instancia os controladores das páginas
        // Nota: Só instanciamos, não renderizamos ainda.
        this.controllers = {
            'Home': new HomePage(),
            'Expense': new ExpensePage(), // new ExpensePage(),
            'Search': null,
            'Profile': null
        };
    }

    // Método chamado APÓS o HTML do App ser injetado
    init() {
        this.pages = document.querySelectorAll(".Pages");
        this.navButtons = document.querySelectorAll(".nav-button");
        
        // Adiciona eventos de clique aos botões
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Pega o ID do botão (ex: Home-btn) e tira o "-btn"
                // currentTarget garante que pegamos o botão, não o ícone dentro dele
                const targetId = e.currentTarget.id.split('-')[0];
                this.navigateTo(targetId);
            });
        });
        // Inicia na Home
        this.navigateTo("Home");
    }

async navigateTo(pageId) {
        // Esconde todas as páginas visualmente
        this.pages.forEach(page => page.style.display = 'none');
        
        // Mostra a div container da página atual
        const currentPage = document.getElementById(pageId);
        if(currentPage) currentPage.style.display = 'block';

        this.activePageId = pageId; // Atualiza ID ativo para navbar

        const controller = this.controllers[pageId];
        if (controller) {
            // Renderiza o conteúdo dinâmico (HTML, eventos, dados)
            await controller.render();
        }

        this.updateNavStyles();
    }

    updateNavStyles() {
        this.navButtons.forEach(btn => {
            const btnId = btn.id.split('-')[0];
            const icon = btn.querySelector('svg'); // Assumindo que você tem SVG ou classes de cor
            const text = btn.querySelector('.nav-text');
            
            // Lógica simples de troca de classe (ajuste conforme seu CSS)
            if (btnId === this.activePageId) {
                btn.classList.add('active'); // Crie essa classe no CSS
                if(icon) icon.style.color = 'var(--cor-primaria)';
            } else {
                btn.classList.remove('active');
                if(icon) icon.style.color = 'var(--cor-texto-secundario)';
            }
        });
    }
}