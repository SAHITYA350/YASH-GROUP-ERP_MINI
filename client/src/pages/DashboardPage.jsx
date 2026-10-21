import useApi from "../hooks/useApi.js";
import { label } from "../utils/formatters.js";
import { Empty, ErrorMessage, PageHeader } from "../components/ui.jsx";

export default function DashboardPage() {
  const query = useApi("/dashboard");
  if (query.loading) return <p>Loading dashboard…</p>;
  if (query.error) return <ErrorMessage error={query.error} />;

  const dashboard = query.data.data;
  const cards = [
    ["Total enquiries", dashboard.metrics.total],
    ["New enquiries", dashboard.metrics.new],
    ["Qualified leads", dashboard.metrics.qualified],
    ["Open quotations", dashboard.metrics.openQuotations],
    ["Confirmed orders", dashboard.metrics.confirmedOrders],
    ["Follow-ups due", dashboard.metrics.followUpsDue],
  ];

  return (
    <>
      <PageHeader title="Sales dashboard" />
      <div className="cards">
        {cards.map(([title, value]) => (
          <article key={title}>
            <p>{title}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="panel activity">
        <h3>Recent sales activity</h3>
        {dashboard.recent.length ? (
          dashboard.recent.map((activity) => (
            <div key={activity.id}>
              <b>{label(activity.action)}</b>
              <small>
                {activity.user?.name || "System"} ·{" "}
                {new Date(activity.createdAt).toLocaleString("en-IN")}
              </small>
            </div>
          ))
        ) : (
          <Empty message="No sales activity has been recorded yet." />
        )}
      </div>
    </>
  );
}