// ============================================
// FILE: backend/src/controllers/userController.js
// ============================================
const pool = require('../config/db');

// GET user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id, name, email, username, balance, 
        total_income, total_expense, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data user',
      error: error.message
    });
  }
};

// UPDATE user profile
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body;

    const query = `
      UPDATE users
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        username = COALESCE($3, username),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, username, balance, total_income, total_expense
    `;

    const result = await pool.query(query, [name, email, username, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate profile',
      error: error.message
    });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, name, email';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'User berhasil dihapus',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus user',
      error: error.message
    });
  }
};

// Export semua fungsi controller
module.exports = {
  getUserById,
  updateUser,
  deleteUser
};