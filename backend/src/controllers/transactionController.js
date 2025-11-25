
// FILE: backend/src/controllers/transactionController.js
const transactionService = require('../services/transactionService');

/**
 * GET all transactions for a user
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { userId, limit } = req.query;
    const userIdToUse = userId || req.user?.userId || req.user?.id;

    if (!userIdToUse) {
      return res.status(400).json({
        success: false,
        message: 'User ID tidak ditemukan'
      });
    }

    const transactions = await transactionService.getAllTransactions(userIdToUse, limit);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('❌ Error in getAllTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data transaksi',
      error: error.message
    });
  }
};

/**
 * CREATE new transaction
 */
exports.createTransaction = async (req, res) => {
  try {
    const transactionData = req.body;

    // Validasi user_id
    if (!transactionData.user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID wajib diisi'
      });
    }

    const transaction = await transactionService.createTransaction(transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan',
      data: transaction
    });

  } catch (error) {
    console.error('❌ Error in createTransaction:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menambahkan transaksi'
    });
  }
};

/**
 * UPDATE existing transaction
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transactionData = req.body;

    const transaction = await transactionService.updateTransaction(id, transactionData);

    res.json({
      success: true,
      message: 'Transaksi berhasil diupdate',
      data: transaction
    });

  } catch (error) {
    console.error('❌ Error in updateTransaction:', error);
    
    if (error.message === 'Transaksi tidak ditemukan') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengupdate transaksi'
    });
  }
};

/**
 * DELETE transaction
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.deleteTransaction(id);

    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
      data: transaction
    });

  } catch (error) {
    console.error('❌ Error in deleteTransaction:', error);
    
    if (error.message === 'Transaksi tidak ditemukan') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Gagal menghapus transaksi'
    });
  }
};