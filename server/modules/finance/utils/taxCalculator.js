// GST helpers shared by invoice / bill / costing code.
// All money maths is done on numbers and rounded to 2 decimals.

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 * Split a GST-inclusive total into subtotal + tax.
 * splitGst(118000, 18) -> { subtotal: 100000, taxAmount: 18000, total: 118000 }
 */
export function splitGst(totalInclusive, ratePercent = 18) {
  const total = round2(totalInclusive);
  const subtotal = round2(total / (1 + ratePercent / 100));
  return { subtotal, taxAmount: round2(total - subtotal), total };
}

/**
 * Add GST on top of a subtotal.
 * addGst(100000, 18) -> { subtotal: 100000, taxAmount: 18000, total: 118000 }
 */
export function addGst(subtotal, ratePercent = 18) {
  const base = round2(subtotal);
  const taxAmount = round2((base * ratePercent) / 100);
  return { subtotal: base, taxAmount, total: round2(base + taxAmount) };
}

export default { round2, splitGst, addGst };
