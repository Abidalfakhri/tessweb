// src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET expenses by category for specific user
router.get('/expenses-by-category/:userId', analyticsController.getExpensesByCategory);

// GET income by category for specific user
router.get('/income-by-category/:userId', analyticsController.getIncomeByCategory);

// GET weekly trend for specific user
router.get('/weekly-trend/:userId', analyticsController.getWeeklyTrend);

// GET monthly summary
router.get('/monthly-summary', analyticsController.getMonthlySummary);

// GET spending trend (last 6 months)
router.get('/spending-trend', analyticsController.getSpendingTrend);

module.exports = router;