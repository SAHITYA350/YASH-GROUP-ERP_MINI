import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";
import {
  createNcr,
  listNcr,
  updateNcr,
} from "../services/nonConformance.service.js";

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

export const ncr = wrap((req) => listNcr(req.query));
export const createNcrRecord = wrap((req) => createNcr(req.body), true);
export const updateNcrRecord = wrap((req) =>
  updateNcr(req.params.id, req.body),
);
