const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/latest-additions', dashboardController.getLatestAdditions);
router.get('/business-metrics', dashboardController.getBusinessMetrics);
router.get('/business-trends', dashboardController.getBusinessTrends);
router.get('/debug-business-trends', dashboardController.debugBusinessTrends);
router.post('/mark-all-orders-paid', dashboardController.markAllOrdersPaid);

module.exports = router; 