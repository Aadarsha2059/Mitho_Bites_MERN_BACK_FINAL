const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticateUser } = require("../middlewares/authorizedUser");
const { optionalAuthGuard } = require("../middlewares/authGuard");

// ✅ Use optional auth - allows guest users
// router.use(authenticateUser);

// Test authentication
router.get("/test", optionalAuthGuard, cartController.testAuth);

// Get user's cart (optional auth for guest users)
router.get("/", optionalAuthGuard, cartController.getCart);

// Add item to cart (optional auth for guest users)
router.post("/add", optionalAuthGuard, cartController.addToCart);

// Update cart item quantity (optional auth)
router.put("/update", optionalAuthGuard, cartController.updateCartItem);

// Remove item from cart (optional auth)
router.delete("/remove/:productId", optionalAuthGuard, cartController.removeFromCart);

// Clear cart (optional auth)
router.delete("/clear", optionalAuthGuard, cartController.clearCart);

module.exports = router; 