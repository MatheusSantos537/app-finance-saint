export const getMonthPickerHTML = (currentYear) => `
<div id="date-selector-modal" class="modal-overlay">
    <div class="modal-content" style="height: auto; min-height: 50vh;">
        <div class="modal-header">
            <h2 class="modal-title">Filtrar Período</h2>
            <button class="btn-close-modal" id="btn-close-picker">&times;</button>
        </div>
        
        <div class="month-picker-container">
            <div class="year-selector">
                <button class="btn-year-nav" id="prev-year">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                </button>
                <span class="year-display" id="display-year">${currentYear}</span>
                <button class="btn-year-nav" id="next-year">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                </button>
            </div>

            <div class="months-grid">
                ${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                    .map((m, index) => `<button class="month-btn" data-month="${index + 1}">${m}</button>`)
                    .join('')}
            </div>
        </div>
    </div>
</div>
`;