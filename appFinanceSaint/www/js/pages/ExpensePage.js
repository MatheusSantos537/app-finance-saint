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
            view: 'dashboard', // 'dashboard' | 'list' | 'reports'
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

        // Variável de estado para controlar qual mês já foi carregado
        this.currentLoadedMonth = null;

        // Timeout para debounce de carregamento (caso queira usar)
        this.searchTimeout = null;
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


    // REMOVIDO: initSliderObserver original (IntersectionObserver) — substituído por cliques simples


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
                <div class="p-4 flex items-center gap-4 justify-between">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button id="btn-back-reports" style="background:none; border:none; color:var(--cor-texto);">
                             <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
                        </button>
                        <h2 class="text-xl font-bold">Relatórios</h2>
                    </div>

                    <div style="display:flex; align-items:center; gap:8px;">
                        <button id="year-prev" title="Ano anterior" style="background:none; border:none; font-size:1.2rem;">◀</button>
                        <select id="year-select" style="padding:6px 8px; border-radius:6px;"></select>
                        <button id="year-next" title="Próximo ano" style="background:none; border:none; font-size:1.2rem;">▶</button>
                    </div>
                </div>

                <div class="month-slider-container" style="padding: 0 12px;">
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

        // Popula o select de anos com um intervalo útil
        this.populateYearSelect();

        // Popula os meses e ajusta mês/ano inicial a partir do estado
        this.populateSlider();

        // Define mês ativo inicial:
        // Se não há mês/ano carregado, escolhe mês corrente se o ano selecionado for o corrente,
        // senão escolhe Janeiro (1).
        if (!this.currentLoadedYear || this.currentLoadedYear !== this.state.selectedYear) {
            if (this.state.selectedYear === new Date().getFullYear()) {
                this.currentLoadedMonth = new Date().getMonth() + 1;
            } else {
                this.currentLoadedMonth = 1; // Janeiro por padrão para anos diferentes do atual
            }
            this.currentLoadedYear = this.state.selectedYear;
        }

        // Centraliza e carrega o mês selecionado
        this.scrollToSelectedMonth();

        // Eventos dos controles de ano
        document.getElementById('year-prev').addEventListener('click', () => {
            this.state.selectedYear--;
            this.onYearChanged();
        });
        document.getElementById('year-next').addEventListener('click', () => {
            this.state.selectedYear++;
            this.onYearChanged();
        });
        document.getElementById('year-select').addEventListener('change', (e) => {
            this.state.selectedYear = parseInt(e.target.value, 10);
            this.onYearChanged();
        });

        // Botão voltar — apenas troca a view
        document.getElementById('btn-back-reports').addEventListener('click', () => {
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
            // Usa 'auto' para ser instantâneo, não 'smooth' — evita disparos indesejados
            slides[currentMonthIndex].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
            
            // Marca visualmente como ativo
            slides.forEach(s => s.classList.remove('active'));
            slides[currentMonthIndex].classList.add('active');
            
            // Define o mês carregado e carrega relatório inicial
            this.currentLoadedMonth = currentMonthIndex + 1;
            this.loadReportData(this.currentLoadedMonth, this.state.selectedYear);
        }
    }

     scrollToSelectedMonth() {
        const slider = document.getElementById('monthSlider');
        if (!slider) return;
        const slides = slider.querySelectorAll('.month-slide');
        const index = (this.currentLoadedMonth ? this.currentLoadedMonth - 1 : 0);

        if (slides[index]) {
            // centraliza e marca ativo
            slides[index].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');

            // carrega os dados para o mês/ano atual do estado
            const mes = Number(slides[index].dataset.monthIndex);
            const ano = Number(this.state.selectedYear);

            // evita recarga se já estivermos com mesmo mês+ano carregado
            if (this.currentLoadedMonth === mes && this.currentLoadedYear === ano) {
                // já carregado: garante que visualize o conteúdo sem refetch
                return;
            }

            // atualiza estado carregado e busca dados
            this.currentLoadedMonth = mes;
            this.currentLoadedYear = ano;

            // Debounce curto para evitar chamadas duplas
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.loadReportData(mes, ano);
            }, 80);
        }
    }

    populateSlider() {
          const slider = document.getElementById('monthSlider');
        if (!slider) return;

        // Remove elementos antigos para evitar duplicação de listeners
        slider.innerHTML = '';

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

            // marca como ativo se corresponde ao mês/ano carregado
            if (this.currentLoadedMonth === (index + 1) && this.currentLoadedYear === this.state.selectedYear) {
                slide.classList.add('active');
            }

            // EVENTO DE CLIQUE (simples, sem observer)
            slide.addEventListener('click', () => {
                // 1. Visual imediato (UX rápida)
                slider.querySelectorAll('.month-slide').forEach(s => s.classList.remove('active'));
                slide.classList.add('active');

                const mes = Number(slide.dataset.monthIndex);
                const ano = Number(slide.dataset.year);

                // Se já carregamos esse mês+ano, não recarrega (evita chamadas redundantes)
                if (this.currentLoadedMonth === mes && this.currentLoadedYear === ano) {
                    slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    return;
                }

                // Atualiza estado e carrega dados
                this.currentLoadedMonth = mes;
                this.currentLoadedYear = ano;

                // Smooth scroll para o centro (opcional)
                slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

                // Debounce simples caso o usuário clique rápido várias vezes
                if (this.searchTimeout) clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.loadReportData(mes, ano);
                }, 150);
            });

            slider.appendChild(slide);
        });
    }

      populateYearSelect() {
        const select = document.getElementById('year-select');
        if (!select) return;
        const cur = new Date().getFullYear();
        const start = cur - 5;
        const end = cur + 2;
        select.innerHTML = '';
        for (let y = start; y <= end; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.text = y;
            if (y === this.state.selectedYear) opt.selected = true;
            select.appendChild(opt);
        }
    }

       onYearChanged() {
        // Atualiza select visual (caso tenha mudado via prev/next)
        const select = document.getElementById('year-select');
        if (select) select.value = this.state.selectedYear;

        // Repopula o slider com o ano selecionado
        this.populateSlider();

        // Ajusta mês inicial quando troca de ano:
        if (this.state.selectedYear === new Date().getFullYear()) {
            // mantém o mês atual se já for o mesmo ano, senão usa mês corrente
            this.currentLoadedMonth = this.currentLoadedMonth || (new Date().getMonth() + 1);
        } else {
            // para anos passados/futuros, mantém mês selecionado se já existia, senão january
            this.currentLoadedMonth = this.currentLoadedMonth || 1;
        }
        this.currentLoadedYear = this.state.selectedYear;

        // Scroll + load
        this.scrollToSelectedMonth();
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
        
        const totalMes = data.monthlyCost || 0;
        const totalItems = data.expenseNum || 0;
        
        // Dados Analíticos (Se disponíveis no Expense.js atualizado)
        const futureDebt = data.analytics?.futureDebt || 0; 
        const dailyAvg = data.analytics?.flow?.dailyAverage || 0;
        const  daysElapsed = data.analytics?.flow?.daysElapsed || 0;
        const daysInMonth = data.analytics?.flow?.daysInMonth || 0;
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
                                    <div class="progress-fill" style="width: ${(totalMes ? (cat.value / totalMes * 100) : 0)}%"></div>
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
