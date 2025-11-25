const pool = require("../config/db");

/**
 * GET ALL CATEGORIES
 * Endpoint: GET /api/categories?type=expense
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { type } = req.query;

    let query = "SELECT * FROM categories";
    const params = [];

    // Filter by type if provided
    if (type && (type === "income" || type === "expense")) {
      query += " WHERE type = $1";
      params.push(type);
    }

    query += " ORDER BY name ASC";

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil kategori",
      error: error.message,
    });
  }
};

/**
 * GET CATEGORY BY ID
 * Endpoint: GET /api/categories/:id
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil kategori",
      error: error.message,
    });
  }
};

/**
 * CREATE CATEGORY
 * Endpoint: POST /api/categories
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    // Validasi
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "name dan type wajib diisi",
      });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        success: false,
        message: "type harus 'income' atau 'expense'",
      });
    }

    // Cek duplikat
    const checkDuplicate = await pool.query(
      "SELECT * FROM categories WHERE name = $1 AND type = $2",
      [name, type]
    );

    if (checkDuplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Kategori dengan nama dan type ini sudah ada",
      });
    }

    // Insert category
    const result = await pool.query(
      `INSERT INTO categories (name, type, icon, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, type, icon || null, color || null]
    );

    console.log(`✅ Category created: ${name} (${type})`);

    res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan kategori",
      error: error.message,
    });
  }
};

/**
 * UPDATE CATEGORY
 * Endpoint: PUT /api/categories/:id
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    // Cek apakah kategori ada
    const checkResult = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Validasi type jika diubah
    if (type && type !== "income" && type !== "expense") {
      return res.status(400).json({
        success: false,
        message: "type harus 'income' atau 'expense'",
      });
    }

    // Update category
    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           icon = COALESCE($3, icon),
           color = COALESCE($4, color)
       WHERE id = $5
       RETURNING *`,
      [name, type, icon, color, id]
    );

    console.log(`✅ Category updated: ${id}`);

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diupdate",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate kategori",
      error: error.message,
    });
  }
};

/**
 * DELETE CATEGORY
 * Endpoint: DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah kategori ada
    const checkResult = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek apakah kategori masih digunakan
    const usageCheck = await pool.query(
      "SELECT COUNT(*) FROM transactions WHERE category = $1",
      [checkResult.rows[0].name]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori tidak dapat dihapus karena masih digunakan dalam transaksi",
      });
    }

    // Delete category
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);

    console.log(`✅ Category deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus kategori",
      error: error.message,
    });
  }
};