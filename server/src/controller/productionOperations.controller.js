import {
  listMachines, saveMachine, listWorkforce, allocateWorker, removeWorkerAllocation,
  assignMachine, removeMachineAssignment, recordProduction, getProductionTracking,
  consumeWorkOrderMaterial, getMaterialConsumption, getProductionWorkforceSummary, updateOperationStatus,
  listProductionSalesOrders, listManufacturedProducts,
} from "../utils/productionOperations.service.js";
import { errorMessage, errorStatus } from "../utils/httpError.js";

const handle = (work, successStatus = 200, message = "Request completed.") => async (req, res) => {
  try {
    const data = await work(req);
    return res.status(successStatus).json({ success: true, message, data });
  } catch (error) {
    return res.status(errorStatus(error)).json({ success: false, message: errorMessage(error) });
  }
};

export const machines = handle((req) => listMachines(req.query), 200);
export const createMachine = handle((req) => saveMachine(req.body), 201, "Machine created.");
export const updateMachine = handle((req) => saveMachine(req.body, req.params.machineId), 200, "Machine updated.");
export const workforce = handle((req) => listWorkforce(), 200);
export const salesOrders = handle(() => listProductionSalesOrders(), 200);
export const products = handle(() => listManufacturedProducts(), 200);
export const allocations = handle((req) => getProductionWorkforceSummary(), 200);
export const addWorker = handle((req) => allocateWorker(req.params.id, req.body), 201, "Worker allocated.");
export const deleteWorker = handle((req) => removeWorkerAllocation(req.params.allocationId), 200, "Worker allocation removed.");
export const addMachine = handle((req) => assignMachine(req.params.id, req.body), 201, "Machine assigned.");
export const deleteMachine = handle((req) => removeMachineAssignment(req.params.assignmentId), 200, "Machine assignment removed.");
export const trackProduction = handle((req) => recordProduction(req.params.id, req.body, req.user?.id), 201, "Production entry recorded.");
export const productionTracking = handle((req) => getProductionTracking(req.params.id), 200);
export const updateOperation = handle((req) => updateOperationStatus(req.params.operationId, req.body.status), 200, "Operation status updated.");
export const consumeMaterial = handle((req) => consumeWorkOrderMaterial(req.params.id, req.body.items, req.user?.id), 201, "Material consumption recorded.");
export const materialConsumption = handle((req) => getMaterialConsumption(req.params.id), 200);
