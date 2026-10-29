const base = { style: 'currency', currency: 'INR' } as const;

const whole = new Intl.NumberFormat('en-IN', { ...base, maximumFractionDigits: 0 });
const wholeSigned = new Intl.NumberFormat('en-IN', {
  ...base,
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});
const exact = new Intl.NumberFormat('en-IN', {
  ...base,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const exactSigned = new Intl.NumberFormat('en-IN', {
  ...base,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});
const compact = new Intl.NumberFormat('en-IN', {
  ...base,
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** True when the amount has paise, for example 312.40. Rounding first hides tiny float errors. */
const hasPaise = (amount: number) => Math.round(Math.abs(amount) * 100) % 100 !== 0;

/**
 * Formats an amount as INR with Indian digit grouping. Whole-rupee amounts show no decimals
 * (₹1,25,000) and amounts with paise show both digits (₹312.40), so nothing is ever rounded away.
 */
export function formatCurrency(amount: number, options: { signed?: boolean } = {}): string {
  if (hasPaise(amount)) return (options.signed ? exactSigned : exact).format(amount);
  return (options.signed ? wholeSigned : whole).format(amount);
}

/** Always shows paise, for example ₹312.00. Used where the exact figure from a file matters. */
export function formatExactCurrency(amount: number): string {
  return exact.format(amount);
}

/** Short form for chart axes, for example ₹20K. */
export function formatCompactCurrency(amount: number): string {
  return compact.format(amount);
}
