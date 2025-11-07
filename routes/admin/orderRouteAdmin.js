const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/admin/ordermanagement");

// POST /api/admin/order - Create a new order
router.post("/", orderController.createOrder);

// GET /api/admin/order - Get all orders (with optional pagination and search)
router.get("/", orderController.getOrders);

// GET /api/admin/order/:id - Get one order by ID
router.get('/:id', orderController.getOrderById);

module.exports = router;
