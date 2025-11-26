

import { logout } from "../api/Login.js"; // Supondo que você tenha criado o authFetch

export class ProfilePage {
    constructor() {
        this.container = document.getElementById('Profile');
    }

    async render() {
        // 1. Mostra estado de carregamento
        this.container.innerHTML = `
            <div class="p-4 text-center">
                  <button type="button" id="logout" class="btn btn-primary btn-full-save">logout  </button>
            </div>`;

        try {
            // 2. Busca dados reais (Simulação aqui)
            // const response = await authFetch('/despesas/recentes');
            // const data = await response.json();
            
            // DADOS MOCKADOS PARA TESTE
            const logOut = document.getElementById(`logout`);
            logOut.addEventListener(`click`, e=>  logout());
            


        } catch (error) {
            console.error(error);
            this.container.innerHTML += `<p class="text-red-500">Erro ao logout </p>`;       }
    }
}