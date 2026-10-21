import Icon from "./Icon";

export default function Metric({ label, value, note, icon, tone = "blue" }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon>{icon}</Icon>
      </div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value ?? "—"}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}
