
// FILE: backend/src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/authMiddleware');

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET all transactions
router.get('/', transactionController.getAllTransactions);

// CREATE new transaction
router.post('/', transactionController.createTransaction);

// UPDATE transaction
router.put('/:id', transactionController.updateTransaction);

// DELETE transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;