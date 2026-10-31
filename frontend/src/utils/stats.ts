/** The middle value. For an even count, the average of the two middle values. */
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
