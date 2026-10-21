// server/modules/installation/installation.service.js
import repository from "./installation.repository.js";
import { makeCode, toId } from "../../common/utils.js";

export const installationStatuses = [
  "NOT_REQUIRED",
  "SURVEY_DUE",
  "PLANNED",
  "SCHEDULED",
  "IN_PROGRESS",
  "TESTING",
  "HANDOVER_PENDING",
  "COMPLETED",
  "BLOCKED",
];

export async function listInstallations({ projectId, status, page = 1, pageSize = 20 }) {
  try {
    const where = {};
    if (projectId) {
      const pid = toId(projectId);
      if (pid) where.projectId = pid;
    }
    if (status && installationStatuses.includes(status)) where.status = status;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [data, total] = await Promise.all([
      repository.findMany({ where, skip, take }),
      repository.count({ where }),
    ]);

    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  } catch (e) {
    console.error("Error listing installations:", e);
    return { data: [], total: 0, page: Number(page), pageSize: Number(pageSize) };
  }
}

export async function createInstallation(projectId, payload) {
  const { scheduledAt, notes } = payload;
  return repository.create({
    installationNo: makeCode("INS"),
    projectId: toId(projectId),
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    notes: notes || null,
  });
}

export async function updateInstallation(id, updates) {
  const nid = toId(id);
  const data = {};
  const { status, scheduledAt, notes, customerSignoffName, testResults } = updates;
  if (status !== undefined) {
    if (!installationStatuses.includes(status)) throw new Error("Invalid installation status");
    data.status = status;
    if (status === "IN_PROGRESS") data.startedAt = new Date();
    if (status === "COMPLETED") data.completedAt = new Date();
  }
  if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
  if (notes !== undefined) data.notes = notes;
  if (customerSignoffName !== undefined) {
    data.customerSignoffName = customerSignoffName;
    data.customerSignedAt = customerSignoffName ? new Date() : null;
  }
  if (testResults !== undefined) data.testResults = testResults;

  return repository.update(nid, data);
}

export default { listInstallations, createInstallation, updateInstallation, installationStatuses };
