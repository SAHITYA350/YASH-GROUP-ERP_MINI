export default function Form({ children, onSubmit, submit = "Save changes", busy }) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      {children}
      <div className="form-actions">
        <button className="button primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : submit}
        </button>
      </div>
    </form>
  );
}
