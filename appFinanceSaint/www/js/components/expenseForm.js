export const getFabButtonHTML = () => `
    <div class="fab-container">
        <button id="btn-open-form" class="btn-fab">
            +
        </button>
    </div>
`;

export const getFormOverlayHTML = () => `
<div id="expense-form-overlay" class="form-overlay">
    <div class="form-header">
        <button id="btn-close-form" class="btn-close-text">Cancelar</button>
        <span style="font-weight:600; font-size:1.1rem;">Nova Despesa</span>
        <button class="btn-close-text" style="visibility:hidden">X</button>
    </div>

    <div class="amount-section">
        <label class="currency-label">Qual o valor?</label>
        <div class="big-input-wrapper">
            <span class="currency-symbol">R$</span>
            <input type="tel" id="input-amount" class="big-amount-input" placeholder="0,00" autocomplete="off">
        </div>
    </div>

    <div class="form-body-scroll">
        <form id="new-expense-form">
            
            <div class="form-group">
                <label class="form-label">Descrição</label>
                <input type="text" id="input-description" class="form-input" placeholder="Ex: Mercado, Uber..." required>
            </div>

            <label class="form-label">Tipo de Pagamento</label>
            <div class="segmented-control">
                <div class="segment-option selected" data-value="unica" id="opt-vista">À vista</div>
                <div class="segment-option" data-value="parcelada" id="opt-parcelado">Parcelado</div>
            </div>
            
            <div id="installments-container" class="conditional-field">
                <label class="form-label">Número de Parcelas</label>
                <input type="number" id="input-installments" class="form-input" placeholder="Ex: 12" min="2" max="60">
            </div>

            <div class="form-group">
                <label class="form-label">Data</label>
                <input type="date" id="input-date" class="form-input">
            </div>

            <div class="form-group">
                <label class="form-label">Categoria</label>
                <div class="category-grid" id="category-chips">
                    <div class="category-chip active" data-value="Outros">Outros</div>
                    <div class="category-chip" data-value="Alimentação">Alimentação</div>
                    <div class="category-chip" data-value="Transporte">Transporte</div>
                    <div class="category-chip" data-value="Lazer">Lazer</div>
                    <div class="category-chip" data-value="Casa">Casa</div>
                </div>
                <input type="hidden" id="input-category" value="Outros">
            </div>

            <button type="submit" class="btn btn-primary btn-full-save">Salvar Despesa</button>
        </form>
    </div>
</div>
`;