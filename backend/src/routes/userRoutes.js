// ============================================
// FILE: backend/src/routes/userRoutes.js
// ============================================
const express = require('express');
const router = express.Router();

// Controller
const userController = require('../controllers/userController');

// Middleware baru: export langsung sebagai function
const authenticateToken = require('../middleware/authMiddleware');

// GET user by ID (protected route)
router.get('/:id', authenticateToken, userController.getUserById);

// UPDATE user profile (protected route)
router.put('/:id', authenticateToken, userController.updateUser);

// DELETE user (protected route)
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
