const { Pool } = require('pg');

// All values fall back to sensible local-dev defaults so the API can boot
// against a freshly-created local Postgres without any .env at all.
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'fintrack',
});

pool.on('error', (err) => {
  // Errors on idle clients in the pool (e.g. connection dropped by the
  // server) should not crash the process.
  // eslint-disable-next-line no-console
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
