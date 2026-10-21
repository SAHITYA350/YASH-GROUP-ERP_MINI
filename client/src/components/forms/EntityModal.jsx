import Field from "../common/Field";
import Form from "../common/Form";
import Input from "../common/Input";
import Modal from "../common/Modal";
import { dateInputValue } from "../../utils/formatters";

export default function EntityModal({
  modal,
  modalTitle,
  busy,
  save,
  data,
  orderOptions,
  selectedOrder,
  setError,
  setModal,
  editingOrder,
}) {
  if (!modal) return null;

  return (
    <Modal title={modalTitle} onClose={() => setModal("")}>
          {modal === "order" && (
            <Form
              busy={busy}
              submit="Create order"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save("/production/orders", {
                  salesOrderId: f.get("salesOrderId"),
                  bomRevisionId: f.get("bomRevisionId") || undefined,
                  plannedQuantity: f.get("plannedQuantity"),
                  plannedStart: f.get("plannedStart") || undefined,
                  plannedEnd: f.get("plannedEnd") || undefined,
                  priority: f.get("priority"),
                  notes: f.get("notes"),
                });
              }}
            >
              <Field label="Sales order">
                <Input
                  name="salesOrderId"
                  options={(data["sales-orders"] || []).map((order) => ({
                    value: order.id,
                    label: `${order.orderNumber} · ${order.customer?.name} (${order.status})`,
                  }))}
                  required
                />
              </Field>
              <Field label="BOM revision ID">
                <Input
                  name="bomRevisionId"
                  type="number"
                  min="1"
                  placeholder="Optional released BOM ID"
                />
              </Field>
              <Field label="Planned quantity">
                <Input
                  name="plannedQuantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                  placeholder="0"
                />
              </Field>
              <Field label="Priority">
                <Input
                  name="priority"
                  options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
                  value="MEDIUM"
                />
              </Field>
              <Field label="Planned start">
                <Input name="plannedStart" type="date" />
              </Field>
              <Field label="Planned end">
                <Input name="plannedEnd" type="date" />
              </Field>
              <Field label="Notes" wide>
                <Input
                  name="notes"
                  type="textarea"
                  placeholder="Production instructions…"
                />
              </Field>
            </Form>
          )}
          {modal === "editOrder" && editingOrder && (
            <Form
              busy={busy}
              submit="Save order"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save(
                  `/production/orders/${editingOrder.id}`,
                  {
                    plannedQuantity: f.get("plannedQuantity"),
                    plannedStart: f.get("plannedStart") || null,
                    plannedEnd: f.get("plannedEnd") || null,
                    priority: f.get("priority"),
                    notes: f.get("notes"),
                  },
                  "PATCH",
                  "Production order updated.",
                );
              }}
            >
              <Field label="Planned quantity">
                <Input
                  name="plannedQuantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={editingOrder.plannedQuantity}
                  required
                />
              </Field>
              <Field label="Priority">
                <Input
                  name="priority"
                  options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
                  value={editingOrder.priority}
                />
              </Field>
              <Field label="Planned start">
                <Input
                  name="plannedStart"
                  type="date"
                  value={dateInputValue(editingOrder.plannedStart)}
                />
              </Field>
              <Field label="Planned end">
                <Input
                  name="plannedEnd"
                  type="date"
                  value={dateInputValue(editingOrder.plannedEnd)}
                />
              </Field>
              <Field label="Notes" wide>
                <Input
                  name="notes"
                  type="textarea"
                  value={editingOrder.notes || ""}
                />
              </Field>
            </Form>
          )}
          {modal === "machine" && (
            <Form
              busy={busy}
              submit="Add machine"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save("/production/machines", {
                  machineCode: f.get("machineCode"),
                  name: f.get("name"),
                  workCenter: f.get("workCenter"),
                  capacityPerShift: f.get("capacityPerShift") || undefined,
                  hourlyCost: f.get("hourlyCost") || 0,
                  status: f.get("status"),
                  notes: f.get("notes"),
                });
              }}
            >
              <Field label="Machine code">
                <Input name="machineCode" required placeholder="e.g. CNC-01" />
              </Field>
              <Field label="Machine name">
                <Input name="name" required placeholder="Machine name" />
              </Field>
              <Field label="Work center">
                <Input name="workCenter" placeholder="Assembly" />
              </Field>
              <Field label="Status">
                <Input
                  name="status"
                  options={["AVAILABLE", "MAINTENANCE", "OFFLINE"]}
                  value="AVAILABLE"
                />
              </Field>
              <Field label="Capacity / shift">
                <Input
                  name="capacityPerShift"
                  type="number"
                  min="0.001"
                  step="0.001"
                />
              </Field>
              <Field label="Hourly cost">
                <Input
                  name="hourlyCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value="0"
                />
              </Field>
              <Field label="Notes" wide>
                <Input name="notes" type="textarea" />
              </Field>
            </Form>
          )}
          {modal === "worker" && (
            <Form
              busy={busy}
              submit="Allocate worker"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save(`/production/orders/${f.get("workOrderId")}/workers`, {
                  userId: f.get("userId"),
                  operationName: f.get("operationName"),
                  shift: f.get("shift"),
                  allocatedHours: f.get("allocatedHours") || undefined,
                  startAt: f.get("startAt") || undefined,
                  endAt: f.get("endAt") || undefined,
                  notes: f.get("notes"),
                });
              }}
            >
              <Field label="Work order">
                <Input name="workOrderId" options={orderOptions} required />
              </Field>
              <Field label="Worker">
                <Input
                  name="userId"
                  options={(data.workers?.workers || []).map((w) => ({
                    value: w.id,
                    label: `${w.name} · ${w.role.replaceAll("_", " ")}`,
                  }))}
                  required
                />
              </Field>
              <Field label="Operation">
                <Input name="operationName" placeholder="Assembly" />
              </Field>
              <Field label="Shift">
                <Input
                  name="shift"
                  options={["GENERAL", "SHIFT_A", "SHIFT_B", "SITE"]}
                  value="GENERAL"
                />
              </Field>
              <Field label="Allocated hours">
                <Input
                  name="allocatedHours"
                  type="number"
                  min="0.01"
                  step="0.25"
                />
              </Field>
              <Field label="Start">
                <Input name="startAt" type="datetime-local" />
              </Field>
              <Field label="End">
                <Input name="endAt" type="datetime-local" />
              </Field>
              <Field label="Notes" wide>
                <Input name="notes" type="textarea" />
              </Field>
            </Form>
          )}
          {modal === "inspection" && (
            <Form
              busy={busy}
              submit="Save inspection"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save("/quality/inspections", {
                  workOrderId: f.get("workOrderId"),
                  inspectedQuantity: f.get("inspectedQuantity"),
                  acceptedQuantity: f.get("acceptedQuantity"),
                  rejectedQuantity: f.get("rejectedQuantity"),
                  measurements: f.get("measurements")
                    ? { notes: f.get("measurements") }
                    : undefined,
                  evidenceNotes: f.get("evidenceNotes"),
                  inspectedAt: f.get("inspectedAt") || undefined,
                });
              }}
            >
              <Field label="Work order">
                <Input name="workOrderId" options={orderOptions} required />
              </Field>
              <Field label="Inspected quantity">
                <Input
                  name="inspectedQuantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                />
              </Field>
              <Field label="Accepted">
                <Input
                  name="acceptedQuantity"
                  type="number"
                  min="0"
                  step="0.001"
                  required
                />
              </Field>
              <Field label="Rejected">
                <Input
                  name="rejectedQuantity"
                  type="number"
                  min="0"
                  step="0.001"
                  required
                />
              </Field>
              <Field label="Measurements" wide>
                <Input
                  name="measurements"
                  type="textarea"
                  placeholder="Measurement notes or dimensions"
                />
              </Field>
              <Field label="Evidence notes" wide>
                <Input
                  name="evidenceNotes"
                  type="textarea"
                  placeholder="Inspection notes"
                />
              </Field>
            </Form>
          )}
          {modal === "defect" && (
            <Form
              busy={busy}
              submit="Record defect"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save(`/quality/inspections/${f.get("inspectionId")}/defects`, {
                  defectCode: f.get("defectCode"),
                  category: f.get("category"),
                  description: f.get("description"),
                  severity: f.get("severity"),
                  quantity: f.get("quantity"),
                  disposition: f.get("disposition"),
                });
              }}
            >
              <Field label="Inspection">
                <Input
                  name="inspectionId"
                  options={(data.inspections?.inspections || []).map((i) => ({
                    value: i.id,
                    label: `${i.inspectionNo} · ${i.workOrder?.workOrderNo}`,
                  }))}
                  required
                />
              </Field>
              <Field label="Defect code">
                <Input name="defectCode" required placeholder="DEF-001" />
              </Field>
              <Field label="Category">
                <Input name="category" required placeholder="Surface finish" />
              </Field>
              <Field label="Severity">
                <Input
                  name="severity"
                  options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
                  value="MEDIUM"
                />
              </Field>
              <Field label="Quantity">
                <Input
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value="1"
                />
              </Field>
              <Field label="Disposition">
                <Input name="disposition" placeholder="Rework / scrap" />
              </Field>
              <Field label="Description" wide>
                <Input name="description" type="textarea" />
              </Field>
            </Form>
          )}
          {modal === "rework" && (
            <Form
              busy={busy}
              submit="Create rework order"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save(`/quality/defects/${f.get("defectId")}/rework`, {
                  quantity: f.get("quantity"),
                  assignedToId: f.get("assignedToId") || undefined,
                  reason: f.get("reason"),
                });
              }}
            >
              <Field label="Defect">
                <Input
                  name="defectId"
                  options={(data.rework?.defects || [])
                    .filter((d) => !["RESOLVED", "SCRAPPED"].includes(d.status))
                    .map((d) => ({
                      value: d.id,
                      label: `${d.defectCode} · ${d.category} (${d.quantity})`,
                    }))}
                  required
                />
              </Field>
              <Field label="Rework quantity">
                <Input
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                />
              </Field>
              <Field label="Assign to">
                <Input
                  name="assignedToId"
                  options={(data.rework?.workers || []).map((w) => ({
                    value: w.id,
                    label: w.name,
                  }))}
                />
              </Field>
              <Field label="Reason" wide>
                <Input
                  name="reason"
                  type="textarea"
                  placeholder="Repair instructions"
                />
              </Field>
            </Form>
          )}
          {modal === "tracking" && (
            <Form
              busy={busy}
              submit="Record output"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save(`/production/orders/${f.get("workOrderId")}/track`, {
                  quantity: f.get("quantity"),
                  operationLogId: f.get("operationLogId") || undefined,
                  operationName: f.get("operationName") || undefined,
                  sequence: f.get("sequence"),
                  machineId: f.get("machineId") || undefined,
                  downtimeMinutes: f.get("downtimeMinutes") || 0,
                  notes: f.get("notes"),
                });
              }}
            >
              <Field label="Work order">
                <Input
                  name="workOrderId"
                  options={orderOptions}
                  value={selectedOrder}
                  required
                />
              </Field>
              <Field label="Quantity produced">
                <Input
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                />
              </Field>
              <Field label="BOM operation">
                <Input
                  name="operationLogId"
                  options={(data.tracking?.operationLogs || []).map((op) => ({
                    value: op.id,
                    label: `${op.sequence}. ${op.operationName}`,
                  }))}
                />
              </Field>
              <Field label="New operation">
                <Input
                  name="operationName"
                  placeholder="Only if not in the BOM route"
                />
              </Field>
              <Field label="Sequence">
                <Input name="sequence" type="number" min="1" value="1" />
              </Field>
              <Field label="Assigned machine">
                <Input
                  name="machineId"
                  options={(data.machines || [])
                    .filter(
                      (machine) =>
                        machine.status === "AVAILABLE" ||
                        (data.tracking?.machineAssignments || []).some(
                          (assignment) =>
                            assignment.machineId === machine.id &&
                            !assignment.endAt,
                        ),
                    )
                    .map((machine) => ({
                      value: machine.id,
                      label: `${machine.machineCode} · ${machine.name}`,
                    }))}
                />
              </Field>
              <Field label="Downtime (minutes)">
                <Input
                  name="downtimeMinutes"
                  type="number"
                  min="0"
                  step="1"
                  value="0"
                />
              </Field>
              <Field label="Notes" wide>
                <Input name="notes" type="textarea" />
              </Field>
            </Form>
          )}
          {modal === "assignMachine" && (
            <Form
              busy={busy}
              submit="Assign machine"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save(`/production/orders/${f.get("workOrderId")}/machines`, {
                  machineId: f.get("machineId"),
                  startAt: f.get("startAt") || undefined,
                  endAt: f.get("endAt") || undefined,
                  notes: f.get("notes"),
                });
              }}
            >
              <Field label="Work order">
                <Input name="workOrderId" options={orderOptions} required />
              </Field>
              <Field label="Available machine">
                <Input
                  name="machineId"
                  options={(data.machines || [])
                    .filter((m) => m.status === "AVAILABLE")
                    .map((m) => ({
                      value: m.id,
                      label: `${m.machineCode} · ${m.name}`,
                    }))}
                  required
                />
              </Field>
              <Field label="Start">
                <Input name="startAt" type="datetime-local" />
              </Field>
              <Field label="End">
                <Input name="endAt" type="datetime-local" />
              </Field>
              <Field label="Notes" wide>
                <Input name="notes" type="textarea" />
              </Field>
            </Form>
          )}
          {modal === "consumption" && (
            <Form
              busy={busy}
              submit="Record consumption"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save(
                  `/production/orders/${f.get("workOrderId")}/consume-material`,
                  {
                    items: [
                      {
                        workOrderItemId: f.get("workOrderItemId"),
                        quantity: f.get("quantity"),
                        notes: f.get("notes"),
                      },
                    ],
                  },
                );
              }}
            >
              <Field label="Work order">
                <Input
                  name="workOrderId"
                  options={orderOptions}
                  value={selectedOrder}
                  required
                />
              </Field>
              <Field label="Material item">
                <Input
                  name="workOrderItemId"
                  options={(data.materials?.items || []).map((item) => ({
                    value: item.id,
                    label: `${item.product?.sku} · ${item.product?.name} (issued ${item.issuedQuantity})`,
                  }))}
                  required
                />
              </Field>
              <Field label="Consumed quantity">
                <Input
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                />
              </Field>
              <Field label="Notes" wide>
                <Input name="notes" type="textarea" />
              </Field>
            </Form>
          )}
          {modal === "bom" && (
            <Form
              busy={busy}
              submit="Create BOM revision"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const parseRows = (raw, operation = false) =>
                  raw
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => {
                      const [a, b, c, d] = line.split(",").map((v) => v.trim());
                      return operation
                        ? {
                            sequence: Number(a),
                            name: b,
                            workCenter: c,
                            standardMinutes: d ? Number(d) : undefined,
                          }
                        : {
                            componentProductId: Number(a),
                            quantity: Number(b),
                            scrapPercent: Number(c || 0),
                          };
                    });
                try {
                  save("/production/bom", {
                    productId: f.get("productId"),
                    revision: f.get("revision"),
                    notes: f.get("notes"),
                    materialCost: f.get("materialCost") || 0,
                    laborCost: f.get("laborCost") || 0,
                    overheadCost: f.get("overheadCost") || 0,
                    items: parseRows(f.get("items")),
                    operations: parseRows(f.get("operations"), true),
                  });
                } catch {
                  setError(
                    "Check BOM rows. Enter comma-separated values on each line.",
                  );
                }
              }}
            >
              <Field label="Manufactured product">
                <Input
                  name="productId"
                  options={(data.products || []).map((product) => ({
                    value: product.id,
                    label: `${product.sku} · ${product.name}`,
                  }))}
                  required
                />
              </Field>
              <Field label="Revision">
                <Input name="revision" required placeholder="R1" />
              </Field>
              <Field label="Material cost">
                <Input name="materialCost" type="number" min="0" step="0.01" />
              </Field>
              <Field label="Labor cost">
                <Input name="laborCost" type="number" min="0" step="0.01" />
              </Field>
              <Field label="Overhead cost">
                <Input name="overheadCost" type="number" min="0" step="0.01" />
              </Field>
              <Field label="Components" wide>
                <Input
                  name="items"
                  type="textarea"
                  placeholder={
                    "One per line: product ID, quantity, scrap %\nExample: 12, 2.5, 3"
                  }
                />
              </Field>
              <Field label="Routing operations" wide>
                <Input
                  name="operations"
                  type="textarea"
                  placeholder={
                    "One per line: sequence, name, work center, standard minutes\nExample: 1, Cutting, CNC, 25"
                  }
                />
              </Field>
              <Field label="Notes" wide>
                <Input name="notes" type="textarea" />
              </Field>
            </Form>
          )}

    </Modal>
  );
}
