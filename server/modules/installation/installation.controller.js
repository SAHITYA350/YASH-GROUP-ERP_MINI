// server/modules/installation/installation.controller.js
import service from "./installation.service.js";

export async function list(req, res, next) {
  try {
    const result = await service.listInstallations(req.query);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const installation = await service.createInstallation(projectId, req.body);
    res.status(201).json({ success: true, data: installation });
  } catch (e) {
    next(e);
  }
}

export async function patch(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = await service.updateInstallation(id, req.body);
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
}

export default { list, create, patch };
