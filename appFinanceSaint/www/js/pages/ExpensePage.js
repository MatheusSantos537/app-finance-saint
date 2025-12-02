import { renderExpenseList } from "../components/expenseList.js";
import { getFabButtonHTML, getFormOverlayHTML } from "../components/expenseForm.js";
import { getCurrentUser } from "../api/Login.js";
import { Expense } from "../api/Expense.js";
import { getMonthPickerHTML } from "../components/datePicker.js";
// import { authFetch } from "../api/config.js"; 

export class ExpensePage {
constructor() {
        this.container = document.getElementById('Expense');
        
        // Estado da Página
        this.state = {
            view: 'dashboard', // 'dashboard' | 'list'
            selectedYear: new Date().getFullYear(),
            selectedMonth: null
        };

        // Estado do Formulário (mantido do seu código original)
        this.formState = {
            tipo: 'unica',
            categoria: 'Outros'
        };
    }

  async render() {
        // Limpa container
        this.container.innerHTML = '';

        // 1. Renderiza a estrutura base dependendo da View
        if (this.state.view === 'dashboard') {
            this.renderDashboard();
        } else {
            this.renderListView();
        }

        // 2. Componentes Globais (FAB e Modal de Cadastro estão sempre no DOM, mas ocultos/sobrepostos)
        // Adicionamos apenas se ainda não existirem para evitar duplicação ao re-renderizar
        if (!document.getElementById('expense-form-overlay')) {
            this.container.insertAdjacentHTML('beforeend', getFabButtonHTML());
            this.container.insertAdjacentHTML('beforeend', getFormOverlayHTML());
            this.setupFormEvents(); // Reativa eventos do form
        }
        
        // 3. Renderiza o Modal do DatePicker (Oculto)
        if (!document.getElementById('date-selector-modal')) {
            this.container.insertAdjacentHTML('beforeend', getMonthPickerHTML(this.state.selectedYear));
            this.setupDatePickerEvents();
        }
    }

    renderDashboard() {
        const dashboardHTML = `
            <div class="p-4 fade-in">
                <h1 class="text-2xl font-bold mb-6">Finanças</h1>
                
                <div class="dashboard-grid">
                    <div class="feature-card" id="card-consultar">
                        <svg class="feature-icon" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>
                        <span class="feature-title">Consultar Mês</span>
                    </div>

                    <div class="feature-card" style="opacity:0.5">
                        <svg class="feature-icon" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V9H11v12h-1V2z"/></svg>
                        <span class="feature-title">Relatórios</span>
                    </div>
                </div>
            </div>
        `;
        
        // Injeta no container (preservando modais que estão no final)
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = dashboardHTML;
        this.container.insertBefore(contentDiv, this.container.firstChild);

        // Evento do Card
        document.getElementById('card-consultar').addEventListener('click', () => {
            document.getElementById('date-selector-modal').classList.add('open');
        });
    }

