const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  isNonEmptyString,
  isUUID,
  isHexColor,
  isCategoryType,
  MAX_NAME_LENGTH,
} = require('../utils/validation');

const DEFAULT_COLOR = '#6366f1';

const list = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, user_id, name, type, color, created_at
     FROM categories
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [req.userId]
  );
  res.json({ categories: result.rows });
});

const create = asyncHandler(async (req, res) => {
  const { name, type, color } = req.body || {};

  const errors = {};
  if (!isNonEmptyString(name)) {
    errors.name = 'name is required';
  } else if (name.trim().length > MAX_NAME_LENGTH) {
    errors.name = `name must be at most ${MAX_NAME_LENGTH} characters`;
  }
  if (!isCategoryType(type)) errors.type = "type must be 'income' or 'expense'";
  if (color !== undefined && !isHexColor(color)) {
    errors.color = 'color must be a hex string like #RRGGBB';
  }
  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid category data', 400, errors);
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type, color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, type, color, created_at`,
      [req.userId, name.trim(), type, color || DEFAULT_COLOR]
    );
    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('You already have a category with this name', 409);
    }
    throw err;
  }
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isUUID(id)) throw new AppError('Invalid category id', 400);

  const { name, type, color } = req.body || {};

  const errors = {};
  if (name !== undefined && !isNonEmptyString(name)) {
    errors.name = 'name must be a non-empty string';
  } else if (name !== undefined && name.trim().length > MAX_NAME_LENGTH) {
    errors.name = `name must be at most ${MAX_NAME_LENGTH} characters`;
  }
  if (type !== undefined && !isCategoryType(type)) {
    errors.type = "type must be 'income' or 'expense'";
  }
  if (color !== undefined && !isHexColor(color)) {
    errors.color = 'color must be a hex string like #RRGGBB';
  }
  if (name === undefined && type === undefined && color === undefined) {
    errors._ = 'at least one of name, type, color must be provided';
  }
  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid category data', 400, errors);
  }

  try {
    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           color = COALESCE($3, color)
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, name, type, color, created_at`,
      [
        name !== undefined ? name.trim() : null,
        type !== undefined ? type : null,
        color !== undefined ? color : null,
        id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    res.json({ category: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('You already have a category with this name', 409);
    }
    throw err;
  }
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isUUID(id)) throw new AppError('Invalid category id', 400);

  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    res.status(204).send();
  } catch (err) {
    if (err.code === '23503') {
      throw new AppError(
        'Cannot delete category: it is used by existing transactions',
        409
      );
    }
    throw err;
  }
});

module.exports = { list, create, update, remove };
