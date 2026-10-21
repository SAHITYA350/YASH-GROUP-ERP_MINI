import { useState } from "react";
import Metric from "../common/Metric";
import PageHeading from "../common/PageHeading";
import Section from "../common/Section";
import Status from "../common/Status";
import Table from "../common/Table";
import { fmtDate, fmtDateTime } from "../../utils/formatters";

function Inspections({ result, onAdd, onRelease }) {
  return (
    <>
      <PageHeading
        kicker="QUALITY ASSURANCE"
        title="Quality inspections"
        description="Record incoming and in-process inspection results and release accepted output."
        action="New inspection"
        onAction={onAdd}
      />
      <div className="metric-grid compact">
        <Metric
          label="Inspections"
          value={result?.total || 0}
          note="All inspection records"
          icon="⌕"
        />
        <Metric
          label="Inspected units"
          value={Number(
            (result?.inspections || []).reduce(
              (s, r) => s + Number(r.inspectedQuantity),
              0,
            ),
          ).toLocaleString("en-IN")}
          note="Across current register"
          icon="▤"
          tone="blue"
        />
        <Metric
          label="Accepted units"
          value={Number(
            (result?.inspections || []).reduce(
              (s, r) => s + Number(r.acceptedQuantity),
              0,
            ),
          ).toLocaleString("en-IN")}
          note="Ready for finished goods"
          icon="✓"
          tone="green"
        />
      </div>
      <Section
        title="Inspection register"
        subtitle="Acceptance, rejection, measurements, and disposition"
      >
        <Table
          columns={[
            { key: "inspectionNo", label: "Inspection" },
            {
              key: "workOrder.workOrderNo",
              label: "Work order",
              path: "workOrder.workOrderNo",
            },
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
              label: "Result",
              render: (r) => <Status value={r.status} />,
            },
            { key: "evidenceNotes", label: "Notes" },
            {
              key: "actions",
              label: "",
              render: (r) =>
                ["PASS", "HOLD"].includes(r.status) && (
                  <button
                    className="complete-button"
                    onClick={() => onRelease(r.id)}
                  >
                    Release
                  </button>
                ),
            },
          ]}
          rows={result?.inspections || []}
          emptyText="No inspections found. Record the first quality result for a work order."
        />
      </Section>
    </>
  );
}

