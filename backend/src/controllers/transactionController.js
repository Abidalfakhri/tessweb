// FILE: backend/src/controllers/transactionController.js
const transactionService = require('../services/transactionService');

/**
 * GET all transactions for a user
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { userId, limit } = req.query;
    // Prioritaskan ID dari token, jika admin mungkin bisa pakai query param
    const userIdToUse = req.user?.userId || req.user?.id || userId;

    if (!userIdToUse) {
      return res.status(400).json({
        success: false,
        message: 'User ID tidak ditemukan dalam token'
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
 * (PERBAIKAN UTAMA ADA DISINI)
 */
exports.createTransaction = async (req, res) => {
  try {
    // 1. Ambil User ID dari Token (req.user diset oleh authMiddleware)
    const userIdFromToken = req.user?.userId || req.user?.id;

    if (!userIdFromToken) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID tidak ditemukan dalam token'
      });
    }

    // 2. Gabungkan user_id otomatis ke data yang dikirim frontend
    const transactionData = {
        ...req.body,
        user_id: userIdFromToken // 🟢 INI KUNCINYA: Otomatis isi user_id dari token
    };

    // Validasi manual field lain jika perlu (opsional, service biasanya handle ini)
    if (!transactionData.amount || !transactionData.category) {
        return res.status(400).json({
            success: false,
            message: 'Amount dan Category wajib diisi'
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
    
    // Ambil User ID dari token untuk memastikan user hanya mengedit data miliknya sendiri
    const userIdFromToken = req.user?.userId || req.user?.id;

    const transactionData = {
        ...req.body,
        user_id: userIdFromToken // Pastikan data tetap terikat ke user ini
    };

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
    // Idealnya service juga menerima userId untuk memastikan kepemilikan sebelum delete
    // const userId = req.user?.userId || req.user?.id; 

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