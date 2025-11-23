const pool = require('../config/db');

exports.getAllByUser = async (userId) => {
  const q = 'SELECT * FROM transactions WHERE user_id=$1 ORDER BY date DESC, id DESC';
  const { rows } = await pool.query(q, [userId]);
  return rows;
};

exports.getById = async (id, userId) => {
  const q = 'SELECT * FROM transactions WHERE id=$1 AND user_id=$2';
  const { rows } = await pool.query(q, [id, userId]);
  return rows[0];
};

exports.create = async (payload, userId) => {
  const q = `INSERT INTO transactions (title, amount, type, category, description, date, user_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const values = [payload.title || '', payload.amount, payload.type, payload.category, payload.description || null, payload.date || new Date(), userId];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

exports.update = async (id, payload, userId) => {
  const q = `UPDATE transactions SET title=$1, amount=$2, type=$3, category=$4, description=$5, date=$6
             WHERE id=$7 AND user_id=$8 RETURNING *`;
  const values = [payload.title, payload.amount, payload.type, payload.category, payload.description, payload.date || new Date(), id, userId];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

exports.remove = async (id, userId) => {
  const q = 'DELETE FROM transactions WHERE id=$1 AND user_id=$2';
  await pool.query(q, [id, userId]);
  return true;
};
