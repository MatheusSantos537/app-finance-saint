import { formatCurrency } from "../utils/utils.js"
import { formatDate } from "../utils/utils.js"


/**
 * Gera o HTML de um único card
 */
export function createExpenseCard(expense) {
    // Determina classes baseadas no status
    const isPaid = expense.status === 'pago';
    const statusClass = isPaid ? 'status-pago' : 'status-pendente';
    const badgeClass = isPaid ? 'badge-pago' : 'badge-pendente';
    const statusLabel = isPaid ? 'Pago' : 'Pendente';
    
    // Verifica se é parcelado para mostrar no título
    const parcelText = expense.parcelaInfo 
        ? ` <span style="font-size:0.8em; opacity:0.7">(${expense.parcelaInfo.atual}/${expense.parcelaInfo.total})</span>` 
        : '';

    // Atenção: Convertendo o objeto inteiro para string para passar no onclick (forma simples)
    // Em produção, ideal seria buscar pelo ID
    const expenseString = encodeURIComponent(JSON.stringify(expense));

    return `
        <div class="expense-card ${statusClass}" onclick="openExpenseModal('${expenseString}')">
            <div class="expense-info">
                <span class="expense-title">${expense.descricao} ${parcelText}</span>
                <span class="expense-date">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>
                    ${formatDate(expense.dataVencimento)}
                </span>
            </div>
            
            <div class="expense-amount-container">
                <span class="expense-amount">${formatCurrency(expense.valor)}</span>
                <span class="expense-badge ${badgeClass}">${statusLabel}</span>
            </div>
        </div>
    `;
}

/**
 * Função para Renderizar a Lista Inteira
 * @param {Array} expenses - Array de objetos vindos da API
 * @param {String} containerId - ID da div onde renderizar
 */
export function renderExpenseList(expenses, containerId = 'expense-list-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Limpa lista anterior

    if (expenses.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--cor-texto-secundario); margin-top:2rem;">Nenhuma despesa encontrada.</p>';
        return;
    }

    // Gera o HTML de todos os cards e insere
    const listHtml = expenses.map(expense => createExpenseCard(expense)).join('');
    container.innerHTML = listHtml;
}

/**
 * LÓGICA DO MODAL
 * 
 */

window.openExpenseModal = (expenseString) => {
    const expense = JSON.parse(decodeURIComponent(expenseString));
    const modal = document.getElementById('expense-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.innerText = expense.descricao;

    modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Valor</span>
            <span class="detail-value" style="font-size:1.2rem; color:var(--cor-primaria)">
                ${formatCurrency(expense.valor)}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Vencimento</span>
            <span class="detail-value">${formatDate(expense.dataVencimento)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Categoria</span>
            <span class="detail-value">${expense.categoria || 'Geral'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value" style="text-transform:capitalize">${expense.status}</span>
        </div>
        ${expense.parcelaInfo ? `
        <div class="detail-row">
            <span class="detail-label">Parcela</span>
            <span class="detail-value">${expense.parcelaInfo.atual} de ${expense.parcelaInfo.total}</span>
        </div>` : ''}
    `;

    const actionBtn = document.getElementById('modal-action-btn');
    /**Temporariamente escondido */
    actionBtn.style.display = `none`
    if(expense.status === 'pendente') {
        actionBtn.innerText = 'Marcar como Pago';
        actionBtn.onclick = () => { alert(`Lógica para pagar despesa ID: ${expense.id}`); };
    } else {
        actionBtn.innerText = 'Fechar';
        actionBtn.onclick = window.closeExpenseModal;
    }

    modal.classList.add('open');
};

window.closeExpenseModal = () => {
    document.getElementById('expense-modal').classList.remove('open');
};