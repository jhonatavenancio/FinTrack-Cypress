const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(t.amount) FILTER (WHERE c.type = 'income'), 0)  AS total_income,
       COALESCE(SUM(t.amount) FILTER (WHERE c.type = 'expense'), 0) AS total_expense
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1`,
    [req.userId]
  );

  const totalIncome = Number(result.rows[0].total_income);
  const totalExpense = Number(result.rows[0].total_expense);

  res.json({
    total_income: totalIncome,
    total_expense: totalExpense,
    balance: Number((totalIncome - totalExpense).toFixed(2)),
  });
});

const byCategory = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT
       c.id    AS category_id,
       c.name  AS category_name,
       c.type  AS category_type,
       c.color AS category_color,
       COALESCE(SUM(t.amount), 0) AS total
     FROM categories c
     LEFT JOIN transactions t ON t.category_id = c.id AND t.user_id = c.user_id
     WHERE c.user_id = $1
     GROUP BY c.id, c.name, c.type, c.color
     HAVING COALESCE(SUM(t.amount), 0) > 0
     ORDER BY total DESC`,
    [req.userId]
  );

  const categories = result.rows.map((row) => ({
    category_id: row.category_id,
    category_name: row.category_name,
    category_type: row.category_type,
    category_color: row.category_color,
    total: Number(row.total),
  }));

  res.json({ categories });
});

module.exports = { summary, byCategory };
