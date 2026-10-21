import { useState } from "react";
import { Plus, Eye, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import DataList from "../components/DataList.jsx";
import EnquiryForm from "../components/forms/EnquiryForm.jsx";
import QuotationForm from "../components/forms/QuotationForm.jsx";
import { ErrorMessage, Modal } from "../components/ui.jsx";
import api, { getApiErrorMessage } from "../services/api.js";
import { label, money } from "../utils/formatters.js";

function EnquiryDetailDrawer({ enquiry, onClose, onQuoteCreated }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  const saveQuotation = async (values) => {
    try {
      setQuoteError(null);
      // Ensure customerId and leadId are set from the enquiry
      values.customerId = enquiry.customerId || enquiry.customer?.id;
      values.leadId = enquiry.id;
      await api.post("/quotations", values);
      setQuoteOpen(false);
      onQuoteCreated();
    } catch (err) {
      setQuoteError({ message: getApiErrorMessage(err) });
    }
  };

  const statusColor = {
    NEW: "#0ea5e9",
    CONTACTED: "#f59e0b",
    QUALIFIED: "#8b5cf6",
    REQUIREMENT_CAPTURED: "#0891b2",
    QUOTATION_DRAFT: "#047857",
    QUOTATION_SENT: "#065f46",
    NEGOTIATION: "#b45309",
    PO_RECEIVED: "#15803d",
    CONVERTED: "#166534",
    LOST: "#b91c1c",
  };

  return (
    <Modal title={`Enquiry — ${enquiry.code}`} close={onClose}>
      <div style={{ display: "grid", gap: 16 }}>
        {/* Header info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 14 }}>
          <div><span style={{ color: "#64748b" }}>Company</span><br /><strong>{enquiry.customerName}</strong></div>
          <div><span style={{ color: "#64748b" }}>Contact</span><br />{enquiry.contactName || "—"}</div>
          <div><span style={{ color: "#64748b" }}>Phone</span><br />{enquiry.phone || "—"}</div>
          <div><span style={{ color: "#64748b" }}>Email</span><br />{enquiry.email || "—"}</div>
          <div><span style={{ color: "#64748b" }}>City / State</span><br />{[enquiry.city, enquiry.state].filter(Boolean).join(", ") || "—"}</div>
          <div>
            <span style={{ color: "#64748b" }}>Stage</span><br />
            <span className="badge" style={{ background: statusColor[enquiry.stage] + "22", color: statusColor[enquiry.stage] }}>{label(enquiry.stage)}</span>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ color: "#64748b" }}>Items</span>
            {enquiry.items?.length ? (
              enquiry.items.map((item) => (
                <div key={item.id}>
                  {item.productName}
                  {item.variant ? ` · ${item.variant}` : ""}
                  {item.productSku ? ` [${item.productSku}]` : ""}
                  {` × ${item.quantity}`}
                </div>
              ))
            ) : (
              <div>
                {enquiry.productName || enquiry.product?.name || "—"}
                {enquiry.quantity ? ` × ${enquiry.quantity}` : ""}
              </div>
            )}
          </div>
          <div><span style={{ color: "#64748b" }}>Estimated value</span><br /><strong>{money(enquiry.expectedValue)}</strong></div>
          <div><span style={{ color: "#64748b" }}>Assigned to</span><br />{enquiry.assignedTo?.name || "Unassigned"}</div>
        </div>

        {enquiry.requirement && (
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
            <strong>Requirement:</strong> {enquiry.requirement}
          </div>
        )}

        {/* Linked quotations */}
        {enquiry.quotations?.length > 0 && (
          <div>
            <strong style={{ fontSize: 13, color: "#64748b" }}>LINKED QUOTATIONS</strong>
            {enquiry.quotations.map((q) => (
              <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #e2e8f0", fontSize: 13 }}>
                <span>{q.quotationNo}</span>
                <span className="badge">{label(q.status)}</span>
                <span>{money(q.total)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!["CONVERTED", "LOST"].includes(enquiry.stage) && (
            <button className="primary small" onClick={() => setQuoteOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={15} /> Create Quotation
            </button>
          )}
        </div>
      </div>

      {quoteOpen && (
        <QuotationForm
          close={() => setQuoteOpen(false)}
          save={saveQuotation}
          error={quoteError}
          prefillEnquiry={enquiry}
        />
      )}
    </Modal>
  );
}

export default function EnquiriesPage() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const save = async (values) => {
    try {
      setError(null);
      await api.post("/enquiries", values);
      setOpen(false);
      setRefresh((r) => r + 1);
    } catch (requestError) {
      setError({ message: getApiErrorMessage(requestError) });
    }
  };

  const openDetail = async (enquiry) => {
    try {
      const result = await api.get(`/enquiries/${enquiry.id}`);
      setSelected(result.data.data);
    } catch (err) {
      setError({ message: getApiErrorMessage(err) });
    }
  };

  const exportExcel = async () => {
    try {
      const result = (await api.get("/enquiries?pageSize=100")).data;
      const rows = result.data.map((enquiry) => ({
        EnquiryNo: enquiry.code,
        Company: enquiry.customerName,
        Contact: enquiry.contactName,
        Email: enquiry.email,
        Phone: enquiry.phone,
        City: enquiry.city,
        State: enquiry.state,
        Source: enquiry.source,
        Product:
          enquiry.items?.map((item) => `${item.productName} × ${item.quantity}`).join("; ") ||
          enquiry.productName || enquiry.product?.name,
        Variant: enquiry.product?.variant,
        Quantity: enquiry.items?.map((item) => item.quantity).join(", ") || enquiry.quantity,
        EstimatedValue: enquiry.expectedValue,
        AssignedTo: enquiry.assignedTo?.name,
        Stage: enquiry.stage,
        Priority: enquiry.priority,
        Requirement: enquiry.requirement,
      }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Enquiries");
      XLSX.writeFile(book, "yash-enquiries-export.xlsx");
    } catch (requestError) {
      setError({ message: getApiErrorMessage(requestError) });
    }
  };

  const importExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row) => ({
        customerName: row.Company || row.customerName,
        contactName: row.Contact || row.contactName,
        email: row.Email || row.email,
        phone: String(row.Phone || row.phone || ""),
        city: row.City || row.city,
        state: row.State || row.state,
        productName: row.Product || row.productName,
        quantity: row.Quantity || row.quantity || undefined,
        expectedValue: row.EstimatedValue || row.expectedValue || undefined,
        requirement: row.Requirement || row.requirement || undefined,
        priority: row.Priority || row.priority || "MEDIUM",
      }));
      const result = (await api.post("/enquiries/import", { rows })).data;
      setNotice(
        `${result.data.created.length} lead(s) imported and auto-assigned.${result.data.rejected.length ? ` ${result.data.rejected.length} row(s) need correction.` : ""}`,
      );
      event.target.value = "";
      setRefresh((r) => r + 1);
    } catch (requestError) {
      setError({ message: getApiErrorMessage(requestError) });
    }
  };

  return (
    <>
      <DataList
        resource={`enquiries?_r=${refresh}`}
        title="Enquiries"
        action={
          <div className="toolbar">
            <label className="primary small">
              Import Excel
              <input
                hidden
                type="file"
                accept=".xlsx,.xls"
                onChange={importExcel}
              />
            </label>
            <button className="secondary small" onClick={exportExcel}>
              Export Excel
            </button>
            <button className="primary small" onClick={() => setOpen(true)}>
              <Plus size={16} />
              New Enquiry
            </button>
          </div>
        }
        columns={["Enquiry", "Company", "Product", "Source", "Owner", "Stage", "Value", ""]}
        row={(enquiry) => (
          <tr key={enquiry.id} style={{ cursor: "pointer" }}>
            <td>{enquiry.code}</td>
            <td>
              <b>{enquiry.customerName}</b>
              <small>{enquiry.contactName || enquiry.phone || "—"}</small>
            </td>
            <td>
              {enquiry.items?.length
                ? enquiry.items
                    .map((item) => `${item.productName} × ${item.quantity}`)
                    .join(", ")
                : enquiry.productName || enquiry.product?.name || "—"}
            </td>
            <td>{label(enquiry.source)}</td>
            <td>{enquiry.assignedTo?.name || "Unassigned"}</td>
            <td>
              <span className="badge">{label(enquiry.stage)}</span>
            </td>
            <td>{money(enquiry.expectedValue)}</td>
            <td>
              <button
                className="secondary small"
                onClick={() => openDetail(enquiry)}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <Eye size={14} /> View
              </button>
            </td>
          </tr>
        )}
      />
      {notice && <p className="notice">{notice}</p>}
      {error && <ErrorMessage error={error} />}
      {open && (
        <EnquiryForm close={() => setOpen(false)} save={save} error={error} />
      )}
      {selected && (
        <EnquiryDetailDrawer
          enquiry={selected}
          onClose={() => setSelected(null)}
          onQuoteCreated={() => {
            setSelected(null);
            setRefresh((r) => r + 1);
          }}
        />
      )}
    </>
  );
}