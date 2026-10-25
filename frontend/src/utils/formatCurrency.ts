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

/** Formats an amount as INR with Indian digit grouping, for example ₹1,25,000. */
export function formatCurrency(amount: number, options: { signed?: boolean } = {}): string {
  return (options.signed ? signedCurrencyFormat : currencyFormat).format(amount);
}
