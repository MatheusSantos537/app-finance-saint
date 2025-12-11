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

export const secureSum =  (valor1, valor2)  => {
 /**para 2 casas 0.00 */
  const fator = 100; 

  // Multiplica, arredonda para garantir que virou inteiro, soma e divide
  const soma = (Math.round(valor1 * fator) + Math.round(valor2 * fator)) / fator;

  return soma;
}