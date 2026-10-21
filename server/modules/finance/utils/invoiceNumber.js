// Invoice number helper - suggests the next number in the sequence
// INV-YYYYMM-0001 so the team does not clash when creating invoices.

/**
 * @param {number} existingCount how many invoices already exist
 * @param {Date}   [when]        date used for the YYYYMM part (defaults to now)
 */
export function suggestInvoiceNo(existingCount, when = new Date()) {
  const year = when.getFullYear();
  const month = String(when.getMonth() + 1).padStart(2, "0");
  const seq = String(existingCount + 1).padStart(4, "0");
  return `INV-${year}${month}-${seq}`;
}

/** Same pattern for customer receipts. */
export function suggestPaymentNo(existingCount, when = new Date()) {
  const year = when.getFullYear();
  const month = String(when.getMonth() + 1).padStart(2, "0");
  const seq = String(existingCount + 1).padStart(4, "0");
  return `RCPT-${year}${month}-${seq}`;
}

export default { suggestInvoiceNo, suggestPaymentNo };
