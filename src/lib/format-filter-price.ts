/** Stable locale formatting for filter labels (SSR + client must match). */
export function formatFilterPrice(value: string | number): string {
  const amount = typeof value === 'number' ? value : parseInt(String(value).trim(), 10);
  if (Number.isNaN(amount)) return String(value);
  return amount.toLocaleString('en-HK');
}
