const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const { authenticateUser } = require("../middlewares/authorizedUser");

// Public routes (no authentication required)
router.get("/products", foodController.getAllProducts);
router.get("/products/:id", foodController.getProductById);
router.get("/categories", foodController.getAllCategories);
router.get("/categories/:id", foodController.getCategoryById);

// Protected routes (authentication required)
router.post("/products/:id/review", authenticateUser, foodController.addProductReview);
router.post("/products/:id/favorite", authenticateUser, foodController.toggleFavorite);
router.get("/favorites", authenticateUser, foodController.getUserFavorites);

module.exports = router; 