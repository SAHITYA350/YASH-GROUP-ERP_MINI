export default function Status({ value }) {
  return (
    <span
      className={`status status-${String(value || "unknown")
        .toLowerCase()
        .replaceAll("_", "-")}`}
    >
      {String(value || "—").replaceAll("_", " ")}
    </span>
  );
}
