export function photoPriceCents(count: number) {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  if (n === 0) return 0;
  if (n <= 5) return n * 200;
  if (n <= 10) return 1000 + (n - 5) * 300;
  if (n <= 20) return 2500 + (n - 10) * 200;
  if (n <= 30) return 4500 + (n - 20) * 100;
  return 5500 + (n - 30) * 200;
}

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
