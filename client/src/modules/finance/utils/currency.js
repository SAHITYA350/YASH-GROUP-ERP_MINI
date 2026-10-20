// Currency formatting for the finance module (Indian Rupee).
export function formatCurrency(value) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

// Compact form for stat cards, e.g. 1,18,000 -> "₹1.18 L", 2,00,000 -> "₹2.00 L".
export function formatCompact(value) {
  const n = Number(value ?? 0);
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)} K`;
  return formatCurrency(n);
}

export function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}
