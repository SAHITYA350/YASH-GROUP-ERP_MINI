import { X } from "lucide-react";

export function Actions({ close, loading, save }) {
  return (
    <div className="actions">
      <button type="button" onClick={close}>
        Cancel
      </button>
      <button disabled={loading} className="primary">
        {loading ? "Saving…" : save}
      </button>
    </div>
  );
}

export function Empty({ message }) {
  return <p className="empty">{message}</p>;
}

export function ErrorMessage({ error }) {
  return (
    <p role="alert" className="error">
      {error.message}
    </p>
  );
}

export function Field({ label, children }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

export function Modal({ title, close, children }) {
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section>
        <div className="modalhead">
          <h2>{title}</h2>
          <button onClick={close}>
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function PageHeader({ title, children }) {
  return (
    <div className="head">
      <div>
        <h2>{title}</h2>
        <p className="muted">Live data from your sales workspace</p>
      </div>
      {children}
    </div>
  );
}