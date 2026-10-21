import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "../../utils/formHook.js";
import { Plus, Trash2 } from "lucide-react";
import { Actions, ErrorMessage, Field, Modal } from "../ui.jsx";
import api from "../../services/api.js";

const sources = [
  "MANUAL",
  "WEBSITE",
  "REFERRAL",
  "INDIAN_MART",
  "TRADE_INDIA",
  "GOOGLE_ADS",
  "META_ADS",
  "JUSTDIAL",
  "SULEKHA",
  "EXPORT_INDIA",
  "EXCEL",
  "OTHER",
];

export default function EnquiryForm({ close, save, error }) {
  const [products, setProducts] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      source: "MANUAL",
      priority: "MEDIUM",
      items: [{ productId: "", quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <Modal title="Create Enquiry" close={close}>
      <form
        onSubmit={handleSubmit((values) =>
          save({
            ...values,
            items: values.items
              .filter((item) => Number.isInteger(item.productId))
              .map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
          }),
        )}
        className="formgrid"
      >
        <Field label="Company name *">
          <input {...register("customerName", { required: true })} placeholder="e.g. Apex Infra Systems" />
        </Field>
        <Field label="Contact person">
          <input {...register("contactName")} placeholder="Contact name" />
        </Field>
        <Field label="Email">
          <input type="email" {...register("email")} placeholder="contact@company.com" />
        </Field>
        <Field label="Phone">
          <input {...register("phone")} placeholder="+91 98..." />
        </Field>
        <Field label="City">
          <input {...register("city")} placeholder="City" />
        </Field>
        <Field label="State">
          <input {...register("state")} placeholder="State" />
        </Field>
        <Field label="Source">
          <select {...register("source")}>
            {sources.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select {...register("priority")}>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </Field>
        <div style={{ gridColumn: "1 / -1", display: "grid", gap: 10 }}>
          <strong>Enquiry items</strong>
          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(100px, 1fr) auto",
                gap: 10,
                alignItems: "end",
              }}
            >
              <Field label={`Product ${index + 1}`}>
                <select
                  {...register(`items.${index}.productId`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                >
                  <option value="">— Select product —</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.variant ? `· ${product.variant}` : ""} [{product.sku}]
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quantity">
                <input
                  type="number"
                  min="1"
                  step="1"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    required: true,
                    min: 1,
                  })}
                />
              </Field>
              <button
                type="button"
                className="secondary small"
                aria-label={`Remove product ${index + 1}`}
                title="Remove item"
                onClick={() => remove(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="secondary small"
            onClick={() => append({ productId: "", quantity: 1 })}
            style={{ justifySelf: "start" }}
          >
            <Plus size={16} />
            Add item
          </button>
        </div>
        <Field label="Estimated value (₹)">
          <input type="number" {...register("expectedValue")} placeholder="e.g. 125000" min="0" />
        </Field>
        <Field label="Requirement / notes">
          <textarea {...register("requirement")} placeholder="Describe the requirement…" style={{ gridColumn: "1/-1" }} />
        </Field>
        {error && <ErrorMessage error={error} />}
        <Actions close={close} loading={isSubmitting} save="Create Enquiry" />
      </form>
    </Modal>
  );
}