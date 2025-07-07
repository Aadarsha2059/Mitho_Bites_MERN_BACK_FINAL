const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/admin/paymentmethodmanagement");
const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUser");

// Apply authentication middleware to all routes
router.use(authenticateUser);
router.use(isAdmin);

// POST /api/admin/paymentmethod - Create a new payment method
router.post("/", paymentController.createPaymentMethod);

// GET /api/admin/paymentmethod - Get all payment methods (with optional pagination and search)
router.get("/", paymentController.getPaymentMethods);

// GET /api/admin/paymentmethod/stats - Get transaction statistics
router.get("/stats", paymentController.getTransactionStats);

// GET /api/admin/paymentmethod/:id - Get one payment method
router.get("/:id", paymentController.getOnePaymentMethod);

// PUT /api/admin/paymentmethod/:id - Update payment method
router.put("/:id", paymentController.updatePaymentMethod);

// DELETE /api/admin/paymentmethod/:id - Delete payment method
router.delete("/:id", paymentController.deletePaymentMethod);

module.exports = router; 