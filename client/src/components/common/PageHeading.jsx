import Icon from "./Icon";

export default function PageHeading({
  kicker = "OPERATIONS",
  title,
  description,
  action,
  onAction,
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && (
        <button className="button primary" onClick={onAction}>
          <Icon>＋</Icon>
          {action}
        </button>
      )}
    </div>
  );
}
