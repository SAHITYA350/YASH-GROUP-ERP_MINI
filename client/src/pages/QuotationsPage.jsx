import { useState } from "react";
import { Eye, CheckCircle, XCircle, ShoppingCart, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import DataList from "../components/DataList.jsx";
import { ErrorMessage, Modal } from "../components/ui.jsx";
import api, { getApiErrorMessage } from "../services/api.js";
import { label, money } from "../utils/formatters.js";

const STATUS_COLOR = {
  DRAFT: "#94a3b8",
  SENT_TO_CLIENT: "#0ea5e9",
  UNDER_REVISION: "#f59e0b",
  APPROVED: "#047857",
  REJECTED: "#b91c1c",
  EXPIRED: "#64748b",
  CONVERTED: "#15803d",
};

function ConvertToSOModal({ quotation, close, onDone }) {
  const [poNumber, setPoNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!poNumber.trim()) { setError({ message: "Customer PO number is required" }); return; }
    try {
      setLoading(true);
      setError(null);
      await api.post(`/quotations/${quotation.id}/sales-orders`, {
        customerPONumber: poNumber,
        expectedDeliveryDate: deliveryDate || null,
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
    <Modal title="Convert to Sales Order" close={close}>
      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <div style={{ background: "#ecfdf5", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          <strong>Quotation:</strong> {quotation.quotationNo} · {quotation.customer?.name} · {money(quotation.total)}
        </div>
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          Customer PO number *
          <input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="e.g. CUST-PO-2025-001" style={{ marginTop: 6, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10 }} />
        </label>
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          Expected delivery date
          <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} style={{ marginTop: 6, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10 }} />
        </label>
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" style={{ marginTop: 6, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10, minHeight: 70 }} />
        </label>
        {error && <ErrorMessage error={error} />}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={close}>Cancel</button>
          <button type="submit" disabled={loading} className="primary">{loading ? "Converting…" : "Create Sales Order"}</button>
        </div>
      </form>
    </Modal>
  );
}

function QuotationDetailDrawer({ quotation, close, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [convertOpen, setConvertOpen] = useState(false);

  const updateStatus = async (status) => {
    try {
      setLoading(true);
      setError(null);
      await api.patch(`/quotations/${quotation.id}/status`, { status });
      onRefresh();
      close();
    } catch (err) {
      setError({ message: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const canApprove = ["SENT_TO_CLIENT", "DRAFT"].includes(quotation.status);
  const canConvert = quotation.status === "APPROVED" && !quotation.salesOrder;

  return (
    <Modal title={`Quotation — ${quotation.quotationNo}`} close={close}>
      <div style={{ display: "grid", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 14 }}>
          <div><span style={{ color: "#64748b" }}>Customer</span><br /><strong>{quotation.customer?.name}</strong></div>
          <div>
            <span style={{ color: "#64748b" }}>Status</span><br />
            <span className="badge" style={{ background: (STATUS_COLOR[quotation.status] || "#94a3b8") + "22", color: STATUS_COLOR[quotation.status] || "#94a3b8" }}>
              {label(quotation.status)}
            </span>
          </div>
          <div><span style={{ color: "#64748b" }}>Sales Rep</span><br />{quotation.salesRepresentative?.name || quotation.preparedBy || "—"}</div>
          <div><span style={{ color: "#64748b" }}>Valid until</span><br />{quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN") : "—"}</div>
          {quotation.paymentTerms && <div><span style={{ color: "#64748b" }}>Payment terms</span><br />{quotation.paymentTerms}</div>}
          {quotation.deliveryTerms && <div><span style={{ color: "#64748b" }}>Delivery terms</span><br />{quotation.deliveryTerms}</div>}
        </div>

        {/* Line items table */}
        <div>
          <strong style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 8 }}>LINE ITEMS</strong>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Product</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Qty</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Unit Price</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>GST%</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(quotation.items || []).map((item, i) => (
                  <tr key={item.id || i}>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #e2e8f0" }}>
                      {item.product?.name || item.description || "—"}
                      {item.product?.variant && <span style={{ color: "#64748b", display: "block", fontSize: 12 }}>{item.product.variant}</span>}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{parseFloat(item.quantity).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{money(item.unitPrice)}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{parseFloat(item.taxPercent || 0)}%</td>
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
            <span>Subtotal</span><span>{money(quotation.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#64748b" }}>
            <span>GST</span><span>{money(quotation.gstAmount || quotation.taxAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: "1px solid #bbf7d0", paddingTop: 8 }}>
            <span>Grand Total</span><span style={{ color: "#047857" }}>{money(quotation.total)}</span>
          </div>
        </div>

        {quotation.salesOrder && (
          <div style={{ background: "#ecfdf5", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
            ✅ Converted to Sales Order: <strong>{quotation.salesOrder.orderNumber}</strong>
          </div>
        )}

        {error && <ErrorMessage error={error} />}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {quotation.status === "DRAFT" && (
            <button
              className="secondary small"
              onClick={() => updateStatus("SENT_TO_CLIENT")}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              Send to Client
            </button>
          )}
          {canApprove && (
            <button
              className="primary small"
              onClick={() => updateStatus("APPROVED")}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "#047857" }}
            >
              <CheckCircle size={14} /> Approve
            </button>
          )}
          {canApprove && (
            <button
              className="small"
              onClick={() => updateStatus("REJECTED")}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #b91c1c", color: "#b91c1c", background: "#fff", borderRadius: 8, padding: "9px 12px", fontWeight: 700, fontSize: 13 }}
            >
              <XCircle size={14} /> Reject
            </button>
          )}
          {canConvert && (
            <button
              className="primary small"
              onClick={() => setConvertOpen(true)}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "#065f46" }}
            >
              <ShoppingCart size={14} /> Convert to Sales Order
            </button>
          )}
        </div>
      </div>

      {convertOpen && (
        <ConvertToSOModal
          quotation={quotation}
          close={() => setConvertOpen(false)}
          onDone={() => {
            setConvertOpen(false);
            onRefresh();
            close();
          }}
        />
      )}
    </Modal>
  );
}

export default function QuotationsPage() {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const openDetail = async (quotation) => {
    try {
      const result = await api.get(`/quotations/${quotation.id}`);
      setSelected(result.data.data);
    } catch (err) {
      setError({ message: getApiErrorMessage(err) });
    }
  };

  const exportExcel = async () => {
    try {
      const result = (await api.get("/quotations?pageSize=100")).data;
      const rows = result.data.map((q) => ({
        QuotationNo: q.quotationNo,
        Customer: q.customer?.name,
        Status: q.status,
        Subtotal: q.subtotal,
        GST: q.gstAmount || q.taxAmount,
        Total: q.total,
        ValidUntil: q.validUntil ? new Date(q.validUntil).toLocaleDateString("en-IN") : "",
        PaymentTerms: q.paymentTerms,
        SalesOrder: q.salesOrder?.orderNumber || "",
        UpdatedAt: new Date(q.updatedAt).toLocaleDateString("en-IN"),
      }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Quotations");
      XLSX.writeFile(book, "yash-quotations-export.xlsx");
    } catch (requestError) {
      setError({ message: getApiErrorMessage(requestError) });
    }
  };

  return (
    <>
      <DataList
        resource={`quotations?_r=${refresh}`}
        title="Quotations"
        action={
          <div className="toolbar">
            <button className="secondary small" onClick={exportExcel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileDown size={15} /> Export Excel
            </button>
          </div>
        }
        columns={["Quotation", "Customer", "Items", "Status", "Total", "Updated", ""]}
        row={(quotation) => (
          <tr key={quotation.id}>
            <td>{quotation.quotationNo}</td>
            <td><b>{quotation.customer?.name}</b></td>
            <td>{quotation.items?.length || 0} item{(quotation.items?.length || 0) !== 1 ? "s" : ""}</td>
            <td>
              <span className="badge" style={{ background: (STATUS_COLOR[quotation.status] || "#94a3b8") + "22", color: STATUS_COLOR[quotation.status] || "#94a3b8" }}>
                {label(quotation.status)}
              </span>
            </td>
            <td><strong>{money(quotation.total)}</strong></td>
            <td>{new Date(quotation.updatedAt).toLocaleDateString("en-IN")}</td>
            <td>
              <button
                className="secondary small"
                onClick={() => openDetail(quotation)}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <Eye size={14} /> View
              </button>
            </td>
          </tr>
        )}
      />
      {error && <ErrorMessage error={error} />}
      {selected && (
        <QuotationDetailDrawer
          quotation={selected}
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