const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/admin/cartmanagement");

// POST /api/admin/cart - Create a new cart item
router.post("/", cartController.createCart);

// GET /api/admin/cart - Get all cart items (with optional pagination and search)
router.get("/", cartController.getCarts);

// GET /api/admin/cart/:id - Get one cart item by ID
router.get("/:id", cartController.getOneCart);

// PUT /api/admin/cart/:id - Update cart item
router.put("/:id", cartController.updateCart);

// DELETE /api/admin/cart/:id - Delete cart item
router.delete("/:id", cartController.deleteCart);

module.exports = router; 