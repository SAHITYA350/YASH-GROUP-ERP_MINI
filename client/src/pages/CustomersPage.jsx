import { useState } from "react";
import { Plus } from "lucide-react";
import DataList from "../components/DataList.jsx";
import CustomerForm from "../components/forms/CustomerForm.jsx";
import api, { getApiErrorMessage } from "../services/api.js";

export default function CustomersPage() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const save = async (values) => {
    try {
      setError(null);
      await api.post("/customers", values);
      setOpen(false);
      window.location.reload();
    } catch (requestError) {
      setError({ message: getApiErrorMessage(requestError) });
    }
  };

  return (
    <>
      <DataList
        resource="customers"
        title="Customers"
        action={
          <button className="primary small" onClick={() => setOpen(true)}>
            <Plus size={16} />
            New customer
          </button>
        }
        columns={["Code", "Customer", "Contact", "Location", "Status"]}
        row={(customer) => (
          <tr key={customer.id}>
            <td>{customer.code}</td>
            <td>
              <b>{customer.name}</b>
              <small>{customer.email}</small>
            </td>
            <td>{customer.phone || "—"}</td>
            <td>
              {[customer.city, customer.state].filter(Boolean).join(", ") || "—"}
            </td>
            <td>{customer.isActive ? "Active" : "Inactive"}</td>
          </tr>
        )}
      />
      {open && (
        <CustomerForm
          close={() => setOpen(false)}
          save={save}
          error={error}
        />
      )}
    </>
  );
}