-- FinTrack schema
-- Executed automatically by the postgres image on first container start
-- (mounted at /docker-entrypoint-initdb.d/init.sql)

CREATE TYPE category_type AS ENUM ('income', 'expense');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL CHECK (length(name) > 0),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- case-insensitive uniqueness / lookup on email
CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));

CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (length(name) > 0),
  type       category_type NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1' CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- FK columns are not auto-indexed in postgres
CREATE INDEX categories_user_id_idx ON categories (user_id);

CREATE TABLE transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description  TEXT,
  occurred_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- covers "transactions by user in a date range" and plain per-user listing
CREATE INDEX transactions_user_occurred_idx ON transactions (user_id, occurred_at DESC);
-- covers "transactions by category"
CREATE INDEX transactions_category_id_idx ON transactions (category_id);

-- Seed data: a demo user (email: demo@fintrack.local / password: Demo1234!)
-- password_hash below is a real bcrypt(cost 12) hash of "Demo1234!" — for local dev only.
INSERT INTO users (id, name, email, password_hash) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo User', 'demo@fintrack.local',
   '$2b$12$X6boeXmD.Ub4J.5jMFORLe/3vP6/NnbJHONCQsCN5ChG170cninSO');

INSERT INTO categories (id, user_id, name, type, color) VALUES
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Salário', 'income', '#22c55e'),
  ('22222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Alimentação', 'expense', '#ef4444'),
  ('23333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Transporte', 'expense', '#f59e0b'),
  ('24444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Lazer', 'expense', '#8b5cf6');

INSERT INTO transactions (user_id, category_id, amount, description, occurred_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 5000.00, 'Salário mensal', CURRENT_DATE - INTERVAL '5 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 89.90, 'Supermercado', CURRENT_DATE - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111111', '23333333-1111-1111-1111-111111111111', 45.00, 'Uber', CURRENT_DATE - INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111111', '24444444-1111-1111-1111-111111111111', 120.00, 'Cinema', CURRENT_DATE - INTERVAL '1 day');
