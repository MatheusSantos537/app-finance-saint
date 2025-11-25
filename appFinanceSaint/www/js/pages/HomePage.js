import {  renderExpenseList } from "../components/expenseList.js";

import { authFetch } from "../api/config.js"; // Supondo que você tenha criado o authFetch

export class HomePage {
    constructor() {
        this.container = document.getElementById('Home');
    }

    async render() {
        // 1. Mostra estado de carregamento
        this.container.innerHTML = `
            <div class="p-4 text-center">
                <h1 class="text-2xl font-bold mb-4">Resumo</h1>
                <p>Carregando despesas...</p>
            </div>`;

        try {
            // 2. Busca dados reais (Simulação aqui)
            // const response = await authFetch('/despesas/recentes');
            // const data = await response.json();
            
            // DADOS MOCKADOS PARA TESTE
            const dadosMockados = [
                {
                    id: "1",
                    descricao: "Compras Supermercado",
                    valor: 850.50,
                    dataVencimento: "2025-11-20T10:00:00Z", // Data passada
                    status: "pago",
                    categoria: "Alimentação",
                    parcelaInfo: null
                },
                {
                    id: "2",
                    descricao: "Notebook Dell (Trabalho)",
                    valor: 350.00,
                    dataVencimento: "2025-11-25T10:00:00Z", // Data próxima
                    status: "pendente",
                    categoria: "Eletrônicos",
                    parcelaInfo: {
                        atual: 3,
                        total: 10,
                        compraId: "uuid-qualquer"
                    }
                },
                {
                    id: "3",
                    descricao: "Aluguel Apartamento",
                    valor: 2200.00,
                    dataVencimento: "2025-12-05T10:00:00Z", // Data futura
                    status: "pendente",
                    categoria: "Moradia",
                    parcelaInfo: null
                },
                {
                    id: "4",
                    descricao: "Netflix 4K",
                    valor: 55.90,
                    dataVencimento: "2025-11-15T10:00:00Z",
                    status: "pago",
                    categoria: "Assinaturas",
                    parcelaInfo: null
                }
            ];
      
            this.container.innerHTML = `
                <div id="expense-list-container" class="expense-list-container">
                   
                </div>
            `;
            renderExpenseList(dadosMockados, 'expense-list-container');


        } catch (error) {
            console.error(error);
            this.container.innerHTML = `<p class="text-red-500">Erro ao carregar dados.</p>`;
        }
    }
}