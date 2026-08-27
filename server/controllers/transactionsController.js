const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  isUUID,
  isDateString,
  parsePositiveAmount,
  MAX_DESCRIPTION_LENGTH,
} = require('../utils/validation');

const SELECT_FIELDS = `
  t.id, t.user_id, t.category_id, t.amount, t.description,
  t.occurred_at, t.created_at,
  c.name  AS category_name,
  c.type  AS category_type,
  c.color AS category_color
`;

async function categoryBelongsToUser(categoryId, userId) {
  const result = await pool.query(
    'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
    [categoryId, userId]
  );
  return result.rows.length > 0;
}

const list = asyncHandler(async (req, res) => {
  const { category_id: categoryId, from, to } = req.query;

  const errors = {};
  if (categoryId !== undefined && !isUUID(categoryId)) {
    errors.category_id = 'category_id must be a valid UUID';
  }
  if (from !== undefined && !isDateString(from)) {
    errors.from = 'from must be a date in YYYY-MM-DD format';
  }
  if (to !== undefined && !isDateString(to)) {
    errors.to = 'to must be a date in YYYY-MM-DD format';
  }
  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid filter parameters', 400, errors);
  }

  const conditions = ['t.user_id = $1'];
  const params = [req.userId];

  if (categoryId !== undefined) {
    params.push(categoryId);
    conditions.push(`t.category_id = $${params.length}`);
  }
  if (from !== undefined) {
    params.push(from);
    conditions.push(`t.occurred_at >= $${params.length}`);
  }
  if (to !== undefined) {
    params.push(to);
    conditions.push(`t.occurred_at <= $${params.length}`);
  }

  const result = await pool.query(
    `SELECT ${SELECT_FIELDS}
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.occurred_at DESC, t.created_at DESC`,
    params
  );

  res.json({ transactions: result.rows });
});

const create = asyncHandler(async (req, res) => {
  const { category_id: categoryId, amount, description, occurred_at: occurredAt } =
    req.body || {};

  const errors = {};
  if (!isUUID(categoryId)) errors.category_id = 'category_id is required and must be a valid UUID';
  const normalizedAmount = parsePositiveAmount(amount);
  if (normalizedAmount === null) {
    errors.amount = 'amount is required and must be a positive number with up to 2 decimal places';
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.description = 'description must be a string';
  } else if (
    typeof description === 'string' &&
    description.length > MAX_DESCRIPTION_LENGTH
  ) {
    errors.description = `description must be at most ${MAX_DESCRIPTION_LENGTH} characters`;
  }
  if (occurredAt !== undefined && !isDateString(occurredAt)) {
    errors.occurred_at = 'occurred_at must be a date in YYYY-MM-DD format';
  }
  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid transaction data', 400, errors);
  }

  if (!(await categoryBelongsToUser(categoryId, req.userId))) {
    throw new AppError('category_id does not refer to one of your categories', 400);
  }

  const result = await pool.query(
    `INSERT INTO transactions (user_id, category_id, amount, description, occurred_at)
     VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
     RETURNING id, user_id, category_id, amount, description, occurred_at, created_at`,
    [req.userId, categoryId, normalizedAmount, description || null, occurredAt || null]
  );

  res.status(201).json({ transaction: result.rows[0] });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isUUID(id)) throw new AppError('Invalid transaction id', 400);

  const { category_id: categoryId, amount, description, occurred_at: occurredAt } =
    req.body || {};

  const errors = {};
  if (categoryId !== undefined && !isUUID(categoryId)) {
    errors.category_id = 'category_id must be a valid UUID';
  }
  let normalizedAmount = null;
  if (amount !== undefined) {
    normalizedAmount = parsePositiveAmount(amount);
    if (normalizedAmount === null) {
      errors.amount = 'amount must be a positive number with up to 2 decimal places';
    }
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.description = 'description must be a string';
  } else if (
    typeof description === 'string' &&
    description.length > MAX_DESCRIPTION_LENGTH
  ) {
    errors.description = `description must be at most ${MAX_DESCRIPTION_LENGTH} characters`;
  }
  if (occurredAt !== undefined && !isDateString(occurredAt)) {
    errors.occurred_at = 'occurred_at must be a date in YYYY-MM-DD format';
  }
  if (
    categoryId === undefined &&
    amount === undefined &&
    description === undefined &&
    occurredAt === undefined
  ) {
    errors._ = 'at least one field must be provided';
  }
  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid transaction data', 400, errors);
  }

  if (categoryId !== undefined && !(await categoryBelongsToUser(categoryId, req.userId))) {
    throw new AppError('category_id does not refer to one of your categories', 400);
  }

  const result = await pool.query(
    `UPDATE transactions
     SET category_id = COALESCE($1, category_id),
         amount      = COALESCE($2, amount),
         description = CASE WHEN $3 THEN $4 ELSE description END,
         occurred_at = COALESCE($5, occurred_at)
     WHERE id = $6 AND user_id = $7
     RETURNING id, user_id, category_id, amount, description, occurred_at, created_at`,
    [
      categoryId !== undefined ? categoryId : null,
      normalizedAmount,
      description !== undefined, // whether to overwrite description at all
      description !== undefined ? description : null,
      occurredAt !== undefined ? occurredAt : null,
      id,
      req.userId,
    ]
  );

  if (result.rows.length === 0) {
    throw new AppError('Transaction not found', 404);
  }

  res.json({ transaction: result.rows[0] });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isUUID(id)) throw new AppError('Invalid transaction id', 400);

  const result = await pool.query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Transaction not found', 404);
  }

  res.status(204).send();
});

module.exports = { list, create, update, remove };
