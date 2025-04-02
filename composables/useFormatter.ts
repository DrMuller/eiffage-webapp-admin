
// Format a number as currency (EUR)
export const useFormatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        currency: 'EUR'
    }).format(value);
};

export const useFormatIntCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        currency: 'EUR'
    }).format(value);
};


export const useFormatDate = (d: string | Date) => {
    const date = d instanceof Date ? d : new Date(d)
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' }).format(date)
}