    // --- VIEW 2: LISTA (RESULTADOS) ---
    renderListView() {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const monthName = months[this.state.selectedMonth - 1];

        const listHTML = `
            <div class="p-4 fade-in" style="padding-bottom: 6rem;">
                <div class="page-header-nav">
                    <button id="btn-back-dashboard" style="background:none; border:none; color:var(--cor-texto);">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
                    </button>
                    <div>
                        <h2 class="text-xl font-bold">${monthName} de ${this.state.selectedYear}</h2>
                        <span style="font-size:0.8rem; color:var(--cor-texto-secundario)">Extrato de despesas</span>
                    </div>
                </div>

                <div id="expense-page-list">
                    <div style="text-align:center; margin-top:2rem;">
                        <div class="spinner"></div> Carregando...
                    </div>
                </div>
            </div>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = listHTML;
        this.container.insertBefore(contentDiv, this.container.firstChild);

        // Botão Voltar
        document.getElementById('btn-back-dashboard').addEventListener('click', () => {
            this.state.view = 'dashboard';
            this.render();
        });

        // Carrega os dados reais/mockados
        this.loadExpensesForPeriod(this.state.selectedMonth, this.state.selectedYear);
    }


// --- LÓGICA DE DADOS ---
/**
 * 
 * @param {Number | String} mes 
 * @param {Number | String} ano 
 */
    async loadExpensesForPeriod(mes, ano) {
        console.log(`Buscando despesas para ${mes}/${ano}`);
        const user = getCurrentUser();
        /** @type {String} */
        const familia_id = user?.userData?.cod_familia_desp;
        if(!familia_id)return alert(`Familia de despesa nao definida.`);
        try {
            
           const response = await Expense.getByRangeAndFamily({familia_id,mes,ano});
           if(response.error){
            console.log(`response api `,response);
            alert(`Erro ao consultar`);
           }
            /*const apiResponse = [
                {"id":"hZTx7VkRICzjY33iQ9o9","descricao":"Sofá (6/6)","valor":100,"categoria":"Casa","dataCompra":"2025-11-25T00:00:00.000Z","dataVencimento":"2025-11-20T00:00:00.000Z","status":"pendente","dataPagamento":null,"familiaId":{"_firestore":{"projectId":"saint-finance"},"_path":{"segments":["familias","Santos"]},"_converter":{}},"userId":{"_firestore":{"projectId":"saint-finance"},"_path":{"segments":["usuarios","a8sZRxNbF2YjSfNPgB6E"]},"_converter":{}},"tipo_desp":"parcelada","parcelaInfo":{"compraId":"17422894-a077-4d7b-aa5e-d7cbcc102c99","atual":6,"total":"6"}},
                {"id":"5Pvqj3yw6n3KEyoYuwLl","descricao":"Tapioca rendada (1/2)","valor":6,"categoria":"Alimentação","dataCompra":"2025-11-24T00:00:00.000Z","dataVencimento":"2025-11-26T00:00:00.000Z","status":"pendente","dataPagamento":null,"familiaId":{"_firestore":{"projectId":"saint-finance"},"_path":{"segments":["familias","Santos"]},"_converter":{}},"userId":{"_firestore":{"projectId":"saint-finance"},"_path":{"segments":["usuarios","a8sZRxNbF2YjSfNPgB6E"]},"_converter":{}},"tipo_desp":"parcelada","parcelaInfo":{"compraId":"c07a8262-74b4-4299-97a1-c58a2791b0ce","atual":1,"total":"2"}}
            ]; */
            renderExpenseList(response, 'expense-page-list');
        } catch (error) {
            console.Error(`Erro loadExpensesForPeriod`,error)
        }
       
        
 
 
    }

    // --- LÓGICA DO DATE PICKER ---
    setupDatePickerEvents() {
        const modal = document.getElementById('date-selector-modal');
        const displayYear = document.getElementById('display-year');
        
        // Fechar Modal
        document.getElementById('btn-close-picker').addEventListener('click', () => {
            modal.classList.remove('open');
        });

        // Navegar Ano
        document.getElementById('prev-year').addEventListener('click', () => {
            this.state.selectedYear--;
            displayYear.innerText = this.state.selectedYear;
        });

        document.getElementById('next-year').addEventListener('click', () => {
            this.state.selectedYear++;
            displayYear.innerText = this.state.selectedYear;
        });

        // Selecionar Mês
        const monthBtns = document.querySelectorAll('.month-btn');
        monthBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const month = parseInt(e.target.dataset.month);
                this.state.selectedMonth = month;
                
                // Fecha modal
                modal.classList.remove('open');
                
                // Troca a view para lista
                this.state.view = 'list';
                this.render(); // Re-renderiza a página com o novo estado
            });
        });
    }

    // --- LÓGICA DO FORMULÁRIO DINÂMICO ---
    setupFormEvents() {
        const overlay = document.getElementById('expense-form-overlay');
        const btnOpen = document.getElementById('btn-open-form');
        if(!btnOpen) return alert(`botao de abrir formulario com erro`);
        const btnClose = document.getElementById('btn-close-form');
        const inputAmount = document.getElementById('input-amount');
        const inputDate = document.getElementById('input-date');
        const inputDuedate = document.getElementById('input-Duedate');

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

        // TOGGLE: 
       const inputInstallments = document.getElementById('input-installments');
        const installmentsContainer = document.getElementById('installments-container');
        const opts = document.querySelectorAll('.segment-option');

        opts.forEach(opt => {
            opt.onclick = (e) => {
                opts.forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                this.formState.tipo = e.target.dataset.value;
                
                if (this.formState.tipo === 'parcelada') {
                    installmentsContainer.classList.add('visible');
                    inputInstallments.focus();
                } else {
                    installmentsContainer.classList.remove('visible');
                }
            }
        });
        const form = document.getElementById('new-expense-form');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', async (e) => await this.handleFormSubmit(e));
        const newInputAmount = document.getElementById('input-amount');
        newInputAmount.addEventListener('input', (e) => {
             let value = e.target.value.replace(/\D/g, "");
            if (value === "") return e.target.value = "";
            value = (parseInt(value) / 100).toFixed(2) + "";
            e.target.value = value.replace(".", ",");
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
        

        
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const rawValue = document.getElementById('input-amount').value.replace(',', '.');
        const description = document.getElementById('input-description').value;
        const date = document.getElementById('input-date').value;
        const dueDate = document.getElementById('input-Duedate').value;
        const installments = document.getElementById('input-installments').value;

        if (!rawValue || parseFloat(rawValue) === 0) {
            alert("Insira um valor válido.");
            return;
        }
        let user  = getCurrentUser();
        
        const novaDespesa = {
            familia_id: user?.userData?.cod_familia_desp,
            usuario_resp_id: user?.userId,
            valor_desp:parseFloat(rawValue),
            nome:description,
            
            categoria: this.formState.categoria,
            tipo_desp:this.formState.tipo, 
            dataVencimento:dueDate,
            dt_compra:date,    
            numeroParcelas: this.formState.tipo === 'parcelada' ? installments : 1,
        };
   
          

        console.log("Enviando para API:", novaDespesa);
        try {
            const response = await Expense.create(novaDespesa);
            if(response.error){
                alert(`Erro ao tentar criar despesa`);
                console.log(`resposta da api`,response);
                return false;
            }

               alert("Despesa salva (simulação)!");
               document.getElementById('expense-form-overlay').classList.remove('active');

        } catch (error) {
            alert(`Erro ao tentar criar despesa`);
            console.error(error);
            throw new Error("API retornou um erro", error);
            
        }
      
    }
}