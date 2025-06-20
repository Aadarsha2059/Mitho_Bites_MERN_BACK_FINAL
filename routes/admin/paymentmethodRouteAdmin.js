const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/admin/paymentmethodmanagement");

// POST /api/admin/paymentmethod - Create a new payment method
router.post("/", paymentController.createPaymentMethod);

// GET /api/admin/paymentmethod - Get all payment methods (with optional pagination and search)
router.get("/", paymentController.getPaymentMethods);

module.exports = router; 