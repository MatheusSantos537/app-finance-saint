export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const formatDate = (isoString) => {
    if (!isoString) return '--/--/----';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};