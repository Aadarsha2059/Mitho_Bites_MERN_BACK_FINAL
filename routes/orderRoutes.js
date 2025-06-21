const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticateUser } = require("../middlewares/authorizedUser");

// All order routes require authentication
router.use(authenticateUser);

// Create order from cart
router.post("/", orderController.createOrder);

// Get user's orders
router.get("/", orderController.getUserOrders);

// Get single order
router.get("/:id", orderController.getOrderById);

// Cancel order
router.put("/:id/cancel", orderController.cancelOrder);

// Update payment status (admin only - you can add admin middleware here)
router.put("/:id/payment", orderController.updatePaymentStatus);

module.exports = router; 