const pool = require('../config/db');

exports.summary = async (req, res) => {
  const { rows: incomeR } = await pool.query(`SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='income'`);
  const { rows: expenseR } = await pool.query(`SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='expense'`);
  const income = Number(incomeR[0].total);
  const expense = Number(expenseR[0].total);
  return res.json({ income, expense, balance: income - expense });
};

exports.cashflow = async (req, res) => {
  const { rows } = await pool.query(`SELECT date, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
                                           SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
                                    FROM transactions
                                    GROUP BY date ORDER BY date`);
  return res.json(rows);
};

exports.categorySummary = async (req, res) => {
  const { rows } = await pool.query(`SELECT c.name, c.type, COALESCE(SUM(t.amount),0) AS value, c.target
                                     FROM categories c
                                     LEFT JOIN transactions t ON t.category = c.name
                                     GROUP BY c.id ORDER BY value DESC`);
  return res.json(rows);
};

exports.financialPosition = async (req, res) => {
  return res.json({ aset: 38000000, liabilitas: 12000000 });
};

exports.compare = async (req, res) => {
  // budget vs actual for expense categories
  const { rows } = await pool.query(`SELECT c.name as category, c.target as budget, COALESCE(SUM(t.amount),0) as actual
                                     FROM categories c
                                     LEFT JOIN transactions t ON t.category = c.name
                                     WHERE c.type='expense'
                                     GROUP BY c.id`);
  return res.json(rows);
};

exports.radar = async (req, res) => {
  return res.json([
    { subject: "Tabungan", A: 80 },
    { subject: "Hutang", A: 60 },
    { subject: "Efisiensi", A: 75 },
    { subject: "Investasi", A: 70 },
    { subject: "Diversifikasi", A: 65 },
  ]);
};
