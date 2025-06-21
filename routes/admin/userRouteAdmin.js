const express = require("express");
const router = express.Router();
const {
  createUser,
  getOneUser,
  deleteOne,
  getUsers,
  updateOne,
} = require("../../controllers/admin/usermanagement");

const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUser");
const validateUser = require("../../middlewares/validateUser");

// Create a new user
router.post("/", validateUser, createUser);

// Get all users (protected route, admin only)
router.get("/", authenticateUser,
  //  isAdmin,
    getUsers);

// Get a single user by ID
router.get("/:id", getOneUser);

// Update a user by ID
router.put("/:id", validateUser, updateOne);

// Delete a user by ID
router.delete("/:id", deleteOne);

module.exports = router;

