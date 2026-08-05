export function formatINR(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(Math.round(amount));
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

export function formatCompactINR(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  return formatINR(amount);
}

export function monthLabel(year: number, month: number): string {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[month - 1]} ${year}`;
}
