/**
 * Operational error carrying an HTTP status code.
 * Thrown/passed-to-next anywhere a request should fail with a clear,
 * client-safe message (validation, auth, not found, conflict, ...).
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, AppError);
  }
}

module.exports = AppError;
