import { renderExpenseList } from "../components/expenseList.js";
import { getFabButtonHTML, getFormOverlayHTML } from "../components/expenseForm.js";
// import { authFetch } from "../api/config.js"; 

export class ExpensePage {
    constructor() {
        this.container = document.getElementById('Expense');
        // Estado interno do formulário
        this.formState = {
            tipo: 'unica',
            categoria: 'Outros'
        };
    }

    async render() {
        // 1. Estrutura Base (Header + Lista vazia + FAB + Form Oculto)
        this.container.innerHTML = `
            <div class="p-4">
                <h1 class="text-2xl font-bold mb-4">Minhas Despesas</h1>
                <div id="expense-page-list">
                    <p class="text-center text-gray-500 mt-4">Carregando...</p>
                </div>
            </div>
            ${getFabButtonHTML()}
            ${getFormOverlayHTML()}
        `;

        // 2. Carregar Dados (Mockados por enquanto)
        this.loadData();

        // 3. Ativar a interatividade do formulário
        this.setupFormEvents();
    }

    async loadData() {
        // Simulação de dados (Igual ao que você tinha na Home, mas focado nessa página)
        const dadosMockados = [
            { id: "1", descricao: "Jantar Fora", valor: 120.00, dataVencimento: "2025-11-20T10:00:00Z", status: "pago", categoria: "Lazer" },
            { id: "2", descricao: "Internet", valor: 99.90, dataVencimento: "2025-11-25T10:00:00Z", status: "pendente", categoria: "Casa" }
        ];
        
        renderExpenseList(dadosMockados, 'expense-page-list');
    }

    // --- LÓGICA DO FORMULÁRIO DINÂMICO ---
    setupFormEvents() {
        const overlay = document.getElementById('expense-form-overlay');
        const btnOpen = document.getElementById('btn-open-form');
        const btnClose = document.getElementById('btn-close-form');
        const inputAmount = document.getElementById('input-amount');
        const inputDate = document.getElementById('input-date');

        // ABRIR FORM
        btnOpen.addEventListener('click', () => {
            overlay.classList.add('active');
            inputDate.valueAsDate = new Date(); // Seta hoje
            setTimeout(() => inputAmount.focus(), 350); // Foco automático
        });

        // FECHAR FORM
        btnClose.addEventListener('click', () => {
            overlay.classList.remove('active');
        });

        // MÁSCARA DE MOEDA
        inputAmount.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value === "") return e.target.value = "";
            value = (parseInt(value) / 100).toFixed(2) + "";
            e.target.value = value.replace(".", ",");
        });

        // TOGGLE: À VISTA vs PARCELADO
        const optVista = document.getElementById('opt-vista');
        const optParcelado = document.getElementById('opt-parcelado');
        const installmentsContainer = document.getElementById('installments-container');

        [optVista, optParcelado].forEach(opt => {
            opt.addEventListener('click', (e) => {
                // Atualiza visual
                optVista.classList.remove('selected');
                optParcelado.classList.remove('selected');
                e.target.classList.add('selected');

                // Atualiza estado e visibilidade
                this.formState.tipo = e.target.dataset.value;
                if (this.formState.tipo === 'parcelada') {
                    installmentsContainer.classList.add('visible');
                    document.getElementById('input-installments').focus();
                } else {
                    installmentsContainer.classList.remove('visible');
                }
            });
        });

        // CHIPS DE CATEGORIA
        const chips = document.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                chips.forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.formState.categoria = e.target.dataset.value;
                document.getElementById('input-category').value = this.formState.categoria;
            });
        });

        // SUBMIT DO FORMULÁRIO
        document.getElementById('new-expense-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const rawValue = document.getElementById('input-amount').value.replace(',', '.');
        const description = document.getElementById('input-description').value;
        const date = document.getElementById('input-date').value;
        const installments = document.getElementById('input-installments').value;

        if (!rawValue || parseFloat(rawValue) === 0) {
            alert("Insira um valor válido.");
            return;
        }

        const novaDespesa = {
            valor: parseFloat(rawValue),
            descricao: description,
            categoria: this.formState.categoria,
            data: date,
            tipo: this.formState.tipo,
            parcelas: this.formState.tipo === 'parcelada' ? installments : 1
        };

        console.log("Enviando para API:", novaDespesa);
        
        // Aqui você chamaria seu createExpense da API
        alert("Despesa salva (simulação)!");
        
        // Fecha e recarrega lista
        document.getElementById('expense-form-overlay').classList.remove('active');
        // this.loadData(); // Recarregaria a lista real
    }
}