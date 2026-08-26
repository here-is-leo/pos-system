export function formatPrice(amount: number): string {
   const toman = amount / 10;
  return new Intl.NumberFormat('fa-IR').format(toman);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n);
}