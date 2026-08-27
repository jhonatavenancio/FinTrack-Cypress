require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const AppError = require('./utils/AppError');
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const transactionsRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Sets a standard set of protective headers (X-Content-Type-Options,
// X-Frame-Options, HSTS, a conservative default CSP, etc). This is a pure
// JSON API with no browser-rendered HTML, so the default CSP is safe here.
app.use(helmet());

// Restrict cross-origin access to an explicit allowlist instead of
// reflecting every origin. Configurable via CORS_ORIGIN (comma-separated
// for multiple origins) so prod can lock this down; defaults to the Vite
// dev server origin for local development.
const allowedOrigins = (
  process.env.CORS_ORIGIN || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin header (curl, server-to-server,
      // mobile apps, health checks) - there's no cross-site browser risk
      // to police for those.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError('Not allowed by CORS', 403));
    },
    credentials: true,
  })
);

// Cap request body size - this API only ever accepts small JSON payloads
// (auth credentials, categories, transactions), so a generous-but-bounded
// limit blocks oversized-payload DoS attempts without affecting real usage.
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 for anything else, then the centralized error handler.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
