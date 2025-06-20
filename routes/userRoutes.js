const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUser } = require("../controllers/userController");
const validateUser = require("../middlewares/validateUser");

// Register new user with validation
router.post("/register", validateUser, registerUser);

// Login user 
router.post("/login", loginUser);

// Update user info with validation
// Assuming you use :id to identify which user to update
router.put("/update/:id", validateUser, updateUser);

// router.post("/request-reset",sendResentLink)
// router.post("/reset-password/:token",resetPassword)

module.exports = router;