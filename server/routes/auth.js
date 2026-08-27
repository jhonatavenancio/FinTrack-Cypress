const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { register, login, me } = require('../controllers/authController');

const router = express.Router();

// Blunts brute-force / credential-stuffing against the endpoints that check
// or create a password. Keyed by IP (express-rate-limit's default), with a
// generic JSON error so it fits the app's existing error response shape.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

// Public
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Requires auth
router.get('/me', authMiddleware, me);

module.exports = router;
