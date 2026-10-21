import {
  listDefects,
  createDefect,
  updateDefect,
  createReworkOrder,
  listReworkOrders,
  updateReworkOrder,
  getQualityReport,
} from "../services/qualityManagement.service.js";
import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";

const handle =
  (work, status = 200, message = "Request completed.") =>
  async (req, res) => {
    try {
      return res
        .status(status)
        .json({ success: true, message, data: await work(req) });
    } catch (error) {
      return res
        .status(errorStatus(error))
        .json({ success: false, message: errorMessage(error) });
    }
  };

export const defects = handle((req) => listDefects(req.query));
export const addDefect = handle(
  (req) => createDefect(req.params.id, req.body),
  201,
  "Defect recorded.",
);
export const changeDefect = handle(
  (req) => updateDefect(req.params.defectId, req.body),
  200,
  "Defect updated.",
);
export const reworkOrders = handle((req) => listReworkOrders(req.query));
export const addReworkOrder = handle(
  (req) => createReworkOrder(req.params.defectId, req.body),
  201,
  "Rework order created.",
);
export const changeReworkOrder = handle(
  (req) => updateReworkOrder(req.params.reworkId, req.body),
  200,
  "Rework order updated.",
);
export const reports = handle((req) => getQualityReport(req.query));
