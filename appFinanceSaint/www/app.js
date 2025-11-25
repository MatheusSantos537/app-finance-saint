import { LoginView } from "./js/views/LoginView.js";
import { AppLayout } from "./js/views/AppLayout.js";
import { Pages } from "./js/pages/Pages.js";
import { login } from "./js/api/Login.js"; // Precisa exportar a função 'login' no seu arquivo

const appRoot = document.getElementById('app-root');

// 1. Função para Renderizar Login
function renderLogin() {
    appRoot.innerHTML = LoginView;

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Chama sua função de login existente
            //await login(email, password); 
            // Se der sucesso, renderiza o App
            renderApp();
        } catch (error) {
            alert("Erro no login: " + error.message);
        }
    });
}

// 2. Função para Renderizar o App Principal
function renderApp() {
    // Injeta a estrutura (Menu + Containers de páginas)
    appRoot.innerHTML = AppLayout;

    // Inicializa a lógica de navegação
    const pagesManager = new Pages();
    pagesManager.init();

    // Opcional: Carregar dados iniciais do usuário aqui
    console.log("App carregado e pronto!");
}

// 3. Inicialização
function init() {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
        // Se tem token, verifica validade (opcional) e carrega App
        renderApp();
    } else {
        // Se não, carrega Login
        renderLogin();
    }
}

// Dispara quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', init);