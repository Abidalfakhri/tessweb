// ============================================
// FILE: backend/src/routes/categoryRoutes.js
// ============================================
const express = require("express");
const router = express.Router();

// Controller
const categoryController = require("../controllers/categoryController");

// Middleware baru: export langsung sebagai function
const authenticateToken = require("../middleware/authMiddleware");

// GET all categories
router.get("/", authenticateToken, categoryController.getAllCategories);

// GET category by ID
router.get("/:id", authenticateToken, categoryController.getCategoryById);

// POST new category
router.post("/", authenticateToken, categoryController.createCategory);

// PUT update category
router.put("/:id", authenticateToken, categoryController.updateCategory);

// DELETE category
router.delete("/:id", authenticateToken, categoryController.deleteCategory);

module.exports = router;
