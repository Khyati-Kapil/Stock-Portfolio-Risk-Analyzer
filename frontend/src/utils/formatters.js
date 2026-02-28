// Currency formatting, % display

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

export const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
};
