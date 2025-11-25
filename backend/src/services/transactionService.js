// ============================================
// FILE: backend/src/services/transactionService.js
// ============================================
const pool = require('../config/db');

/**
 * Recalculate dan update balance user berdasarkan semua transaksi
 * @param {number} userId - ID user yang akan diupdate
 */
async function updateUserBalance(userId) {
  try {
    const query = `
      UPDATE users u
      SET 
        total_income = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'income'
        ),
        total_expense = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'expense'
        ),
        balance = (
          SELECT COALESCE(
            SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 
            0
          )
          FROM transactions
          WHERE user_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING balance, total_income, total_expense
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rows.length > 0) {
      console.log(`✅ Balance updated for user ${userId}:`, result.rows[0]);
      return result.rows[0];
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error updating user balance:', error);
    throw error;
  }
}

/**
 * Get all transactions for a user
 */
async function getAllTransactions(userId, limit = null) {
  try {
    let query = `
      SELECT * FROM transactions 
      WHERE user_id = $1 
      ORDER BY date DESC, created_at DESC
    `;
    
    const params = [userId];
    
    if (limit) {
      query += ` LIMIT $2`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Create new transaction
 */
async function createTransaction(transactionData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { user_id, type, category, amount, date, description } = transactionData;

    // Validasi
    if (!type || !category || !amount || !date) {
      throw new Error('Field wajib tidak lengkap');
    }

    if (parseFloat(amount) <= 0) {
      throw new Error('Jumlah harus lebih dari 0');
    }

    // Insert transaction
    const insertQuery = `
      INSERT INTO transactions (user_id, type, category, amount, date, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      user_id,
      type,
      category.trim(),
      parseFloat(amount),
      date,
      description?.trim() || null
    ]);

    // Update user balance
    await client.query(`
      UPDATE users u
      SET 
        total_income = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'income'
        ),
        total_expense = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'expense'
        ),
        balance = (
          SELECT COALESCE(
            SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 
            0
          )
          FROM transactions
          WHERE user_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [user_id]);

    await client.query('COMMIT');

    console.log('✅ Transaction created and balance updated:', result.rows[0]);
    return result.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating transaction:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update existing transaction
 */
async function updateTransaction(transactionId, transactionData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { type, category, amount, date, description, user_id } = transactionData;

    // Validasi
    if (!type || !category || !amount || !date) {
      throw new Error('Field wajib tidak lengkap');
    }

    if (parseFloat(amount) <= 0) {
      throw new Error('Jumlah harus lebih dari 0');
    }

    // Update transaction
    const updateQuery = `
      UPDATE transactions
      SET type = $1, category = $2, amount = $3, date = $4, description = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      type,
      category.trim(),
      parseFloat(amount),
      date,
      description?.trim() || null,
      transactionId
    ]);

    if (result.rows.length === 0) {
      throw new Error('Transaksi tidak ditemukan');
    }

    // Update user balance
    const userIdToUpdate = user_id || result.rows[0].user_id;
    await client.query(`
      UPDATE users u
      SET 
        total_income = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'income'
        ),
        total_expense = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'expense'
        ),
        balance = (
          SELECT COALESCE(
            SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 
            0
          )
          FROM transactions
          WHERE user_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userIdToUpdate]);

    await client.query('COMMIT');

    console.log('✅ Transaction updated and balance recalculated:', result.rows[0]);
    return result.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating transaction:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete transaction
 */
async function deleteTransaction(transactionId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get transaction untuk ambil user_id
    const getQuery = 'SELECT user_id FROM transactions WHERE id = $1';
    const getResult = await client.query(getQuery, [transactionId]);

    if (getResult.rows.length === 0) {
      throw new Error('Transaksi tidak ditemukan');
    }

    const userId = getResult.rows[0].user_id;

    // Delete transaction
    const deleteQuery = 'DELETE FROM transactions WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [transactionId]);

    // Update user balance
    await client.query(`
      UPDATE users u
      SET 
        total_income = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'income'
        ),
        total_expense = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = $1 AND type = 'expense'
        ),
        balance = (
          SELECT COALESCE(
            SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 
            0
          )
          FROM transactions
          WHERE user_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);

    await client.query('COMMIT');

    console.log('✅ Transaction deleted and balance recalculated');
    return result.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting transaction:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  updateUserBalance,
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};