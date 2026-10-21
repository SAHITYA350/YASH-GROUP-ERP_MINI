import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";
import * as support from "../services/productionSupport.service.js";

const wrap =
  (work, created = false) =>
  async (req, res) => {
    try {
      return res
        .status(created ? 201 : 200)
        .json({ success: true, data: await work(req) });
    } catch (error) {
      return res
        .status(errorStatus(error))
        .json({ success: false, message: errorMessage(error) });
    }
  };
export const alerts = wrap((req) => support.listAlerts(req.query));
export const createAlert = wrap((req) => support.createAlert(req.body), true);
export const updateAlert = wrap((req) =>
  support.updateAlert(req.params.id, { ...req.body, userId: req.user?.id }),
);
export const generateAlerts = wrap(() => support.generateOperationalAlerts());
export const maintenance = wrap((req) => support.listMaintenance(req.query));
export const createMaintenance = wrap(
  (req) => support.createMaintenance(req.body),
  true,
);
export const updateMaintenance = wrap((req) =>
  support.updateMaintenance(req.params.id, req.body),
);
export const costs = wrap((req) => support.listCosts(req.query));
export const costSummary = wrap((req) => support.costSummary(req.query));
export const createCost = wrap(
  (req) => support.createCost(req.body, req.user?.id),
  true,
);
export const audit = wrap((req) => support.listAuditEvents(req.query));
export const recordAudit = wrap(
  (req) => support.recordAuditEvent(req.body, req.user?.id),
  true,
);
export const traceability = wrap((req) => support.traceability(req.query));
export const analytics = wrap((req) => support.productionAnalytics(req.query));
