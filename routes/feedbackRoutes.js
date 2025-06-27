const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedbacks, getFeedbacksByProduct, getUserFeedbacks } = require('../controllers/feedbackController');
const { authenticateUser } = require('../middlewares/authorizedUser');

// POST /api/feedbacks - Create new feedback
router.post('/', createFeedback);

// GET /api/feedbacks - Get all feedbacks
router.get('/', getAllFeedbacks);

// Get feedbacks for a product
router.get('/product/:productId', getFeedbacksByProduct);

// Get feedbacks by the logged-in user
router.get('/user', authenticateUser, getUserFeedbacks);

module.exports = router; 