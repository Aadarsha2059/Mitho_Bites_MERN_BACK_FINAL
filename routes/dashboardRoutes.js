const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/latest-additions', dashboardController.getLatestAdditions);

module.exports = router; 