const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isNonEmptyString, isEmail } = require('../utils/validation');

const BCRYPT_COST = 12;
const TOKEN_EXPIRY = '24h';
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores bytes beyond 72; reject rather than silently truncate
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 max mailbox length

// A precomputed bcrypt hash (of a random, unknown value - not a real
// account's password) used to run a dummy bcrypt.compare() when a login
// email doesn't exist. This keeps the response time for "no such user"
// close to the "wrong password" case so response timing can't be used to
// enumerate registered emails.
const DUMMY_HASH =
  '$2a$12$MstNdVlBJoiojwAPqBCFye39RcYegSext72TmGO4TIcqZta6yQAiO';

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('Server misconfiguration: JWT_SECRET is not set', 500);
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn: TOKEN_EXPIRY });
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    created_at: row.created_at,
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  const errors = {};
  if (!isNonEmptyString(name)) {
    errors.name = 'name is required';
  } else if (name.trim().length > MAX_NAME_LENGTH) {
    errors.name = `name must be at most ${MAX_NAME_LENGTH} characters`;
  }
  if (!isNonEmptyString(email) || !isEmail(email)) {
    errors.email = 'a valid email is required';
  } else if (email.trim().length > MAX_EMAIL_LENGTH) {
    errors.email = `email must be at most ${MAX_EMAIL_LENGTH} characters`;
  }
  if (!isNonEmptyString(password)) {
    errors.password = 'password is required';
  } else if (password.length < 8) {
    errors.password = 'password must be at least 8 characters';
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `password must be at most ${MAX_PASSWORD_LENGTH} characters`;
  } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'password must contain at least one letter and one number';
  }
  if (Object.keys(errors).length > 0) {
    throw new AppError('Invalid registration data', 400, errors);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = $1',
    [normalizedEmail]
  );
  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken(user.id);

  res.status(201).json({ token, user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new AppError('email and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE LOWER(email) = $1',
    [normalizedEmail]
  );
  const user = result.rows[0];

  // Use a generic message for both "no such user" and "wrong password" so
  // the response never reveals whether an email is registered. Also always
  // run a bcrypt.compare - against a dummy hash when there's no matching
  // user - so the two cases take comparable time and timing can't be used
  // to enumerate registered emails.
  const passwordMatches = await bcrypt.compare(
    password,
    user ? user.password_hash : DUMMY_HASH
  );
  if (!user || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user.id);

  res.json({ token, user: publicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [req.userId]
  );
  const user = result.rows[0];
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json({ user: publicUser(user) });
});

module.exports = { register, login, me };
