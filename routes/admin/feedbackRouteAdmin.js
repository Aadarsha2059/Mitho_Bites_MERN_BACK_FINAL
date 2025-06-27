const express = require("express");
const router = express.Router();
const feedbackController = require("../../controllers/admin/feedbackmanagement");

// POST /api/admin/feedback - Create a new feedback
router.post("/", feedbackController.createFeedback);

// GET /api/admin/feedback - Get all feedbacks (with optional pagination and search)
router.get("/", feedbackController.getFeedbacks);

// GET /api/admin/feedback/:id - Get one feedback by ID
router.get("/:id", feedbackController.getOneFeedback);

// PUT /api/admin/feedback/:id - Update feedback
router.put("/:id", feedbackController.updateFeedback);

// DELETE /api/admin/feedback/:id - Delete feedback
router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router; 