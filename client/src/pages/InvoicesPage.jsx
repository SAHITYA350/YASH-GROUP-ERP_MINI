import { useState } from "react";
import { Eye, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import DataList from "../components/DataList.jsx";
import { ErrorMessage, Modal } from "../components/ui.jsx";
import api, { getApiErrorMessage } from "../services/api.js";
import { label, money } from "../utils/formatters.js";

const STATUS_COLOR = {
  DRAFT: "#94a3b8",
  ISSUED: "#0ea5e9",
  PARTIALLY_PAID: "#f59e0b",
  PAID: "#15803d",
  OVERDUE: "#b91c1c",
  VOID: "#64748b",
};

function RecordPaymentModal({ invoice, close, onDone }) {
  const balance = parseFloat(invoice.total) - parseFloat(invoice.paidAmount || 0);
  const [amount, setAmount] = useState(String(balance.toFixed(2)));
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError({ message: "Enter a valid amount" }); return; }
    if (amt > balance) { setError({ message: `Amount cannot exceed outstanding balance of ${money(balance)}` }); return; }
    try {
      setLoading(true);
      setError(null);
      await api.post(`/invoices/${invoice.id}/payments`, {
        amount: amt,
        method,
        referenceNo: referenceNo || null,
        notes: notes || null,
      });
      onDone();
    } catch (err) {
      setError({ message: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Record Payment" close={close}>
      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <div style={{ background: "#ecfdf5", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          <strong>Invoice:</strong> {invoice.invoiceNo} · Outstanding: <strong>{money(balance)}</strong>
        </div>
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          Amount received (₹) *
          <input
            type="number"
            min="0.01"
            step="any"
            max={balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ marginTop: 6, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10 }}
          />
        </label>
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          Payment method
          <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ marginTop: 6, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10, background: "#fff" }}>
            {["BANK_TRANSFER", "UPI", "CHEQUE", "CASH", "CREDIT", "OTHER"].map((m) => (
              <option key={m} value={m}>{label(m)}</option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          Reference / UTR no.
          <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="e.g. UTR123456" style={{ marginTop: 6, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10 }} />
        </label>
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional…" style={{ marginTop: 6, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10, minHeight: 60 }} />
        </label>
        {error && <ErrorMessage error={error} />}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={close}>Cancel</button>
          <button type="submit" disabled={loading} className="primary">{loading ? "Saving…" : "Record Payment"}</button>
        </div>
      </form>
    </Modal>
  );
}

function InvoiceDetailDrawer({ invoice, close, onRefresh }) {
  const [payOpen, setPayOpen] = useState(false);
  const paidAmount = parseFloat(invoice.paidAmount || 0);
  const total = parseFloat(invoice.total || 0);
  const balance = total - paidAmount;
  const paidPercent = total > 0 ? Math.min(100, (paidAmount / total) * 100) : 0;
  const isPaid = invoice.status === "PAID" || balance <= 0;

  return (
    <Modal title={`Invoice — ${invoice.invoiceNo}`} close={close}>
      <div style={{ display: "grid", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 14 }}>
          <div><span style={{ color: "#64748b" }}>Customer</span><br /><strong>{invoice.customer?.name}</strong></div>
          <div>
            <span style={{ color: "#64748b" }}>Status</span><br />
            <span className="badge" style={{ background: (STATUS_COLOR[invoice.status] || "#94a3b8") + "22", color: STATUS_COLOR[invoice.status] || "#94a3b8" }}>
              {label(invoice.status)}
            </span>
          </div>
          <div><span style={{ color: "#64748b" }}>Sales Order</span><br />{invoice.salesOrder?.orderNumber || "—"}</div>
          <div><span style={{ color: "#64748b" }}>Issue date</span><br />{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("en-IN") : "—"}</div>
          <div><span style={{ color: "#64748b" }}>Due date</span><br />{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN") : "—"}</div>
          <div><span style={{ color: "#64748b" }}>Customer PO</span><br />{invoice.salesOrder?.customerPONumber || "—"}</div>
        </div>

        {/* Items */}
        <div>
          <strong style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 8 }}>INVOICE ITEMS</strong>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Description</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Qty</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Price</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Tax</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, i) => (
                  <tr key={item.id || i}>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #e2e8f0" }}>{item.description}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{parseFloat(item.quantity).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{money(item.unitPrice)}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{money(item.taxAmount)}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}><strong>{money(item.lineTotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#64748b" }}>
            <span>Subtotal</span><span>{money(invoice.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#64748b" }}>
            <span>Tax</span><span>{money(invoice.taxAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: "1px solid #bbf7d0", paddingTop: 8 }}>
            <span>Total</span><span style={{ color: "#047857" }}>{money(invoice.total)}</span>
          </div>
        </div>

        {/* Payment progress — EXTRA FEATURE */}
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>💰 Payment status</span>
            <span style={{ color: "#64748b" }}>{paidPercent.toFixed(0)}% paid</span>
          </div>
          <div style={{ background: "#e2e8f0", borderRadius: 999, height: 8, marginBottom: 8 }}>
            <div style={{ background: isPaid ? "#15803d" : "#f59e0b", borderRadius: 999, height: 8, width: `${paidPercent}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>Paid: <strong style={{ color: "#15803d" }}>{money(paidAmount)}</strong></span>
            <span>Outstanding: <strong style={{ color: balance > 0 ? "#b45309" : "#15803d" }}>{money(balance)}</strong></span>
          </div>

          {/* Payment history */}
          {invoice.payments?.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #fed7aa" }}>
              <strong style={{ fontSize: 12, color: "#64748b" }}>PAYMENT HISTORY</strong>
              {invoice.payments.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: "#374151" }}>
                  <span>{new Date(p.receivedAt).toLocaleDateString("en-IN")} · {label(p.method)}</span>
                  <span>{p.referenceNo && <span style={{ color: "#64748b" }}>{p.referenceNo} · </span>}<strong>{money(p.amount)}</strong></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isPaid && (
          <button
            className="primary small"
            onClick={() => setPayOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}
          >
            💳 Record Payment
          </button>
        )}
      </div>

      {payOpen && (
        <RecordPaymentModal
          invoice={invoice}
          close={() => setPayOpen(false)}
          onDone={() => {
            setPayOpen(false);
            onRefresh();
            close();
          }}
        />
      )}
    </Modal>
  );
}

export default function InvoicesPage() {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const openDetail = async (invoice) => {
    try {
      const result = await api.get(`/invoices/${invoice.id}`);
      setSelected(result.data.data);
    } catch (err) {
      setError({ message: getApiErrorMessage(err) });
    }
  };

  const exportExcel = async () => {
    try {
      const result = (await api.get("/invoices?pageSize=100")).data;
      const rows = result.data.map((inv) => ({
        InvoiceNo: inv.invoiceNo,
        Customer: inv.customer?.name,
        SalesOrder: inv.salesOrder?.orderNumber,
        Status: inv.status,
        Subtotal: inv.subtotal,
        Tax: inv.taxAmount,
        Total: inv.total,
        PaidAmount: inv.paidAmount,
        Balance: parseFloat(inv.total) - parseFloat(inv.paidAmount || 0),
        IssueDate: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("en-IN") : "",
        DueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "",
      }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Invoices");
      XLSX.writeFile(book, "yash-invoices-export.xlsx");
    } catch (requestError) {
      setError({ message: getApiErrorMessage(requestError) });
    }
  };

  return (
    <>
      <DataList
        resource={`invoices?_r=${refresh}`}
        title="Invoices"
        action={
          <div className="toolbar">
            <button className="secondary small" onClick={exportExcel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileDown size={15} /> Export Excel
            </button>
          </div>
        }
        columns={["Invoice No", "Customer", "Sales Order", "Issue date", "Due date", "Total", "Status", ""]}
        row={(invoice) => {
          const paidAmt = parseFloat(invoice.paidAmount || 0);
          const totalAmt = parseFloat(invoice.total || 0);
          const balance = totalAmt - paidAmt;
          return (
            <tr key={invoice.id}>
              <td><strong>{invoice.invoiceNo}</strong></td>
              <td>{invoice.customer?.name}</td>
              <td>{invoice.salesOrder?.orderNumber || "—"}</td>
              <td>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("en-IN") : "—"}</td>
              <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN") : "—"}</td>
              <td>
                <strong>{money(invoice.total)}</strong>
                {balance > 0 && balance < totalAmt && (
                  <small style={{ color: "#f59e0b" }}>Balance: {money(balance)}</small>
                )}
              </td>
              <td>
                <span className="badge" style={{ background: (STATUS_COLOR[invoice.status] || "#94a3b8") + "22", color: STATUS_COLOR[invoice.status] || "#94a3b8" }}>
                  {label(invoice.status)}
                </span>
              </td>
              <td>
                <button
                  className="secondary small"
                  onClick={() => openDetail(invoice)}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Eye size={14} /> View
                </button>
              </td>
            </tr>
          );
        }}
      />
      {error && <ErrorMessage error={error} />}
      {selected && (
        <InvoiceDetailDrawer
          invoice={selected}
          close={() => setSelected(null)}
          onRefresh={() => {
            setRefresh((r) => r + 1);
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
