// server/modules/project/project.controller.js
import service from "./project.service.js";

// List with pagination & filters
export async function list(req, res, next) {
  try {
    const result = await service.listProjects(req.query);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}

export async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    const project = await service.getProject(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, data: project });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const project = await service.createProject(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (e) {
    next(e);
  }
}

export async function patchStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updated = await service.updateProjectStatus(id, status);
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
}

export default { list, get, create, patchStatus };
