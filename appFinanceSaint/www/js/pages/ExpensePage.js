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

        this.months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        this.monthsData = this.months;
        this.currentYear = new Date().getFullYear();
        this.observer = null;
    }

  

    async render() {
        this.container.innerHTML = '';

        // Roteamento simples de Views
        switch (this.state.view) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'list':
                this.renderListView();
                break;
            case 'reports':
                this.renderReportsView(); // Nova View
                break;
        }

        // Componentes Globais (FAB, Modais)
        if (!document.getElementById('expense-form-overlay')) {
            this.container.insertAdjacentHTML('beforeend', getFabButtonHTML());
            this.container.insertAdjacentHTML('beforeend', getFormOverlayHTML());
            this.setupFormEvents();
        }
        
        if (!document.getElementById('date-selector-modal')) {
            this.container.insertAdjacentHTML('beforeend', getMonthPickerHTML(this.state.selectedYear));
            this.setupDatePickerEvents();
        }
    }
    renderDashboard() {
        // Removi a opacity:0.5 do card de relatórios e adicionei ID
        const dashboardHTML = `
            <div class="p-4 fade-in">
                <h1 class="text-2xl font-bold mb-6">Finanças</h1>
                
                <div class="dashboard-grid">
                    <div class="feature-card" id="card-consultar">
                        <svg class="feature-icon" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>
                        <span class="feature-title">Consultar Mês</span>
                    </div>

                    <div class="feature-card" id="card-relatorios">
                        <svg class="feature-icon" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V9H11v12h-1V2z"/></svg>
                        <span class="feature-title">Relatórios</span>
                    </div>
                </div>
            </div>
        `;
        
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = dashboardHTML;
        this.container.insertBefore(contentDiv, this.container.firstChild);

        // Eventos
        document.getElementById('card-consultar').addEventListener('click', () => {
            document.getElementById('date-selector-modal').classList.add('open');
        });

        // NOVO EVENTO: Ativa a view de Relatórios
        document.getElementById('card-relatorios').addEventListener('click', () => {
            this.state.view = 'reports';
            this.render(); 
        });
    }
    renderMonthSlider() {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'month-slider';
        sliderContainer.id = 'monthSlider';

        // Cria os 12 meses (poderia ser dinâmico para mais anos)
        this.months.forEach((name, index) => {
            const slide = document.createElement('div');
            slide.className = 'month-slide';
            slide.dataset.monthIndex = index + 1; // 1 a 12
            slide.dataset.year = this.currentYear;
            
            slide.innerHTML = `
                ${name}
                <span class="year">${this.currentYear}</span>
            `;

            sliderContainer.appendChild(slide);
        });

        return sliderContainer;
    }


    initSliderObserver() {
        const slider = document.getElementById('monthSlider');
        if (!slider) return;

        // Configuração do IntersectionObserver
        const options = {
            root: slider,
            threshold: 0.6 // Dispara quando 60% do mês estiver visível
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove classe active de todos e adiciona no atual
                    document.querySelectorAll('.month-slide').forEach(el => el.classList.remove('active'));
                    entry.target.classList.add('active');

                    // EXTRAI OS DADOS DO ELEMENTO
                    const mes = parseInt(entry.target.dataset.monthIndex);
                    const ano = parseInt(entry.target.dataset.year);

                    console.log(`Mês selecionado: ${mes}/${ano}`);
                    
                    // CHAMADA DA API/CACHE (Sua nova função)
                    this.loadDashboardData(mes, ano); 
                }
            });
        }, options);

        // Observa cada slide
        document.querySelectorAll('.month-slide').forEach(slide => {
            this.observer.observe(slide);
        });

        // Scroll automático para o mês atual na inicialização
        this.scrollToCurrentMonth();
    }

    // async scrollToCurrentMonth() {
    //     const currentMonthIndex = new Date().getMonth(); // 0-11
    //     const slides = document.querySelectorAll('.month-slide');
    //     if (slides[currentMonthIndex]) {
    //         slides[currentMonthIndex].scrollIntoView({ block: 'nearest', inline: 'center' });
    //     }
    // }

    async loadDashboardData(mes, ano) {
        // Exibe loading se necessário...
        
        // Pega ID da família (supondo que você tenha salvo no login)
        const familiaId = localStorage.getItem('familia_id') || "familias/Santos"; // Ajuste conforme seu app

        const result = await Expense.getExpenseValues({
            familia_id: familiaId,
            mes: mes,
            ano: ano
        });

        if (!result.error) {
            this.updateUI(result);
        }
    }

    updateUI(data) {
        // Aqui você atualiza os elementos HTML do dashboard
        // Exemplo:
        // document.getElementById('total-gastos').innerText = `R$ ${data.monthlyCost}`;
        // document.getElementById('divida-futura').innerText = `R$ ${data.analytics.futureDebt}`;
        
        console.log("Dados atualizados na tela:", data);
    }

    // // --- VIEW 2: LISTA (RESULTADOS) ---
    renderListView() {
        const months = this.months;
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

    // --- VIEW 3: RELATÓRIOS (SLIDER) ---
renderReportsView() {
        const reportsHTML = `
            <div class="fade-in" style="display:flex; flex-direction:column; height:100%; padding-bottom:6rem;">
                <div class="p-4 flex items-center gap-4">
                    <button id="btn-back-reports" style="background:none; border:none; color:var(--cor-texto);">
                         <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
                    </button>
                    <h2 class="text-xl font-bold">Relatórios Anuais</h2>
                </div>

                <div class="month-slider-container">
                    <div class="month-slider" id="monthSlider"></div>
                </div>

                <div id="analytics-content" class="p-4 flex-grow overflow-y-auto">
                    <div style="text-align:center; margin-top:4rem; color:var(--cor-texto-secundario)">
                         <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = reportsHTML;
        this.container.insertBefore(contentDiv, this.container.firstChild);

        // 1. Cria os meses
        this.populateSlider();

        // 2. Rola IMEDIATAMENTE para o mês atual (sem animação suave para não disparar gatilhos no caminho)
        this.scrollToCurrentMonth();

        // 3. Só liga o observador depois de 500ms (tempo suficiente para o scroll assentar)
        setTimeout(() => {
            this.initSliderObserver();
        }, 500);

        document.getElementById('btn-back-reports').addEventListener('click', () => {
            if (this.observer) this.observer.disconnect();
            this.state.view = 'dashboard';
            this.render();
        });
    }

    // NOVO MÉTODO: Rola para o mês atual sem ativar observadores
    scrollToCurrentMonth() {
        const slider = document.getElementById('monthSlider');
        if (!slider) return;

        const currentMonthIndex = new Date().getMonth(); // 0-11
        const slides = slider.querySelectorAll('.month-slide');
        
        if (slides[currentMonthIndex]) {
            // Usa 'auto' para ser instantâneo, não 'smooth'
            slides[currentMonthIndex].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
            
            // Marca visualmente como ativo e carrega dados iniciais manualmente
            slides[currentMonthIndex].classList.add('active');
            
            // Define o mês carregado para evitar reload se o observer ligar em seguida
            this.currentLoadedMonth = currentMonthIndex + 1;
            this.loadReportData(this.currentLoadedMonth, this.state.selectedYear);
        }
    }
populateSlider() {
        const slider = document.getElementById('monthSlider');
        if (!slider) return;

        this.monthsData.forEach((name, index) => {
            const slide = document.createElement('div');
            slide.className = 'month-slide';
            slide.dataset.monthIndex = index + 1;
            slide.dataset.year = this.state.selectedYear;
            
            // HTML Interno
            slide.innerHTML = `
                <span class="slide-month">${name}</span>
                <span class="slide-year">${this.state.selectedYear}</span>
            `;

            // EVENTO DE CLIQUE (A Mágica do Toque)
            slide.addEventListener('click', () => {
                // 1. Visual imediato (UX rápida)
                document.querySelectorAll('.month-slide').forEach(s => s.classList.remove('active'));
                slide.classList.add('active');

                // 2. Scroll suave para o centro (Isso vai disparar o Observer também)
                slide.scrollIntoView({ 
                    behavior: 'smooth', 
                    inline: 'center', 
                    block: 'nearest' 
                });
            });

            slider.appendChild(slide);
        });
    }

initSliderObserver() {
        const slider = document.getElementById('monthSlider');
        if (!slider) return;

        const options = {
            root: slider,
            // Mantém a mira laser no centro
            rootMargin: "0px -50% 0px -50%", 
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    
                    // Atualiza visual
                    slider.querySelectorAll('.month-slide').forEach(s => s.classList.remove('active'));
                    target.classList.add('active');

                    const mes = parseInt(target.dataset.monthIndex);
                    const ano = parseInt(target.dataset.year);

                    // AQUI ESTÁ A PROTEÇÃO: 
                    // Se o mês detectado for o mesmo que já carregamos no início, ignora.
                    if (this.currentLoadedMonth === mes) return;

                    this.currentLoadedMonth = mes;
                    console.log(`Carregando dados para: ${mes}/${ano}`);
                    
                    if (this.searchTimeout) clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        this.loadReportData(mes, ano);
                    }, 300);
                }
            });
        }, options);

        slider.querySelectorAll('.month-slide').forEach(slide => {
            this.observer.observe(slide);
        });
    }

    async loadReportData(mes, ano) {
        const container = document.getElementById('analytics-content');
        if(!container) return;

        container.innerHTML = `<div class="spinner" style="margin:2rem auto"></div>`;

        try {
            const user = await getCurrentUser();
            const familia_id = user?.userData?.cod_familia_desp;
            
            // Chama a API enriquecida (que criamos na etapa anterior)
            const result = await Expense.getExpenseValues({ familia_id, mes, ano });

            if (result.error) {
                container.innerHTML = `<p class="text-center">Erro ao carregar dados.</p>`;
                return;
            }

            this.updateAnalyticsUI(container, result, mes, ano);

        } catch (e) {
            console.error(e);
            container.innerHTML = `<p class="text-center">Erro inesperado.</p>`;
        }
    }

    updateAnalyticsUI(container, data, mes, ano) {
        // Formatação de moeda
        const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        // Dados extraídos da API (assumindo que você integrou a lógica anterior no Expense.js)
        // Se ainda não integrou no Expense.js, esses campos "analytics" virão undefined, 
        // então adicionei fallbacks seguros.
        const totalMes = data.monthlyCost || 0;
        const totalItems = data.expenseNum || 0;
        
        // Dados Analíticos (Se disponíveis no Expense.js atualizado)
        const futureDebt = data.analytics?.futureDebt || 0; 
        const dailyAvg = data.analytics?.flow?.dailyAverage || 0;
        const topExpense = data.analytics?.flow?.topExpense || { descricao: '-', valor: 0 };
        const categories = data.analytics?.categories || [];

        // Monta o HTML dos Cards
        let html = `
            <div class="analytics-grid animate-up">
                
                <div class="card highlight-card">
                    <h3>Gasto Total</h3>
                    <div class="big-number">${fmt(totalMes)}</div>
                    <p>${totalItems} despesas lançadas</p>
                </div>

                <div class="card">
                    <h3>Média Diária</h3>
                    <div class="medium-number">${fmt(dailyAvg)}</div>
                    <p>por dia neste mês</p>
                </div>

                ${futureDebt > 0 ? `
                <div class="card warning-card" style="grid-column: 1 / -1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3>Dívida Comprometida</h3>
                            <p>Soma das parcelas restantes (bola de neve)</p>
                        </div>
                        <div class="big-number warning-text">${fmt(futureDebt)}</div>
                    </div>
                </div>` : ''}

                <div class="card" style="grid-column: 1 / -1;">
                    <h3>Top Categorias</h3>
                    <div class="category-bars">
                        ${categories.slice(0, 3).map(cat => `
                            <div class="cat-row">
                                <div class="cat-info">
                                    <span>${cat.name}</span>
                                    <span>${fmt(cat.value)}</span>
                                </div>
                                <div class="progress-bg">
                                    <div class="progress-fill" style="width: ${(cat.value / totalMes * 100)}%"></div>
                                </div>
                            </div>
                        `).join('')}
                         ${categories.length === 0 ? '<p>Sem dados de categoria.</p>' : ''}
                    </div>
                </div>

                 ${topExpense.valor > 0 ? `
                 <div class="card">
                    <h3>Maior Compra</h3>
                    <p class="font-bold">${topExpense.descricao}</p>
                    <div class="medium-number">${fmt(topExpense.valor)}</div>
                 </div>` : ''}

            </div>
        `;

        container.innerHTML = html;
    }


// --- LÓGICA DE DADOS ---
/**
 * 
 * @param {Number | String} mes 
 * @param {Number | String} ano 
 */
    async loadExpensesForPeriod(mes, ano) {
        console.log(`Buscando despesas para ${mes}/${ano}`);
        const user = await getCurrentUser();
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
            console.error(`Erro loadExpensesForPeriod`,error)
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

setupFormEvents() {
        // 1. Garante que o HTML existe antes de buscar
        const overlay = document.getElementById('expense-form-overlay');
        const form = document.getElementById('new-expense-form');
        
        if (!overlay || !form) return; // Proteção contra erros

        // 2. Seleciona os elementos AGORA (sem clonar depois)
        const btnOpen = document.getElementById('btn-open-form');
        const btnClose = document.getElementById('btn-close-form');
        const inputAmount = document.getElementById('input-amount');
        const inputDate = document.getElementById('input-date');
        
        // --- EVENTOS DE ABRIR/FECHAR ---
        if (btnOpen) {
            // Remove listener antigo (se houver) recriando o elemento, 
            // ou apenas garante que não duplique se a lógica de render estiver correta.
            // Como seu render() limpa tudo, apenas adicionar o listener é seguro.
            btnOpen.onclick = () => {
                overlay.classList.add('active');
                
                // DATA DE HOJE (Correção solicitada anteriormente)
                const hoje = new Date().toISOString().split('T')[0];
                if(inputDate && !inputDate.value) inputDate.value = hoje;
                const inputDue = document.getElementById('input-Duedate');
                if(inputDue && !inputDue.value) inputDue.value = hoje;

                setTimeout(() => inputAmount && inputAmount.focus(), 350);
            };
        }

        if (btnClose) {
            btnClose.onclick = (e) => {
                e.preventDefault();
                overlay.classList.remove('active');
            };
        }

        // --- MÁSCARA DE MOEDA ---
        if (inputAmount) {
            inputAmount.oninput = (e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (value === "") return e.target.value = "";
                value = (parseInt(value) / 100).toFixed(2) + "";
                e.target.value = value.replace(".", ",");
            };
        }

        // --- SUBMIT DO FORMULÁRIO (SEM CLONE!) ---
        form.onsubmit = async (e) => {
            await this.handleFormSubmit(e);
        };

        // --- TOGGLE TIPO (PARCELADO / ÚNICO) ---
        // Ajustei para procurar tanto .segment-option quanto chips, por segurança
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

        // --- CHIPS DE CATEGORIA ---
       const chips = document.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                chips.forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.formState.categoria = e.target.dataset.value;
                document.getElementById('input-category').value = this.formState.categoria;
            });
        });
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
        let user  = await getCurrentUser();
        console.log(user,`handleFormsubmit`);
        
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

               
               document.getElementById('expense-form-overlay').classList.remove('active');

        } catch (error) {
            alert(`Erro ao tentar criar despesa`);
            console.error(error);
            throw new Error("API retornou um erro", error);
            
        }
      
    }
}