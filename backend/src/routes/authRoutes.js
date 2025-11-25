// ============================================
// FILE: backend/src/routes/authRoutes.js
// ============================================
const express = require("express");
const router = express.Router();

// Controller
const authController = require("../controllers/authController");

// Middleware baru: export langsung sebagai function
const authenticateToken = require("../middleware/authMiddleware");

// Register (Public)
router.post("/register", authController.register);

// Login (Public)
router.post("/login", authController.login);

// Profile (Protected)
router.get("/profile", authenticateToken, authController.getProfile);

module.exports = router;
