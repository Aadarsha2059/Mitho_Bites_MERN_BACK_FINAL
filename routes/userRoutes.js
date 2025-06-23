const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUser, sendResetLink, resetPassword } = require("../controllers/userController");
const validateUser = require("../middlewares/validateUser");

// Register new user with validation
router.post("/register", validateUser, registerUser);

// Login user 
router.post("/login", loginUser);

// Update user info with validation
// Assuming you use :id to identify which user to update
router.put("/update/:id", validateUser, updateUser);

// Forgot password - send reset link
router.post("/forgot-password", sendResetLink);

// Reset password with token
router.post("/reset-password/:token", resetPassword);



module.exports = router;