import Icon from "../common/Icon";
import { navigation, titles, today } from "../../constants/navigation";

export default function AppLayout({
  page,
  onNavigate,
  pendingInspections,
  error,
  notice,
  onRetry,
  onDismissError,
  onDismissNotice,
  onNotify,
  overlay,
  children,
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Y</div>
          <div>
            <strong>
              YASH<span>GROUP</span>
            </strong>
            <small>ENTERPRISE ERP</small>
          </div>
          <button className="collapse" aria-label="Collapse navigation">
            ‹
          </button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar">YG</div>
          <div>
            <strong>YASH Group</strong>
            <small>Production ERP</small>
          </div>
          <span>⌄</span>
        </div>
        <nav>
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-title">{group.title}</div>
              {group.links.map(([key, label, icon]) => (
                <button
                  key={key}
                  className={`nav-link ${page === key ? "active" : ""}`}
                  onClick={() => onNavigate(key)}
                >
                  <Icon>{icon}</Icon>
                  <span>{label}</span>
                  {key === "inspections" && pendingInspections > 0 && (
                    <b className="nav-count">{pendingInspections}</b>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span>OPERATIONS WORKSPACE</span>
            <strong>Production &amp; Quality</strong>
          </div>
          <div className="user-mini">
            <div className="user-avatar">YG</div>
            <div>
              <strong>YASH Admin</strong>
              <small>Operations team</small>
            </div>
            <span>•••</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <strong>Production &amp; Quality</strong>
            <span>/</span>
            {titles[page]}
          </div>
          <div className="top-actions">
            <div className="top-date">
              <span>◷</span>
              {today}
            </div>
            <button
              className="top-icon"
              aria-label="Notifications"
              onClick={onNotify}
            >
              ♧<i />
            </button>
            <div className="top-user">
              <div className="user-avatar">YG</div>
              <span>ERP Test Admin</span>
              <b>⌄</b>
            </div>
          </div>
        </header>
        <div className="content">
          {error && (
            <div className="alert error">
              <span>!</span>
              {error}
              <button onClick={onRetry}>Retry</button>
              <button aria-label="Dismiss" onClick={onDismissError}>
                ×
              </button>
            </div>
          )}
          {notice && (
            <div className="alert success">
              <span>✓</span>
              {notice}
              <button aria-label="Dismiss" onClick={onDismissNotice}>
                ×
              </button>
            </div>
          )}
          {children}
        </div>
      </main>
      {overlay}
    </div>
  );
}
