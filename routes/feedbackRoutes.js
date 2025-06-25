const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateUser } = require('../middlewares/authorizedUser');

// Create feedback (user must be logged in)
router.post('/', authenticateUser, feedbackController.createFeedback);

// Get feedbacks for a product
router.get('/product/:productId', feedbackController.getFeedbacksByProduct);

// Get feedbacks by the logged-in user
router.get('/user', authenticateUser, feedbackController.getUserFeedbacks);

module.exports = router; 