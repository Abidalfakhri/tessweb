// models/UserModel.js
const pool = require('../config/db');

/**
 * Cari user berdasarkan username
 */
exports.findByUsername = async (username) => {
  const query = `SELECT * FROM users WHERE username = $1`;
  const { rows } = await pool.query(query, [username]);
  return rows[0];
};

/**
 * Cari user berdasarkan email
 */
exports.findByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

/**
 * Buat user baru
 */
exports.create = async ({ name, email, username, password, balance = 0, total_income = 0, total_expense = 0 }) => {
  const query = `
    INSERT INTO users (name, email, username, password, balance, total_income, total_expense)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`;
  
  const values = [name, email, username, password, balance, total_income, total_expense];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
