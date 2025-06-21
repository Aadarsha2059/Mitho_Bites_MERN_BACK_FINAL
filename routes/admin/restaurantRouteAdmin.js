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

// Get restaurant by ID
router.get(
    '/:id',
    restaurantController.getRestaurantById
);

// Update restaurant (with optional image upload)
router.put(
    '/:id',
    upload.single("image"),
    restaurantController.updateRestaurant
);

// Delete restaurant
router.delete(
    '/:id',
    restaurantController.deleteRestaurant
);

module.exports = router;
