// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL: null value violation
  if (err.code === '23502') {
    return res.status(400).json({
      success: false,
      message: `Field "${err.column}" tidak boleh kosong`,
      detail: err.detail
    });
  }

  // PostgreSQL: unique violation (duplicate key)
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: `Duplicate value: ${err.detail}`,
    });
  }

  // Validation error (custom throw)
  if (err.message && err.message.toLowerCase().includes('required')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Not found error
  if (err.message === 'Transaction not found') {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
