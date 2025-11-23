const pool = require('../config/db');

exports.getAll = async () => {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY id');
  return rows;
};
