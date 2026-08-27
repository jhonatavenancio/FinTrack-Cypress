// Fail fast and loud if the server is started in production without a real
// JWT secret configured, rather than limping along and only erroring the
// first time a token is signed/verified.
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      'FATAL: JWT_SECRET environment variable is not set. ' +
        'Refusing to start in production without it.'
    );
    process.exit(1);
  }
  if (secret.length < 32) {
    // eslint-disable-next-line no-console
    console.error(
      'FATAL: JWT_SECRET is too short (must be at least 32 characters) ' +
        'to provide adequate signing security in production.'
    );
    process.exit(1);
  }
}

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`FinTrack API listening on port ${PORT}`);
});
