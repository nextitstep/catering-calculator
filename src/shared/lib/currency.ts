export function formatMoney(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
  return `${formatted} DA`;
}

export function formatPercent(value: number): string {
  return `${Number.isFinite(value) ? value.toFixed(2) : '0.00'}%`;
}
