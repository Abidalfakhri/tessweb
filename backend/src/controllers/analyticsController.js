// src/controllers/analyticsController.js
const pool = require('../config/db');

class AnalyticsController {
  // ============================================
  // GET EXPENSES BY CATEGORY
  // ============================================
  async getExpensesByCategory(req, res) {
    try {
      const userId = req.params.userId || req.user.id || req.user.userId;
      const authenticatedUserId = req.user.id || req.user.userId;

      // Verify user can only access their own data
      if (parseInt(userId) !== parseInt(authenticatedUserId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      console.log(`📊 Fetching expenses by category for user ${userId}`);

      const result = await pool.query(
        `SELECT category, SUM(amount) as total, COUNT(*) as count
         FROM transactions
         WHERE user_id = $1 AND type = 'expense'
         GROUP BY category
         ORDER BY total DESC`,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows.map(row => ({
          category: row.category,
          total: parseFloat(row.total),
          count: parseInt(row.count)
        }))
      });
    } catch (err) {
      console.error('❌ Error in getExpensesByCategory:', err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data kategori',
        error: err.message
      });
    }
  }

  // ============================================
  // GET WEEKLY TREND
  // ============================================
  async getWeeklyTrend(req, res) {
    try {
      const userId = req.params.userId || req.user.id || req.user.userId;
      const authenticatedUserId = req.user.id || req.user.userId;

      // Verify user can only access their own data
      if (parseInt(userId) !== parseInt(authenticatedUserId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      console.log(`📊 Fetching weekly trend for user ${userId}`);

      // Get last 7 days of data
      const result = await pool.query(
        `SELECT 
          DATE(date) as day,
          TO_CHAR(date, 'Dy') as day_name,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
         FROM transactions
         WHERE user_id = $1 
           AND date >= CURRENT_DATE - INTERVAL '6 days'
           AND date <= CURRENT_DATE
         GROUP BY DATE(date), TO_CHAR(date, 'Dy')
         ORDER BY day ASC`,
        [userId]
      );

      // Create array for all 7 days (even if no data)
      const today = new Date();
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const weekData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayIndex = date.getDay();
        
        const existingData = result.rows.find(row => {
          const rowDate = new Date(row.day);
          return rowDate.toDateString() === date.toDateString();
        });

        weekData.push({
          day: days[dayIndex],
          income: existingData ? parseFloat(existingData.income) : 0,
          expense: existingData ? parseFloat(existingData.expense) : 0
        });
      }

      res.json({
        success: true,
        data: weekData
      });
    } catch (err) {
      console.error('❌ Error in getWeeklyTrend:', err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data trend',
        error: err.message
      });
    }
  }

  // ============================================
  // GET MONTHLY SUMMARY
  // ============================================
  async getMonthlySummary(req, res) {
    try {
      const userId = req.user.id || req.user.userId;
      const { month, year } = req.query;

      const currentDate = new Date();
      const targetMonth = month || (currentDate.getMonth() + 1);
      const targetYear = year || currentDate.getFullYear();

      console.log(`📊 Fetching monthly summary for user ${userId} - ${targetYear}/${targetMonth}`);

      const result = await pool.query(
        `SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(*) as total_transactions
         FROM transactions
         WHERE user_id = $1 
           AND EXTRACT(MONTH FROM date) = $2
           AND EXTRACT(YEAR FROM date) = $3`,
        [userId, targetMonth, targetYear]
      );

      const summary = result.rows[0];
      const totalIncome = parseFloat(summary.total_income) || 0;
      const totalExpense = parseFloat(summary.total_expense) || 0;
      const balance = totalIncome - totalExpense;

      res.json({
        success: true,
        data: {
          month: parseInt(targetMonth),
          year: parseInt(targetYear),
          total_income: totalIncome,
          total_expense: totalExpense,
          balance: balance,
          total_transactions: parseInt(summary.total_transactions)
        }
      });
    } catch (err) {
      console.error('❌ Error in getMonthlySummary:', err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil ringkasan bulanan',
        error: err.message
      });
    }
  }

  // ============================================
  // GET INCOME BY CATEGORY
  // ============================================
  async getIncomeByCategory(req, res) {
    try {
      const userId = req.params.userId || req.user.id || req.user.userId;
      const authenticatedUserId = req.user.id || req.user.userId;

      // Verify user can only access their own data
      if (parseInt(userId) !== parseInt(authenticatedUserId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      console.log(`📊 Fetching income by category for user ${userId}`);

      const result = await pool.query(
        `SELECT category, SUM(amount) as total, COUNT(*) as count
         FROM transactions
         WHERE user_id = $1 AND type = 'income'
         GROUP BY category
         ORDER BY total DESC`,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows.map(row => ({
          category: row.category,
          total: parseFloat(row.total),
          count: parseInt(row.count)
        }))
      });
    } catch (err) {
      console.error('❌ Error in getIncomeByCategory:', err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data kategori pemasukan',
        error: err.message
      });
    }
  }

  // ============================================
  // GET SPENDING TREND (Last 6 months)
  // ============================================
  async getSpendingTrend(req, res) {
    try {
      const userId = req.user.id || req.user.userId;

      console.log(`📊 Fetching spending trend for user ${userId}`);

      const result = await pool.query(
        `SELECT 
          TO_CHAR(date, 'YYYY-MM') as month,
          TO_CHAR(date, 'Mon') as month_name,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
         FROM transactions
         WHERE user_id = $1 
           AND date >= CURRENT_DATE - INTERVAL '6 months'
         GROUP BY TO_CHAR(date, 'YYYY-MM'), TO_CHAR(date, 'Mon')
         ORDER BY month ASC`,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows.map(row => ({
          month: row.month,
          month_name: row.month_name,
          income: parseFloat(row.income),
          expense: parseFloat(row.expense),
          net: parseFloat(row.income) - parseFloat(row.expense)
        }))
      });
    } catch (err) {
      console.error('❌ Error in getSpendingTrend:', err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data trend pengeluaran',
        error: err.message
      });
    }
  }
}

module.exports = new AnalyticsController();