import {
  createProductionOrder,
  getProductionOrders,
  getProductionOrderById,
  updateProductionOrder,
  deleteProductionOrder,
  getProductionStats,
  issueWorkOrderMaterial,
} from "../services/productionOrder.service.js";
import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";

// POST /api/production/orders
export const createOrder = async (req, res) => {
  try {
    const order = await createProductionOrder(req.body, req.user?.id);
    return res.status(201).json({
      success: true,
      message: "Work order created successfully.",
      data: order,
    });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/production/orders
export const getAllOrders = async (req, res) => {
  try {
    const result = await getProductionOrders(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/production/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await getProductionOrderById(req.params.id);
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// PATCH /api/production/orders/:id
export const updateOrder = async (req, res) => {
  try {
    const order = await updateProductionOrder(req.params.id, req.body);
    return res
      .status(200)
      .json({ success: true, message: "Work order updated.", data: order });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// DELETE /api/production/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    await deleteProductionOrder(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "Work order deleted." });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/production/stats
export const getStats = async (req, res) => {
  try {
    const stats = await getProductionStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// POST /api/production/orders/:id/issue-material
export const issueMaterial = async (req, res) => {
  try {
    const result = await issueWorkOrderMaterial(
      req.params.id,
      req.body.items || [],
    );
    return res.status(200).json({
      success: true,
      message: "Materials issued to work order.",
      data: result,
    });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};
