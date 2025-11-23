const pool = require('../config/db');

exports.findByUsername = async (username) => {
  const q = 'SELECT id, username, password_hash FROM users WHERE username=$1';
  const { rows } = await pool.query(q, [username]);
  return rows[0];
};

exports.create = async (username, password_hash) => {
  const q = 'INSERT INTO users (username, password_hash) VALUES ($1,$2) RETURNING id, username';
  const { rows } = await pool.query(q, [username, password_hash]);
  return rows[0];
};
