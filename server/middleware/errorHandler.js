const AppError = require('../utils/AppError');

/**
 * Catches requests to unknown routes and forwards a 404 into the error
 * handler below, keeping the "not found" response shape consistent with
 * every other error.
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Centralized error handler. Never leaks stack traces or raw driver/
 * internal error messages to the client - only AppError instances (or a
 * small set of recognized, safe-to-translate error codes) produce a
 * message; everything else becomes a generic 500.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log the full error server-side for debugging.
  // eslint-disable-next-line no-console
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }

  // PostgreSQL error codes we can safely translate for the client.
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  if (err.code === '23503') {
    return res
      .status(409)
      .json({ error: 'Operation violates a related resource constraint' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Invalid field value' });
  }
  // Numeric field overflow (e.g. an amount too large for NUMERIC(12,2)).
  // Application-level validation should catch this before it ever reaches
  // Postgres, but this is a defense-in-depth backstop so it still comes
  // back as a clean 400 instead of an unhandled 500.
  if (err.code === '22003') {
    return res.status(400).json({ error: 'A numeric field value is out of range' });
  }

  // Anything else: never leak internals.
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
