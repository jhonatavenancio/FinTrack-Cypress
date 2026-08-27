const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches the `amount NUMERIC(12, 2)` column: at most 10 digits before the
// decimal point. Enforcing this in application-level validation (rather
// than letting an out-of-range value hit Postgres) means an oversized
// amount comes back as a clean 400 instead of an unhandled "numeric field
// overflow" DB error bubbling up as a 500.
const MAX_AMOUNT = 9999999999.99;

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_NAME_LENGTH = 100;

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const isUUID = (v) => typeof v === 'string' && UUID_RE.test(v);

const isHexColor = (v) => typeof v === 'string' && HEX_COLOR_RE.test(v);

const isDateString = (v) => {
  if (typeof v !== 'string' || !DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
};

const isEmail = (v) => typeof v === 'string' && EMAIL_RE.test(v);

const isCategoryType = (v) => v === 'income' || v === 'expense';

/**
 * Validates that `v` is a positive monetary amount with at most 2 decimal
 * places, accepting either a number or a numeric string (form inputs,
 * JSON numbers that arrived as strings, etc). Returns a normalized string
 * suitable for a NUMERIC(12,2) column, or null if invalid.
 */
const parsePositiveAmount = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'number' && typeof v !== 'string') return null;
  const str = typeof v === 'number' ? String(v) : v.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(str)) return null;
  const num = Number(str);
  if (!Number.isFinite(num) || num <= 0 || num > MAX_AMOUNT) return null;
  return num.toFixed(2);
};

module.exports = {
  isNonEmptyString,
  isUUID,
  isHexColor,
  isDateString,
  isEmail,
  isCategoryType,
  parsePositiveAmount,
  MAX_AMOUNT,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
};
