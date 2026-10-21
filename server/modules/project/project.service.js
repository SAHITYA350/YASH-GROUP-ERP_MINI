// server/modules/project/project.service.js
import repository from "./project.repository.js";
import { makeCode, toId } from "../../common/utils.js";

// List projects with optional filters & pagination
export async function listProjects({ search, status, ownerId, page = 1, pageSize = 20 }) {
  try {
    const where = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }
    if (ownerId) {
      const oid = toId(ownerId);
      if (oid) where.ownerId = oid;
    }
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [data, total] = await Promise.all([
      repository.findMany({ where, skip, take }),
      repository.count({ where }),
    ]);

    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  } catch (e) {
    console.error("Error listing projects:", e);
    return { data: [], total: 0, page: Number(page), pageSize: Number(pageSize) };
  }
}

export async function getProject(id) {
  const nid = toId(id);
  if (!nid) return null;
  return repository.findById(nid);
}

export async function createProject(payload) {
  const { name, customerId, salesOrderId, ownerId, siteName, siteAddress, plannedStart, plannedEnd, surveyDate, notes } = payload;
  return repository.create({
    projectCode: makeCode("PRJ"),
    name: String(name).trim(),
    customerId: toId(customerId),
    salesOrderId: toId(salesOrderId),
    ownerId: ownerId == null ? null : toId(ownerId),
    siteName: siteName || null,
    siteAddress: siteAddress || undefined,
    plannedStart: plannedStart ? new Date(plannedStart) : null,
    plannedEnd: plannedEnd ? new Date(plannedEnd) : null,
    surveyDate: surveyDate ? new Date(surveyDate) : null,
    notes: notes || null,
  });
}

export async function updateProjectStatus(id, status) {
  const nid = toId(id);
  const data = { status };
  if (status === "IN_PROGRESS") data.actualStart = new Date();
  if (status === "COMPLETED") data.actualEnd = new Date();
  return repository.update(nid, data);
}

export default { listProjects, getProject, createProject, updateProjectStatus };
