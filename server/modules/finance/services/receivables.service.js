// Receivables: summary numbers + ageing buckets.
import invoiceRepo from "../repositories/invoice.repository.js";
import paymentRepo from "../repositories/payment.repository.js";
import calc from "../utils/paymentCalculator.js";
import { isOverdue } from "./invoice.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** invoiced / received / outstanding / overdue - all from the same rows. */
export async function getSummary() {
  const invoices = await invoiceRepo.findBalances();
  const received = await paymentRepo.sumReceived();
  const now = new Date();

  const invoiced = invoices.reduce((s, i) => s + Number(i.total), 0);
  const outstanding = invoices.reduce(
    (s, i) => s + calc.outstanding(i.total, i.paidAmount),
    0
  );
  const overdue = invoices
    .filter((i) => isOverdue(i, now))
    .reduce((s, i) => s + calc.outstanding(i.total, i.paidAmount), 0);

  return {
    invoiced: calc.round2(invoiced),
    received: calc.round2(received),
    outstanding: calc.round2(outstanding),
    overdue: calc.round2(overdue),
    invoiceCount: invoices.length,
  };
}

/** Receivables ageing: current, 1-30, 31-60, 60+ days past due. */
export async function getAgeing() {
  const invoices = await invoiceRepo.findBalances();
  const now = new Date();
  const buckets = { current: 0, days1to30: 0, days31to60: 0, over60: 0 };
  const rows = [];

  for (const i of invoices) {
    const balance = calc.outstanding(i.total, i.paidAmount);
    if (balance <= 0) continue;

    let bucket = "current";
    let daysPastDue = 0;
    if (i.dueDate) {
      daysPastDue = Math.floor((now - new Date(i.dueDate)) / DAY_MS);
      if (daysPastDue > 60) bucket = "over60";
      else if (daysPastDue > 30) bucket = "days31to60";
      else if (daysPastDue > 0) bucket = "days1to30";
    }

    buckets[bucket] = calc.round2(buckets[bucket] + balance);
    rows.push({
      invoiceNo: i.invoiceNo,
      dueDate: i.dueDate,
      daysPastDue: Math.max(0, daysPastDue),
      bucket,
      balance,
    });
  }

  return { buckets, rows };
}

export default { getSummary, getAgeing };
