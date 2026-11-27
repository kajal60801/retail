const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const requireAuth = require("../middleware/authMiddleware");

// Customer order creation is public, but the controller verifies shop status.
router.post("/", createOrder);

// Customer order history is public by mobile number.
router.get("/customer/:contactNumber", getCustomerOrders);
router.get("/:orderId", getOrderById);

// Shopkeeper-only order management.
router.get("/", requireAuth, getAllOrders);
router.put("/:orderId", requireAuth, updateOrderStatus);
router.delete("/:orderId", requireAuth, deleteOrder);

module.exports = router;