function Defects({ result, inspections, onAdd, onUpdate }) {
  return (
    <>
      <PageHeading
        kicker="QUALITY ASSURANCE"
        title="Defect register"
        description="Classify nonconformances, assign severity, and track disposition through resolution."
        action="Log a defect"
        onAction={onAdd}
      />
      <div className="metric-grid compact">
        <Metric
          label="Open defects"
          value={
            (result?.defects || []).filter((d) =>
              ["OPEN", "IN_REWORK"].includes(d.status),
            ).length
          }
          note="Awaiting resolution"
          icon="⚑"
          tone="red"
        />
        <Metric
          label="Critical severity"
          value={
            (result?.defects || []).filter((d) => d.severity === "CRITICAL")
              .length
          }
          note="Requires immediate action"
          icon="!"
          tone="amber"
        />
        <Metric
          label="Total rejected qty"
          value={(result?.defects || []).reduce(
            (s, d) => s + Number(d.quantity),
            0,
          )}
          note="Linked to inspections"
          icon="▥"
        />
      </div>
      <Section
        title="Defect records"
        subtitle={`${inspections.length} inspection records available for linking`}
      >
        <Table
          columns={[
            { key: "defectCode", label: "Defect ID" },
            { key: "category", label: "Category" },
            {
              key: "inspection.workOrder.workOrderNo",
              label: "Work order",
              path: "inspection.workOrder.workOrderNo",
            },
            {
              key: "severity",
              label: "Severity",
              render: (r) => (
                <span
                  className={`priority priority-${r.severity?.toLowerCase()}`}
                >
                  {r.severity}
                </span>
              ),
            },
            { key: "quantity", label: "Quantity" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Status value={r.status} />,
            },
            { key: "disposition", label: "Disposition" },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <div className="row-actions">
                  {r.status === "OPEN" && (
                    <button onClick={() => onUpdate(r.id, "SCRAPPED")}>
                      Scrap
                    </button>
                  )}
                  {r.status === "IN_REWORK" && (
                    <button onClick={() => onUpdate(r.id, "OPEN")}>
                      Reopen
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={result?.defects || []}
          emptyText="No defects recorded."
        />
      </Section>
    </>
  );
}

function Rework({ result, defects, workers, onAdd, onUpdate }) {
  const orders = result?.rework || [];
  return (
    <>
      <PageHeading
        kicker="QUALITY ASSURANCE"
        title="Rework orders"
        description="Recover rejected units with controlled assignments and re-inspection."
        action="Create rework order"
        onAction={onAdd}
      />
      <div className="metric-grid compact">
        <Metric
          label="Open rework"
          value={
            orders.filter((r) => ["PLANNED", "IN_PROGRESS"].includes(r.status))
              .length
          }
          note="In the rework queue"
          icon="↻"
          tone="amber"
        />
        <Metric
          label="Resolved defects"
          value={defects.filter((d) => d.status === "RESOLVED").length}
          note="Recovered or completed"
          icon="✓"
          tone="green"
        />
        <Metric
          label="Available assignees"
          value={workers.length}
          note="Production and quality staff"
          icon="♙"
        />
      </div>
      <Section
        title="Rework register"
        subtitle="Assignments and defect resolution"
      >
        <Table
          columns={[
            { key: "reworkNo", label: "Rework order" },
            {
              key: "workOrder.workOrderNo",
              label: "Work order",
              path: "workOrder.workOrderNo",
            },
            {
              key: "defect.defectCode",
              label: "Defect",
              path: "defect.defectCode",
            },
            { key: "quantity", label: "Qty" },
            {
              key: "assignedTo.name",
              label: "Assigned to",
              path: "assignedTo.name",
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Status value={r.status} />,
            },
            {
              key: "actions",
              label: "Update",
              render: (r) => (
                <div className="row-actions">
                  {r.status === "PLANNED" && (
                    <button onClick={() => onUpdate(r.id, "IN_PROGRESS")}>
                      Start
                    </button>
                  )}
                  {r.status === "IN_PROGRESS" && (
                    <button
                      className="complete-button"
                      onClick={() => onUpdate(r.id, "COMPLETED")}
                    >
                      Complete
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={orders}
          emptyText="No rework orders have been created."
        />
      </Section>
    </>
  );
}

function QualityReports({ result, onRefresh }) {
  const [range, setRange] = useState({ from: "", to: "" });
  const report = result || {};
  return (
    <>
      <PageHeading
        kicker="QUALITY ANALYTICS"
        title="Quality reports"
        description="Inspection yield, rejected output, defect severity, and disposition trends."
        action="Refresh report"
        onAction={() => onRefresh(range)}
      />
      <div className="report-filter">
        <label>
          From
          <input
            type="date"
            value={range.from}
            onChange={(e) =>
              setRange((current) => ({ ...current, from: e.target.value }))
            }
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={range.to}
            onChange={(e) =>
              setRange((current) => ({ ...current, to: e.target.value }))
            }
          />
        </label>
        <button className="button subtle" onClick={() => onRefresh(range)}>
          Apply range
        </button>
      </div>
      <div className="metric-grid">
        <Metric
          label="Inspections"
          value={report.inspections?.count ?? 0}
          note="Selected reporting period"
          icon="⌕"
        />
        <Metric
          label="First pass yield"
          value={`${report.inspections?.passRate ?? 0}%`}
          note={`${report.inspections?.accepted ?? 0} units accepted`}
          icon="✓"
          tone="green"
        />
        <Metric
          label="Rejected quantity"
          value={report.inspections?.rejected ?? 0}
          note="Requires disposition"
          icon="⚑"
          tone="amber"
        />
        <Metric
          label="Defect quantity"
          value={Object.values(report.defects?.byStatus || {}).reduce(
            (s, v) => s + Number(v.quantity),
            0,
          )}
          note="Logged defect records"
          icon="▥"
          tone="red"
        />
      </div>
      <div className="report-grid">
        <Section title="Defects by status" subtitle="Quantity and record count">
          <div className="report-list">
            {Object.entries(report.defects?.byStatus || {}).map(
              ([key, value]) => (
                <div className="report-row" key={key}>
                  <Status value={key} />
                  <span>{value.count} records</span>
                  <strong>{value.quantity} units</strong>
                </div>
              ),
            )}
          </div>
        </Section>
        <Section title="Severity mix" subtitle="Defect records by severity">
          <div className="severity-list">
            {Object.entries(report.defects?.bySeverity || {}).map(
              ([key, count]) => (
                <div key={key}>
                  <span
                    className={`severity-chip severity-${key.toLowerCase()}`}
                  />
                  {key}
                  <strong>{count}</strong>
                </div>
              ),
            )}
          </div>
        </Section>
      </div>
      <Section
        title="Recent inspections"
        subtitle={
          report.range
            ? `${fmtDate(report.range.from)} – ${fmtDate(report.range.to)}`
            : "Current reporting period"
        }
      >
        <Table
          columns={[
            { key: "inspectionNo", label: "Inspection" },
            {
              key: "workOrder.workOrderNo",
              label: "Work order",
              path: "workOrder.workOrderNo",
            },
            {
              key: "inspectedAt",
              label: "Date",
              render: (r) => fmtDateTime(r.inspectedAt),
            },
            { key: "inspectedQuantity", label: "Inspected" },
            { key: "acceptedQuantity", label: "Accepted" },
            { key: "rejectedQuantity", label: "Rejected" },
            {
              key: "status",
              label: "Result",
              render: (r) => <Status value={r.status} />,
            },
          ]}
          rows={report.recentInspections || []}
        />
      </Section>
    </>
  );
}

function BomList({ result, onAdd, onRefresh, onUpdate }) {
  return (
    <>
      <PageHeading
        title="Bill of materials"
        description="Maintain versioned product recipes and release build instructions to production."
        action="New BOM revision"
        onAction={onAdd}
      />
      <div className="metric-grid compact">
        {Object.entries(result?.stats?.byStatus || {}).map(
          ([status, value]) => (
            <Metric
              key={status}
              label={status.replaceAll("_", " ")}
              value={value}
              note="BOM revisions"
              icon="⊞"
            />
          ),
        )}
      </div>
      <Section
        title="BOM revisions"
        subtitle="Product components, costs, and engineering status"
        action="Refresh"
        onAction={onRefresh}
      >
        <Table
          columns={[
            { key: "product.sku", label: "SKU", path: "product.sku" },
            { key: "product.name", label: "Product", path: "product.name" },
            { key: "revision", label: "Revision" },
            {
              key: "items",
              label: "Components",
              render: (r) => r.items?.length || 0,
            },
            {
              key: "operations",
              label: "Operations",
              render: (r) => r.operations?.length || 0,
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Status value={r.status} />,
            },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <div className="row-actions">
                  {r.status === "DRAFT" && (
                    <button onClick={() => onUpdate(r.id, "IN_REVIEW")}>
                      Submit review
                    </button>
                  )}
                  {r.status === "IN_REVIEW" && (
                    <button
                      className="complete-button"
                      onClick={() => onUpdate(r.id, "RELEASED")}
                    >
                      Release
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={result?.boms || []}
          emptyText="No BOM revisions found. Create a draft recipe to begin."
        />
      </Section>
    </>
  );
}

export { Inspections, Defects, Rework, QualityReports, BomList };
