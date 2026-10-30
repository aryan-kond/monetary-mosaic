/** People may type commas or a ₹ sign, so strip them before reading the number. */
export const cleanAmount = (value: string) => value.replace(/[,\s₹]/g, '');

/** Shows paise only when there are some, so 620 stays 620 and 312.4 becomes 312.40. */
export const amountToInput = (amount: number) =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

/** Reads a typed amount. Returns null unless it is a positive number of rupees, with up to two decimals. */
export function readAmount(text: string): number | null {
  const digits = cleanAmount(text);
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(digits)) return null;
  const value = Number(digits);
  return value > 0 ? value : null;
}
