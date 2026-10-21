export default function Empty({
  title = "Nothing here yet",
  text = "Records will appear when they are added.",
}) {
  return (
    <div className="empty">
      <span>▧</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
