// Currency formatter for Kenya Shillings
export const formatCurrency = (amount: number): string => {
    return `KSh ${amount.toLocaleString()}`;
};

// Short form for displaying currency symbol
export const CURRENCY_SYMBOL = 'KSh';
