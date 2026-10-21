import { useState } from "react";
import Empty from "../common/Empty";
import Icon from "../common/Icon";
import Metric from "../common/Metric";
import PageHeading from "../common/PageHeading";
import Section from "../common/Section";
import Status from "../common/Status";
import Table from "../common/Table";
import { weekday } from "../../constants/navigation";
import { fmtDate, fmtDateTime } from "../../utils/formatters";

function Dashboard({ data, onNavigate, onRefresh }) {
  const wo = data?.workOrders || {};
  const quality = data?.quality || {};
  const bom = data?.bom || {};
  const statuses = Object.entries(wo.byStatus || {});
  return (
    <>
      <PageHeading
        kicker={`${weekday} · OPERATIONS OVERVIEW`}
        title="Production dashboard"
        description="Live production activity, work order progress, and product quality."
        action="Refresh data"
        onAction={onRefresh}
      />
      <div className="metric-grid dashboard-metrics">
        <Metric
          label="Total production orders"
          value={wo.total ?? "—"}
          note="All work orders"
          icon="▤"
          tone="blue"
        />
        <Metric
          label="In progress"
          value={wo.byStatus?.IN_PROGRESS || 0}
          note="Currently being manufactured"
          icon="◷"
          tone="violet"
        />
        <Metric
          label="Quality queue"
          value={
            Number(quality.byStatus?.PENDING || 0) +
            Number(quality.byStatus?.HOLD || 0)
          }
          note={`${Number(quality.byStatus?.PENDING || 0)} awaiting · ${Number(quality.byStatus?.HOLD || 0)} on hold`}
          icon="⌕"
          tone="amber"
        />
        <Metric
          label="Completed orders"
          value={wo.byStatus?.COMPLETED || 0}
          note="Finished production orders"
          icon="✓"
          tone="green"
        />
        <Metric
          label="Planned quantity"
          value={Number(wo.planned || 0).toLocaleString("en-IN")}
          note="Total target quantity"
          icon="▤"
        />
        <Metric
          label="Available inventory"
          value={Number(data?.inventory?.available || 0).toLocaleString(
            "en-IN",
          )}
          note={`${Number(data?.inventory?.reserved || 0).toLocaleString("en-IN")} units reserved`}
          icon="▥"
          tone="violet"
        />
      </div>
      <div className="dashboard-grid">
        <Section
          title="Production status"
          subtitle="Work orders by current stage"
          action="View orders"
          onAction={() => onNavigate("orders")}
          className="status-panel"
        >
          {statuses.length ? (
            <div className="status-bars">
              {statuses.map(([label, count]) => (
                <div className="bar-row" key={label}>
                  <div className="bar-label">
                    <span>{label.replaceAll("_", " ")}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="bar-track">
                    <i
                      style={{
                        width: `${Math.max(4, (count / Math.max(1, wo.total)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Create a work order to start tracking production." />
          )}
        </Section>
        <Section
          title="Quality at a glance"
          subtitle="Inspection yield and defect signals"
          action="Open quality"
          onAction={() => onNavigate("reports")}
          className="quality-panel"
        >
          <div className="yield-visual">
            <div
              className="yield-ring"
              style={{ "--yield": `${quality.passRate || 0}%` }}
            >
              <div>
                <strong>{quality.passRate ?? 0}%</strong>
                <small>pass rate</small>
              </div>
            </div>
            <div className="yield-legend">
              <span>
                <i className="dot green-dot" />
                Accepted{" "}
                <b>{Number(quality.accepted || 0).toLocaleString("en-IN")}</b>
              </span>
              <span>
                <i className="dot red-dot" />
                Rejected{" "}
                <b>{Number(quality.rejected || 0).toLocaleString("en-IN")}</b>
              </span>
              <span>
                <i className="dot blue-dot" />
                Inspected{" "}
                <b>{Number(quality.inspected || 0).toLocaleString("en-IN")}</b>
              </span>
            </div>
          </div>
          <div className="quality-callout">
            <span>↗</span>
            <div>
              <strong>
                {Object.values(bom.byStatus || {}).reduce((a, b) => a + b, 0)}{" "}
                BOM revisions
              </strong>
              <small>Keep released build recipes current</small>
            </div>
            <button onClick={() => onNavigate("bom")}>→</button>
          </div>
        </Section>
        <Section
          title="Active production"
          subtitle="The next orders on your floor"
          action="All work orders"
          onAction={() => onNavigate("work-orders")}
          className="active-panel"
        >
          <Table
            columns={[
              { key: "workOrderNo", label: "Work order" },
              {
                key: "salesOrder.orderNumber",
                label: "Sales order",
                path: "salesOrder.orderNumber",
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <Status value={row.status} />,
              },
              {
                key: "progress",
                label: "Progress",
                render: (row) => (
                  <Progress
                    value={row.producedQuantity}
                    max={row.plannedQuantity}
                  />
                ),
              },
            ]}
            rows={wo.active || []}
            emptyText="No active work orders. Plan an order to get started."
          />
        </Section>
        <Section
          title="Quality queue"
          subtitle="Inspections requiring attention"
          action="View inspections"
          onAction={() => onNavigate("inspections")}
          className="queue-panel"
        >
          {(quality.pendingInspections || []).length ? (
            <div className="queue-list">
              {quality.pendingInspections.map((item) => (
                <div className="queue-item" key={item.id}>
                  <span className="queue-icon">⌕</span>
                  <div>
                    <strong>{item.inspectionNo}</strong>
                    <small>
                      {item.workOrder?.workOrderNo} ·{" "}
                      {item.workOrder?.salesOrder?.orderNumber}
                    </small>
                  </div>
                  <Status value={item.status} />
                </div>
              ))}
            </div>
          ) : (
            <Empty text="There are no inspections waiting in the quality queue." />
          )}
        </Section>
      </div>
    </>
  );
}

function Progress({ value = 0, max = 0 }) {
  const n = max ? Math.min(100, (Number(value) / Number(max)) * 100) : 0;
  return (
    <div className="progress">
      <span>
        <i style={{ width: `${n}%` }} />
      </span>
      <small>{n.toFixed(0)}%</small>
    </div>
  );
}

function OrderList({
  page,
  result,
  orders,
  filters,
  setFilters,
  onCreate,
  onSelect,
  onEdit,
  onTrack,
  onComplete,
}) {
  const title = page === "orders" ? "Production orders" : "Work orders";
  const list = orders.filter(
    (order) =>
      page !== "work-orders" ||
      !["COMPLETED", "CANCELLED"].includes(order.status),
  );
  return (
    <>
      <PageHeading
        title={title}
        description={
          page === "orders"
            ? "Convert confirmed customer demand into planned factory work."
            : "Review work in progress, material readiness, and completion status."
        }
        action="New production order"
        onAction={onCreate}
      />
      <div className="filter-row">
        <div className="search-box">
          <Icon>⌕</Icon>
          <input
            value={filters.query}
            onChange={(e) =>
              setFilters((v) => ({ ...v, query: e.target.value }))
            }
            placeholder="Search work order or customer"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((v) => ({ ...v, status: e.target.value }))
          }
        >
          <option value="">All statuses</option>
          {[
            "DRAFT",
            "PLANNED",
            "RELEASED",
            "MATERIAL_HOLD",
            "IN_PROGRESS",
            "QC_HOLD",
            "COMPLETED",
            "CANCELLED",
          ].map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <span className="results-count">
          {result?.total ?? list.length} records
        </span>
      </div>
      <Section
        title="Order register"
        subtitle="Production schedule and order fulfillment"
        className="full-panel"
      >
        <Table
          columns={[
            {
              key: "workOrderNo",
              label: "Work order no.",
              render: (r) => (
                <button className="text-link" onClick={() => onSelect(r.id)}>
                  {r.workOrderNo}
                </button>
              ),
            },
            {
              key: "salesOrder.orderNumber",
              label: "Sales order",
              path: "salesOrder.orderNumber",
            },
            {
              key: "product",
              label: "Product / BOM revision",
              render: (r) => (
                <span>
                  {r.bomRevision?.product?.name ||
                    r.salesOrder?.items
                      ?.map((item) => item.product?.name)
                      .filter(Boolean)
                      .join(", ") ||
                    "—"}
                  {r.bomRevision?.revision
                    ? ` · Rev ${r.bomRevision.revision}`
                    : ""}
                </span>
              ),
            },
            { key: "plannedQuantity", label: "Planned qty" },
            { key: "goodQuantity", label: "Good qty" },
            { key: "rejectedQuantity", label: "Rejected qty" },
            {
              key: "plannedStart",
              label: "Planned start",
              render: (r) => fmtDate(r.plannedStart),
            },
            {
              key: "plannedEnd",
              label: "Planned end",
              render: (r) => fmtDate(r.plannedEnd),
            },
            {
              key: "priority",
              label: "Priority",
              render: (r) => (
                <span
                  className={`priority priority-${r.priority?.toLowerCase()}`}
                >
                  {r.priority}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Status value={r.status} />,
            },
            {
              key: "createdBy.name",
              label: "Created by",
              path: "createdBy.name",
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="row-actions">
                  <button
                    title="View order details"
                    onClick={() => onSelect(r.id)}
                  >
                    View
                  </button>
                  {["DRAFT", "PLANNED"].includes(r.status) && (
                    <button
                      title="Edit production plan"
                      onClick={() => onEdit(r)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    title="Track production"
                    onClick={() => onTrack(r.id)}
                  >
                    Track
                  </button>
                  {r.status === "IN_PROGRESS" || r.status === "QC_HOLD" ? (
                    <button
                      title="Complete work order"
                      onClick={() => onComplete(r.id)}
                    >
                      Complete
                    </button>
                  ) : null}
                </div>
              ),
            },
          ]}
          rows={list}
          emptyText={errorText(result)}
        />
      </Section>
    </>
  );
}

function OrderDetails({ result, onBack, onTrack }) {
  if (!result)
    return (
      <>
        <PageHeading
          title="Work order details"
          description="Loading order information…"
          action="Back to orders"
          onAction={onBack}
        />
        <Empty
          title="Order details unavailable"
          text="Select a work order from the register to view its details."
        />
      </>
    );
  const planned = Number(result.plannedQuantity || 0);
  const good = Number(result.goodQuantity || 0);
  const rejected = Number(result.rejectedQuantity || 0);
  const remaining = Math.max(0, planned - good - rejected);
  const progress = planned
    ? Math.min(100, ((good + rejected) / planned) * 100)
    : 0;
  const productNames =
    result.bomRevision?.product?.name ||
    result.salesOrder?.items
      ?.map((item) => item.product?.name)
      .filter(Boolean)
      .join(", ");
  return (
    <>
      <PageHeading
        kicker="PRODUCTION ORDER"
        title={result.workOrderNo}
        description="Work order overview and current production progress."
        action="Back to orders"
        onAction={onBack}
      />
      <Section
        title="Order overview"
        subtitle="Order identity, schedule, and current status"
      >
        <div className="order-detail-grid">
          <Detail label="Work order number" value={result.workOrderNo} />
          <Detail label="Sales order" value={result.salesOrder?.orderNumber} />
          <Detail label="Product" value={productNames} />
          <Detail
            label="BOM revision"
            value={
              result.bomRevision?.revision
                ? `Rev ${result.bomRevision.revision}`
                : "—"
            }
          />
          <Detail
            label="Production status"
            value={<Status value={result.status} />}
          />
          <Detail
            label="Priority"
            value={
              <span
                className={`priority priority-${String(result.priority || "").toLowerCase()}`}
              >
                {result.priority || "—"}
              </span>
            }
          />
          <Detail label="Planned start" value={fmtDate(result.plannedStart)} />
          <Detail
            label="Planned completion"
            value={fmtDate(result.plannedEnd)}
          />
          <Detail label="Actual start" value={fmtDate(result.actualStart)} />
          <Detail label="Actual completion" value={fmtDate(result.actualEnd)} />
        </div>
      </Section>
      <Section
        title="Production progress"
        subtitle="Planned output versus accepted and rejected quantities"
      >
        <div className="order-detail-grid quantity-grid">
          <Detail
            label="Planned quantity"
            value={planned.toLocaleString("en-IN")}
          />
          <Detail label="Good quantity" value={good.toLocaleString("en-IN")} />
          <Detail
            label="Rejected quantity"
            value={rejected.toLocaleString("en-IN")}
          />
          <Detail
            label="Remaining quantity"
            value={remaining.toLocaleString("en-IN")}
          />
        </div>
        <div className="detail-progress">
          <div>
            <span>Production progress</span>
            <strong>{progress.toFixed(0)}%</strong>
          </div>
          <Progress value={good + rejected} max={planned} />
        </div>
      </Section>
      <Section
        title="Quality inspections"
        subtitle="Inspection outcomes recorded against this order"
      >
        <Table
          columns={[
            { key: "inspectionNo", label: "Inspection" },
            {
              key: "inspectedAt",
              label: "Inspected at",
              render: (r) => fmtDateTime(r.inspectedAt),
            },
            { key: "inspectedQuantity", label: "Inspected" },
            { key: "acceptedQuantity", label: "Accepted" },
            { key: "rejectedQuantity", label: "Rejected" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Status value={r.status} />,
            },
          ]}
          rows={result.inspections || []}
          emptyText="No quality inspections have been recorded for this order."
        />
      </Section>
      <div className="detail-actions">
        <button className="button primary" onClick={onTrack}>
          Open production tracking
        </button>
      </div>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function errorText(result) {
  return result === null
    ? "Unable to load orders. Check the API connection."
    : "No production orders match the current filters.";
}

function Planning({ result, onRefresh, onCreate, onUpdate, onApprovalAction }) {
  const now = new Date();
  const asDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const [range, setRange] = useState({
    from: asDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: asDate(new Date(now.getFullYear(), now.getMonth(), 31)),
  });
  const plan = result || {};
  const dateValue = (value) =>
    value ? new Date(value).toISOString().slice(0, 10) : "";
  const requestRejection = (id) => {
    const notes = window.prompt("Reason for rejecting this production plan:");
    if (notes?.trim()) onApprovalAction(id, "REJECT", notes.trim());
  };
  return (
    <>
      <PageHeading
        title="Production planning dashboard"
        description="Plan demand, balance factory capacity, manage due dates, and approve production plans."
        action="New production plan"
        onAction={onCreate}
      />
      <div className="report-filter">
        <label>
          Schedule from
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange((v) => ({ ...v, from: e.target.value }))}
          />
        </label>
        <label>
          Through
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange((v) => ({ ...v, to: e.target.value }))}
          />
        </label>
        <button className="button subtle" onClick={() => onRefresh(range)}>
          Refresh plan
        </button>
      </div>
      <div className="metric-grid compact">
        <Metric
          label="Scheduled orders"
          value={plan.summary?.scheduledOrders ?? 0}
          note="Over selected planning window"
          icon="▦"
        />
        <Metric
          label="Open demand"
          value={plan.demand?.totalRemaining ?? 0}
          note="Units not yet planned"
          icon="↗"
          tone="violet"
        />
        <Metric
          label="Overdue deadlines"
          value={plan.summary?.overdue ?? 0}
          note="Past due date, still open"
          icon="◷"
          tone="amber"
        />
        <Metric
          label="Awaiting approval"
          value={plan.summary?.pendingApprovals ?? 0}
          note="Plans submitted for review"
          icon="✓"
          tone="green"
        />
      </div>
      <Section
        title="Production schedule management"
        subtitle="Adjust planned dates and order priority. Schedule changes to an approved plan require a fresh approval."
        className="full-panel"
      >
        <Table
          columns={[
            { key: "workOrderNo", label: "Work order" },
            {
              key: "salesOrder.orderNumber",
              label: "Sales order",
              path: "salesOrder.orderNumber",
            },
            {
              key: "customer",
              label: "Customer",
              render: (r) => r.salesOrder?.customer?.name || "—",
            },
            {
              key: "plannedStart",
              label: "Start date",
              render: (r) => (
                <input
                  aria-label={`Start date ${r.workOrderNo}`}
                  type="date"
                  defaultValue={dateValue(r.plannedStart)}
                  onBlur={(e) => {
                    if (e.target.value !== dateValue(r.plannedStart))
                      onUpdate(r.id, { plannedStart: e.target.value || null });
                  }}
                  disabled={!["DRAFT", "PLANNED"].includes(r.status)}
                />
              ),
            },
            {
              key: "plannedEnd",
              label: "Deadline",
              render: (r) => (
                <input
                  aria-label={`Deadline ${r.workOrderNo}`}
                  type="date"
                  defaultValue={dateValue(r.plannedEnd)}
                  onBlur={(e) => {
                    if (e.target.value !== dateValue(r.plannedEnd))
                      onUpdate(r.id, { plannedEnd: e.target.value || null });
                  }}
                  disabled={!["DRAFT", "PLANNED"].includes(r.status)}
                />
              ),
            },
            {
              key: "priority",
              label: "Priority",
              render: (r) => (
                <select
                  aria-label={`Priority ${r.workOrderNo}`}
                  value={r.priority}
                  onChange={(e) => onUpdate(r.id, { priority: e.target.value })}
                  disabled={!["DRAFT", "PLANNED"].includes(r.status)}
                >
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              ),
            },
            {
              key: "planApprovalStatus",
              label: "Plan approval",
              render: (r) => <Status value={r.planApprovalStatus} />,
            },
            {
              key: "status",
              label: "Production status",
              render: (r) => <Status value={r.status} />,
            },
          ]}
          rows={plan.orders || []}
          emptyText="No scheduled orders in this date window. Create an order and set its planned start and deadline."
        />
      </Section>
      <Section
        title="Plan approval queue"
        subtitle="Schedule or revise draft dates, submit plans, approve pending plans, or return them with a reason."
      >
        <Table
          columns={[
            { key: "workOrderNo", label: "Work order" },
            {
              key: "salesOrder.orderNumber",
              label: "Sales order",
              path: "salesOrder.orderNumber",
            },
            { key: "plannedQuantity", label: "Planned quantity" },
            {
              key: "plannedStart",
              label: "Start date",
              render: (r) => (
                <input
                  aria-label={`Approval start ${r.workOrderNo}`}
                  type="date"
                  defaultValue={dateValue(r.plannedStart)}
                  onBlur={(e) => {
                    if (e.target.value !== dateValue(r.plannedStart))
                      onUpdate(r.id, { plannedStart: e.target.value || null });
                  }}
                />
              ),
            },
            {
              key: "plannedEnd",
              label: "Deadline",
              render: (r) => (
                <input
                  aria-label={`Approval deadline ${r.workOrderNo}`}
                  type="date"
                  defaultValue={dateValue(r.plannedEnd)}
                  onBlur={(e) => {
                    if (e.target.value !== dateValue(r.plannedEnd))
                      onUpdate(r.id, { plannedEnd: e.target.value || null });
                  }}
                />
              ),
            },
            {
              key: "priority",
              label: "Priority",
              render: (r) => (
                <select
                  aria-label={`Approval priority ${r.workOrderNo}`}
                  value={r.priority}
                  onChange={(e) => onUpdate(r.id, { priority: e.target.value })}
                >
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              ),
            },
            {
              key: "planApprovalStatus",
              label: "Approval",
              render: (r) => <Status value={r.planApprovalStatus} />,
            },
            { key: "planApprovalNotes", label: "Review notes" },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <div className="row-actions">
                  {["DRAFT", "REJECTED"].includes(r.planApprovalStatus) && (
                    <button onClick={() => onApprovalAction(r.id, "SUBMIT")}>
                      Submit
                    </button>
                  )}
                  {r.planApprovalStatus === "PENDING" && (
                    <>
                      <button
                        className="complete-button"
                        onClick={() => onApprovalAction(r.id, "APPROVE")}
                      >
                        Approve
                      </button>
                      <button
                        className="row-danger"
                        onClick={() => requestRejection(r.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          rows={plan.approvalQueue || []}
          emptyText="No production plans need review."
        />
      </Section>
      <div className="report-grid">
        <Section
          title="Demand-based production forecast"
          subtitle={`Confirmed manufactured-product demand due ${fmtDate(plan.demand?.range?.from)} to ${fmtDate(plan.demand?.range?.to)}, less available stock and planned output.`}
        >
          <Table
            columns={[
              { key: "sku", label: "SKU" },
              { key: "product", label: "Product" },
              { key: "demand", label: "Demand" },
              { key: "availableStock", label: "Available stock" },
              { key: "planned", label: "Planned" },
              { key: "remaining", label: "Remaining to plan" },
              { key: "unit", label: "Unit" },
            ]}
            rows={plan.demand?.products || []}
            emptyText="No confirmed manufactured-product demand is due during this period."
          />
        </Section>
        <Section
          title="Production capacity planning"
          subtitle="Assigned output compared with capacity per shift multiplied by calendar days in the selected window (one shift per day)."
        >
          <Table
            columns={[
              { key: "machineCode", label: "Machine" },
              { key: "workCenter", label: "Work center" },
              { key: "capacityPerShift", label: "Capacity / shift" },
              { key: "availableCapacity", label: "Window capacity" },
              { key: "plannedLoad", label: "Assigned load" },
              {
                key: "utilizationPercent",
                label: "Utilization",
                render: (r) =>
                  r.utilizationPercent === null
                    ? "Set capacity"
                    : `${r.utilizationPercent}%`,
              },
              {
                key: "status",
                label: "Status",
                render: (r) => <Status value={r.status} />,
              },
            ]}
            rows={plan.capacity?.machines || []}
            emptyText="Register machines with capacity-per-shift values to plan factory capacity."
          />
        </Section>
      </div>
      <Section
        title="Production calendar"
        subtitle={`Daily order view for ${fmtDate(plan.range?.from)} to ${fmtDate(plan.range?.to)}.`}
      >
        <Table
          columns={[
            { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
            { key: "count", label: "Orders" },
            {
              key: "entries",
              label: "Schedule",
              render: (r) =>
                r.entries
                  .map((entry) => `${entry.workOrderNo} (${entry.priority})`)
                  .join(" · "),
            },
          ]}
          rows={plan.calendar?.days || []}
          emptyText="No production dates fall within this calendar window."
        />
      </Section>
    </>
  );
}

function Tracking({
  result,
  orders,
  selected,
  setSelected,
  onTrack,
  onAssignMachine,
  onOperationStatus,
  onRefresh,
}) {
  const wo = result?.workOrderNo ? result : null;
  return (
    <>
      <PageHeading
        title="Production tracking"
        description="Record output by operation and see progress in real time."
        action="Record output"
        onAction={onTrack}
      />
      <div className="filter-row">
        <label className="inline-select">
          Work order
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Choose a work order…</option>
            {orders.map((o) => (
              <option value={o.id} key={o.id}>
                {o.workOrderNo} · {o.salesOrder?.orderNumber}
              </option>
            ))}
          </select>
        </label>
        <div className="row-actions">
          <button className="button subtle" onClick={onAssignMachine}>
            ＋ Assign machine
          </button>
          <button className="button subtle" onClick={onRefresh}>
            ↻ Refresh
          </button>
        </div>
      </div>
      {wo ? (
        <>
          <div className="metric-grid compact">
            <Metric
              label="Planned quantity"
              value={Number(wo.plannedQuantity).toLocaleString("en-IN")}
              note={wo.workOrderNo}
              icon="▤"
            />
            <Metric
              label="Produced"
              value={Number(wo.producedQuantity).toLocaleString("en-IN")}
              note={`${Math.round((Number(wo.producedQuantity) / Number(wo.plannedQuantity)) * 100 || 0)}% complete`}
              icon="▥"
              tone="violet"
            />
            <Metric
              label="Accepted"
              value={Number(wo.goodQuantity).toLocaleString("en-IN")}
              note="Passed quality inspection"
              icon="✓"
              tone="green"
            />
            <Metric
              label="Rejected"
              value={Number(wo.rejectedQuantity).toLocaleString("en-IN")}
              note="Requires disposition or rework"
              icon="⚑"
              tone="amber"
            />
          </div>
          <Section
            title="Operation log"
            subtitle="Production entries, run time, and operator notes"
          >
            <Table
              columns={[
                {
                  key: "recordedAt",
                  label: "Recorded",
                  render: (r) => fmtDateTime(r.recordedAt),
                },
                {
                  key: "operationLog.operationName",
                  label: "Operation",
                  path: "operationLog.operationName",
                },
                { key: "quantity", label: "Quantity" },
                { key: "downtimeMinutes", label: "Downtime (min)" },
                {
                  key: "recordedBy.name",
                  label: "Recorded by",
                  path: "recordedBy.name",
                },
                { key: "notes", label: "Notes" },
              ]}
              rows={wo.productionEntries || []}
              emptyText="No production output has been reported for this work order."
            />
          </Section>
          <Section title="Operations" subtitle="Routing and machine activity">
            <Table
              columns={[
                { key: "sequence", label: "#" },
                { key: "operationName", label: "Operation" },
                { key: "machine.name", label: "Machine", path: "machine.name" },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => <Status value={r.status} />,
                },
                {
                  key: "startedAt",
                  label: "Started",
                  render: (r) => fmtDateTime(r.startedAt),
                },
                {
                  key: "entries",
                  label: "Entries",
                  render: (r) => r.entries?.length || 0,
                },
                {
                  key: "actions",
                  label: "Update",
                  render: (r) => (
                    <select
                      aria-label={`Update ${r.operationName}`}
                      value={r.status}
                      onChange={(e) => onOperationStatus(r.id, e.target.value)}
                    >
                      {["PENDING", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map(
                        (status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ),
                      )}
                    </select>
                  ),
                },
              ]}
              rows={wo.operationLogs || []}
            />
          </Section>
        </>
      ) : (
        <Empty
          title="Select a work order"
          text="Choose an order above to view its production entries and operations."
        />
      )}
    </>
  );
}

function Workers({ result, workers, orders, onAllocate, onRefresh, onRemove }) {
  return (
    <>
      <PageHeading
        title="Worker allocation"
        description="Assign production operators to work orders and avoid overlapping shifts."
        action="Allocate worker"
        onAction={onAllocate}
      />
      <div className="metric-grid compact">
        <Metric
          label="Active workers"
          value={workers.length}
          note="Production, engineering, and quality team"
          icon="♙"
        />
        <Metric
          label="Allocations"
          value={result?.allocations?.length || 0}
          note="Scheduled work assignments"
          icon="▤"
          tone="violet"
        />
        <Metric
          label="Open work orders"
          value={
            orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status))
              .length
          }
          note="Available to staff"
          icon="⚙"
          tone="green"
        />
      </div>
      <Section
        title="Allocation schedule"
        subtitle="Worker, operation, and assigned shift"
        action="Refresh"
        onAction={onRefresh}
      >
        <Table
          columns={[
            { key: "user.name", label: "Worker", path: "user.name" },
            {
              key: "user.employeeCode",
              label: "Employee ID",
              path: "user.employeeCode",
            },
            {
              key: "workOrder.workOrderNo",
              label: "Work order",
              path: "workOrder.workOrderNo",
            },
            { key: "operationName", label: "Operation" },
            { key: "shift", label: "Shift" },
            { key: "allocatedHours", label: "Hours" },
            {
              key: "startAt",
              label: "Start",
              render: (r) => fmtDateTime(r.startAt),
            },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <button className="row-danger" onClick={() => onRemove(r.id)}>
                  Remove
                </button>
              ),
            },
          ]}
          rows={result?.allocations || []}
          emptyText="No workforce allocations yet."
        />
      </Section>
    </>
  );
}

function Machines({ result, onAdd, onRefresh }) {
  const available = (result || []).filter(
    (m) => m.status === "AVAILABLE",
  ).length;
  return (
    <>
      <PageHeading
        title="Machine management"
        description="Manage work centers, availability, and production equipment."
        action="Add machine"
        onAction={onAdd}
      />
      <div className="metric-grid compact">
        <Metric
          label="Registered machines"
          value={result?.length || 0}
          note="Factory equipment register"
          icon="⚙"
        />
        <Metric
          label="Available"
          value={available}
          note="Ready for an assignment"
          icon="✓"
          tone="green"
        />
        <Metric
          label="Maintenance / offline"
          value={
            (result || []).filter((m) =>
              ["MAINTENANCE", "OFFLINE"].includes(m.status),
            ).length
          }
          note="Unavailable for production"
          icon="◷"
          tone="amber"
        />
      </div>
      <Section
        title="Machine register"
        subtitle="Equipment and work center status"
        action="Refresh"
        onAction={onRefresh}
      >
        <Table
          columns={[
            { key: "machineCode", label: "Machine ID" },
            { key: "name", label: "Machine" },
            { key: "workCenter", label: "Work center" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Status value={r.status} />,
            },
            { key: "capacityPerShift", label: "Capacity / shift" },
            {
              key: "hourlyCost",
              label: "Hourly cost",
              render: (r) =>
                `₹${Number(r.hourlyCost || 0).toLocaleString("en-IN")}`,
            },
            {
              key: "_count.assignments",
              label: "Assignments",
              path: "_count.assignments",
            },
          ]}
          rows={result || []}
          emptyText="No machines registered. Add your first machine to start assigning factory capacity."
        />
      </Section>
    </>
  );
}

function Materials({
  result,
  orders,
  selected,
  setSelected,
  onConsume,
  onRefresh,
}) {
  const wo = result?.workOrderNo ? result : null;
  return (
    <>
      <PageHeading
        title="Material consumption"
        description="Compare issued components with actual material used on each order."
        action={wo ? "Record consumption" : undefined}
        onAction={onConsume}
      />
      <div className="filter-row">
        <label className="inline-select">
          Work order
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Choose a work order…</option>
            {orders.map((o) => (
              <option value={o.id} key={o.id}>
                {o.workOrderNo} · {o.salesOrder?.orderNumber}
              </option>
            ))}
          </select>
        </label>
        <button className="button subtle" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>
      {wo ? (
        <Section
          title="Component usage"
          subtitle={`${wo.workOrderNo} · planned versus issued and consumed`}
        >
          <Table
            columns={[
              { key: "id", label: "Item ID" },
              { key: "product.sku", label: "SKU", path: "product.sku" },
              { key: "product.name", label: "Component", path: "product.name" },
              { key: "plannedQuantity", label: "Planned" },
              { key: "issuedQuantity", label: "Issued" },
              { key: "consumedQuantity", label: "Consumed" },
              {
                key: "remaining",
                label: "Issued balance",
                render: (r) =>
                  (
                    Number(r.issuedQuantity) - Number(r.consumedQuantity)
                  ).toFixed(3),
              },
              {
                key: "consumptions",
                label: "Entries",
                render: (r) => r.consumptions?.length || 0,
              },
            ]}
            rows={wo.items || []}
            emptyText="This work order has no BOM component lines. Add a released BOM before issuing materials."
          />
        </Section>
      ) : (
        <Empty
          title="Select a work order"
          text="Choose a work order to review and record material consumption."
        />
      )}
    </>
  );
}

function Completion({ orders, onComplete, onOpenTracking }) {
  const ready = orders.filter((o) =>
    ["IN_PROGRESS", "QC_HOLD"].includes(o.status),
  );
  return (
    <>
      <PageHeading
        title="Production completion"
        description="Close an order after planned output is reported, inspected, and all defects are resolved."
      />
      <div className="callout-info">
        <Icon>i</Icon>
        <div>
          <strong>Completion updates finished goods inventory</strong>
          <p>
            The backend checks output quantity, inspection totals, and open
            defects before completing an order.
          </p>
        </div>
      </div>
      <Section
        title="Ready for completion review"
        subtitle="Complete only orders that have passed production and quality gates"
      >
        <Table
          columns={[
            { key: "workOrderNo", label: "Work order" },
            {
              key: "salesOrder.orderNumber",
              label: "Sales order",
              path: "salesOrder.orderNumber",
            },
            { key: "plannedQuantity", label: "Planned" },
            { key: "producedQuantity", label: "Produced" },
            { key: "goodQuantity", label: "Accepted" },
            { key: "rejectedQuantity", label: "Rejected" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Status value={r.status} />,
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="row-actions">
                  <button onClick={() => onOpenTracking(r.id)}>
                    View tracking
                  </button>
                  <button
                    className="complete-button"
                    onClick={() => onComplete(r.id)}
                  >
                    Complete
                  </button>
                </div>
              ),
            },
          ]}
          rows={ready}
          emptyText="No work orders are ready for completion review."
        />
      </Section>
    </>
  );
}

export { Dashboard, OrderList, OrderDetails, Planning, Tracking, Workers, Machines, Materials, Completion };
