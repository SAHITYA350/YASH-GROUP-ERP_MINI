export default function Section({
  title,
  subtitle,
  action,
  onAction,
  children,
  className = "",
}) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && (
          <button className="button subtle" onClick={onAction}>
            {action}
          </button>
        )}
      </header>
      {children}
    </section>
  );
}
