const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Validates the `Authorization: Bearer <token>` header, verifies the JWT,
 * and attaches the authenticated user's id to `req.userId`.
 * Applied to every route except POST /api/auth/register and
 * POST /api/auth/login.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Missing or malformed Authorization header', 401));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError('Server misconfiguration: JWT_SECRET is not set', 500));
  }

  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      const message =
        err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      return next(new AppError(message, 401));
    }
    if (!payload || typeof payload.sub !== 'string') {
      return next(new AppError('Invalid token', 401));
    }
    req.userId = payload.sub;
    next();
  });
}

module.exports = authMiddleware;
