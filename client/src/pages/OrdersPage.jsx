import { useState } from "react";
import { Eye, FileText, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import DataList from "../components/DataList.jsx";
import { ErrorMessage, Modal } from "../components/ui.jsx";
import api, { getApiErrorMessage } from "../services/api.js";
import { label, money } from "../utils/formatters.js";

const STATUS_COLOR = {
  DRAFT: "#94a3b8",
  PENDING: "#f59e0b",
  CONFIRMED: "#0ea5e9",
  PROCESSING: "#8b5cf6",
  READY_FOR_DISPATCH: "#047857",
  DISPATCHED: "#0891b2",
  DELIVERED: "#15803d",
  COMPLETED: "#166534",
  CANCELLED: "#b91c1c",
};

function SalesOrderDetailDrawer({ order, close, onRefresh }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateInvoice = async () => {
    try {
      setGenerating(true);
      setError(null);
      await api.post(`/sales-orders/${order.id}/invoices`, {});
      onRefresh();
      close();
    } catch (err) {
      setError({ message: getApiErrorMessage(err) });
    } finally {
      setGenerating(false);
    }
  };

  const hasInvoice = order.invoices?.length > 0;

  return (
    <Modal title={`Sales Order — ${order.orderNumber}`} close={close}>
      <div style={{ display: "grid", gap: 16 }}>
        {/* Header info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 14 }}>
          <div><span style={{ color: "#64748b" }}>Customer</span><br /><strong>{order.customer?.name}</strong></div>
          <div>
            <span style={{ color: "#64748b" }}>Status</span><br />
            <span className="badge" style={{ background: (STATUS_COLOR[order.status] || "#94a3b8") + "22", color: STATUS_COLOR[order.status] || "#94a3b8" }}>
              {label(order.status)}
            </span>
          </div>
          <div><span style={{ color: "#64748b" }}>Customer PO</span><br />{order.customerPONumber || "—"}</div>
          <div><span style={{ color: "#64748b" }}>Order date</span><br />{new Date(order.orderDate).toLocaleDateString("en-IN")}</div>
          {order.expectedDeliveryDate && (
            <div><span style={{ color: "#64748b" }}>Expected delivery</span><br />{new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN")}</div>
          )}
          {order.quotation && (
            <div><span style={{ color: "#64748b" }}>Quotation ref</span><br />{order.quotation.quotationNo}</div>
          )}
          {order.deliveryLocation && (
            <div><span style={{ color: "#64748b" }}>Delivery location</span><br />{order.deliveryLocation}</div>
          )}
        </div>

        {/* Line items table */}
        <div>
          <strong style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 8 }}>ORDER ITEMS</strong>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Product</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Qty</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Unit Price</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>GST</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#64748b", borderTop: "1px solid #e2e8f0" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, i) => (
                  <tr key={item.id || i}>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #e2e8f0" }}>
                      {item.productNameSnapshot || item.product?.name || "—"}
                      {item.product?.variant && <span style={{ color: "#64748b", display: "block", fontSize: 12 }}>{item.product.variant}</span>}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{parseFloat(item.quantity).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{money(item.unitPrice)}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>{money(item.gstAmount)}</td>
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
            <span>Subtotal</span><span>{money(order.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#64748b" }}>
            <span>GST</span><span>{money(order.gstAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: "1px solid #bbf7d0", paddingTop: 8 }}>
            <span>Grand Total</span><span style={{ color: "#047857" }}>{money(order.grandTotal)}</span>
          </div>
        </div>

        {/* Invoice status */}
        {hasInvoice && (
          <div style={{ background: "#ecfdf5", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
            {order.invoices.map((inv) => (
              <div key={inv.id}>✅ Invoice: <strong>{inv.invoiceNo}</strong> — {label(inv.status)} — {money(inv.total)}</div>
            ))}
          </div>
        )}

        {error && <ErrorMessage error={error} />}

        {/* Actions */}
        {!hasInvoice && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="primary small"
              onClick={generateInvoice}
              disabled={generating}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <FileText size={15} /> {generating ? "Generating…" : "Generate Invoice"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function OrdersPage() {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const openDetail = async (order) => {
    try {
      const result = await api.get(`/sales-orders/${order.id}`);
      setSelected(result.data.data);
    } catch (err) {
      setError({ message: getApiErrorMessage(err) });
    }
  };

  const exportExcel = async () => {
    try {
      const result = (await api.get("/sales-orders?pageSize=100")).data;
      const rows = result.data.map((o) => ({
        OrderNo: o.orderNumber,
        Customer: o.customer?.name,
        CustomerPO: o.customerPONumber,
        Status: o.status,
        Subtotal: o.subtotal,
        GST: o.gstAmount,
        GrandTotal: o.grandTotal,
        OrderDate: new Date(o.orderDate).toLocaleDateString("en-IN"),
        Invoice: o.invoices?.map((i) => i.invoiceNo).join(", ") || "",
      }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Sales Orders");
      XLSX.writeFile(book, "yash-salesorders-export.xlsx");
    } catch (requestError) {
      setError({ message: getApiErrorMessage(requestError) });
    }
  };

  return (
    <>
      <DataList
        resource={`sales-orders?_r=${refresh}`}
        title="Sales orders"
        action={
          <div className="toolbar">
            <button className="secondary small" onClick={exportExcel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileDown size={15} /> Export Excel
            </button>
          </div>
        }
        columns={["Order", "Customer", "PO reference", "Status", "Total", "Invoice", ""]}
        row={(order) => (
          <tr key={order.id}>
            <td>{order.orderNumber}</td>
            <td><b>{order.customer?.name}</b></td>
            <td>{order.customerPONumber || "—"}</td>
            <td>
              <span className="badge" style={{ background: (STATUS_COLOR[order.status] || "#94a3b8") + "22", color: STATUS_COLOR[order.status] || "#94a3b8" }}>
                {label(order.status)}
              </span>
            </td>
            <td><strong>{money(order.grandTotal)}</strong></td>
            <td>
              {order.invoices?.length > 0
                ? <span className="badge" style={{ background: "#dcfce7", color: "#15803d" }}>✓ Invoiced</span>
                : <span style={{ color: "#64748b", fontSize: 12 }}>No invoice</span>
              }
            </td>
            <td>
              <button
                className="secondary small"
                onClick={() => openDetail(order)}
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
        <SalesOrderDetailDrawer
          order={selected}
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