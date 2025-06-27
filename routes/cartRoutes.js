const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticateUser } = require("../middlewares/authorizedUser");

// All cart routes require authentication
router.use(authenticateUser);

// Test authentication
router.get("/test", cartController.testAuth);

// Get user's cart
router.get("/", cartController.getCart);

// Add item to cart
router.post("/add", cartController.addToCart);

// Update cart item quantity
router.put("/update", cartController.updateCartItem);

// Remove item from cart
router.delete("/remove/:productId", cartController.removeFromCart);

// Clear cart
router.delete("/clear", cartController.clearCart);

module.exports = router; 