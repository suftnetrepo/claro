// Manual migrations for expo-sqlite + drizzle

export const SQL_MIGRATIONS = [`
CREATE TABLE IF NOT EXISTS accounts (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  icon           TEXT NOT NULL DEFAULT 'cash',
  color          TEXT NOT NULL DEFAULT '#2E7D32',
  balance        REAL NOT NULL DEFAULT 0,
  initial_amount REAL NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_default     INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY NOT NULL,
  name       TEXT NOT NULL,
  icon       TEXT NOT NULL,
  color      TEXT NOT NULL,
  type       TEXT NOT NULL CHECK(type IN ('expense','income')),
  is_default INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  id            TEXT PRIMARY KEY NOT NULL,
  type          TEXT NOT NULL CHECK(type IN ('income','expense','transfer')),
  amount        REAL NOT NULL,
  date          INTEGER NOT NULL,
  notes         TEXT,
  account_id    TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id   TEXT REFERENCES categories(id) ON DELETE SET NULL,
  to_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tx_date     ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_tx_account  ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category_id);
CREATE TABLE IF NOT EXISTS budgets (
  id           TEXT PRIMARY KEY NOT NULL,
  category_id  TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month        TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  UNIQUE(month, category_id)
);
CREATE TABLE IF NOT EXISTS settings (
  id              TEXT PRIMARY KEY NOT NULL DEFAULT 'singleton',
  currency        TEXT NOT NULL DEFAULT 'USD',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  view_mode       TEXT NOT NULL DEFAULT 'monthly',
  show_total      INTEGER NOT NULL DEFAULT 1,
  carry_over      INTEGER NOT NULL DEFAULT 0,
  updated_at      INTEGER NOT NULL
);
INSERT OR IGNORE INTO settings (id, currency, currency_symbol, view_mode, show_total, carry_over, updated_at)
VALUES ('singleton', 'USD', '$', 'monthly', 1, 0, 0);
`]

export default SQL_MIGRATIONS
