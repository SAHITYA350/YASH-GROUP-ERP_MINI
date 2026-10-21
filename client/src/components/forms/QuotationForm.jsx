import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "../../utils/formHook.js";
import { Plus, Trash2 } from "lucide-react";
import { Actions, ErrorMessage, Field, Modal } from "../ui.jsx";
import api from "../../services/api.js";
import { money } from "../../utils/formatters.js";

export default function QuotationForm({ close, save, error, prefillEnquiry }) {
  const [products, setProducts] = useState([]);

  const { register, handleSubmit, control, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      customerId: prefillEnquiry?.customerId || "",
      leadId: prefillEnquiry?.id || "",
      validUntil: "",
      paymentTerms: "50% advance, balance before dispatch",
      deliveryTerms: "Delivery to customer site",
      notes: "",
      items: prefillEnquiry?.productId
        ? [{ productId: String(prefillEnquiry.productId), quantity: prefillEnquiry.quantity || 1, unitPrice: "", discountPercent: 0, taxPercent: 18, description: "" }]
        : [{ productId: "", quantity: 1, unitPrice: "", discountPercent: 0, taxPercent: 18, description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  useEffect(() => {
    api.get("/products").then((r) => {
      setProducts(r.data.data || []);
    }).catch(() => {});
  }, []);

  // Auto-fill unit price when product changes
  const handleProductChange = (index, productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (product) {
      setValue(`items.${index}.unitPrice`, parseFloat(product.listPrice) || "");
      setValue(`items.${index}.taxPercent`, parseFloat(product.gstPercent) || 18);
      setValue(`items.${index}.description`, `${product.name}${product.variant ? " · " + product.variant : ""}`);
    }
  };

  // Compute totals
  const computedItems = items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const disc = parseFloat(item.discountPercent) || 0;
    const tax = parseFloat(item.taxPercent) || 0;
    const base = qty * price;
    const discAmt = (base * disc) / 100;
    const subtotal = base - discAmt;
    const taxAmt = (subtotal * tax) / 100;
    return { subtotal, lineTotal: subtotal + taxAmt };
  });
  const grandSubtotal = computedItems.reduce((s, i) => s + i.subtotal, 0);
  const grandTax = computedItems.reduce((s, i) => s + (i.lineTotal - i.subtotal), 0);
  const grandTotal = grandSubtotal + grandTax;

  return (
    <Modal title="Create Quotation" close={close}>
      <form onSubmit={handleSubmit(save)} style={{ display: "grid", gap: 14 }}>
        <input type="hidden" {...register("customerId")} />
        <input type="hidden" {...register("leadId")} />

        {prefillEnquiry && (
          <div style={{ background: "#ecfdf5", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
            <strong>Enquiry:</strong> {prefillEnquiry.code} · {prefillEnquiry.customerName}
          </div>
        )}

        <div className="formgrid">
          <Field label="Valid until">
            <input type="date" {...register("validUntil")} />
          </Field>
          <Field label="Payment terms">
            <input {...register("paymentTerms")} />
          </Field>
          <Field label="Delivery terms">
            <input {...register("deliveryTerms")} />
          </Field>
          <Field label="Notes">
            <input {...register("notes")} placeholder="Optional internal notes" />
          </Field>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <strong style={{ fontSize: 14 }}>Line items</strong>
            <button
              type="button"
              className="secondary small"
              onClick={() => append({ productId: "", quantity: 1, unitPrice: "", discountPercent: 0, taxPercent: 18, description: "" })}
            >
              <Plus size={14} /> Add item
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, marginBottom: 10, background: "#f8fafc" }}>
              <div className="formgrid" style={{ gap: 10 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Product *</label>
                  <select
                    {...register(`items.${index}.productId`, { required: true })}
                    onChange={(e) => {
                      register(`items.${index}.productId`).onChange(e);
                      handleProductChange(index, e.target.value);
                    }}
                  >
                    <option value="">— Select product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.variant ? ` · ${p.variant}` : ""} [{p.sku}] — ₹{parseFloat(p.listPrice).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label="Description">
                  <input {...register(`items.${index}.description`)} placeholder="Line item description" />
                </Field>
                <Field label="Quantity *">
                  <input type="number" min="0.001" step="any" {...register(`items.${index}.quantity`, { required: true })} />
                </Field>
                <Field label="Unit price (₹) *">
                  <input type="number" min="0" step="any" {...register(`items.${index}.unitPrice`, { required: true })} />
                </Field>
                <Field label="Discount %">
                  <input type="number" min="0" max="100" step="any" {...register(`items.${index}.discountPercent`)} />
                </Field>
                <Field label="GST %">
                  <input type="number" min="0" max="100" step="any" {...register(`items.${index}.taxPercent`)} />
                </Field>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gridColumn: "1/-1" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    Subtotal: <strong>{money(computedItems[index]?.lineTotal || 0)}</strong>
                  </span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} style={{ border: 0, background: "none", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>Subtotal (excl. GST)</span>
              <strong>{money(grandSubtotal)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#64748b" }}>
              <span>GST</span>
              <span>{money(grandTax)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #bbf7d0", paddingTop: 8, fontWeight: 700, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: "#047857" }}>{money(grandTotal)}</span>
            </div>
          </div>
        </div>

        {error && <ErrorMessage error={error} />}
        <Actions close={close} loading={isSubmitting} save="Create Quotation" />
      </form>
    </Modal>
  );
}
