const express = require("express");
const router = express.Router();
const restaurantController = require("../../controllers/admin/restaurantmanagement");
const upload = require("../../middlewares/fileupload");

// Create a new restaurant (with optional image upload)
router.post(
    '/',
    upload.single("image"), // Handles file upload from field named "image"
    restaurantController.createRestaurant
);

// Get all restaurants (with pagination and search support)
router.get(
    '/',
    restaurantController.getRestaurants
);

module.exports = router;
