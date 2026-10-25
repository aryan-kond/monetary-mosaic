const currencyFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const signedCurrencyFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});

const compactCurrencyFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Formats an amount as INR with Indian digit grouping, for example ₹1,25,000. */
export function formatCurrency(amount: number, options: { signed?: boolean } = {}): string {
  return (options.signed ? signedCurrencyFormat : currencyFormat).format(amount);
}

/** Short form for chart axes, for example ₹20K. */
export function formatCompactCurrency(amount: number): string {
  return compactCurrencyFormat.format(amount);
}
