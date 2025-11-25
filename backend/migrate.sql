-- ============================================
-- DATABASE MIGRATION - POSTGRESQL VERSION
-- ============================================

-- 1. Tambah kolom balance, total_income, total_expense
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS balance NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_income NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_expense NUMERIC(15, 2) DEFAULT 0;

-- 2. Update existing users dengan data dari transactions
UPDATE users u
SET 
  total_income = (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions
    WHERE user_id = u.id AND type = 'income'
  ),
  total_expense = (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions
    WHERE user_id = u.id AND type = 'expense'
  ),
  balance = (
    SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
    FROM transactions
    WHERE user_id = u.id
  );

-- 3. Index
CREATE INDEX IF NOT EXISTS idx_user_balance ON users(id, balance);
CREATE INDEX IF NOT EXISTS idx_transaction_user_type_date ON transactions(user_id, type, date);

-- ============================================
-- COMPLETE SCHEMA
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0,
  total_income NUMERIC(15, 2) DEFAULT 0,
  total_expense NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_update_transactions
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (name, type)
);

-- Insert default categories (ON CONFLICT)
INSERT INTO categories (name, type, icon, color)
VALUES
('Gaji', 'income', 'briefcase', '#10b981'),
('Freelance', 'income', 'laptop', '#3b82f6'),
('Investasi', 'income', 'trending-up', '#8b5cf6'),
('Bonus', 'income', 'gift', '#f59e0b'),
('Lainnya', 'income', 'more-horizontal', '#6b7280'),
('Makanan', 'expense', 'utensils', '#ef4444'),
('Transport', 'expense', 'car', '#f59e0b'),
('Belanja', 'expense', 'shopping-cart', '#ec4899'),
('Tagihan', 'expense', 'file-text', '#8b5cf6'),
('Hiburan', 'expense', 'film', '#14b8a6'),
('Kesehatan', 'expense', 'heart', '#10b981'),
('Pendidikan', 'expense', 'book', '#3b82f6'),
('Lainnya', 'expense', 'more-horizontal', '#6b7280')
ON CONFLICT (name, type) DO NOTHING;

-- Budget Goals
CREATE TABLE IF NOT EXISTS budget_goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  monthly_limit NUMERIC(15, 2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, category, month, year)
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample user
WITH inserted AS (
  INSERT INTO users (name, email, username, password)
  VALUES ('John Doe', 'john@example.com', 'johndoe', '$2b$10$YourHashedPasswordHere')
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
SELECT COALESCE((SELECT id FROM inserted), (SELECT id FROM users WHERE email='john@example.com')) AS user_id
\gset

-- Insert transactions
INSERT INTO transactions (user_id, type, category, amount, date, description) VALUES
(:user_id, 'income', 'Gaji', 5000000, CURRENT_DATE - INTERVAL '1 day', 'Gaji Januari'),
(:user_id, 'expense', 'Makanan', 500000, CURRENT_DATE - INTERVAL '2 day', 'Belanja'),
(:user_id, 'expense', 'Transport', 300000, CURRENT_DATE - INTERVAL '3 day', 'Bensin'),
(:user_id, 'income', 'Freelance', 1500000, CURRENT_DATE - INTERVAL '4 day', 'Project client'),
(:user_id, 'expense', 'Hiburan', 200000, CURRENT_DATE - INTERVAL '5 day', 'Nonton film'),
(:user_id, 'expense', 'Tagihan', 350000, CURRENT_DATE - INTERVAL '6 day', 'Listrik'),
(:user_id, 'income', 'Bonus', 1000000, CURRENT_DATE - INTERVAL '7 day', 'Bonus kinerja');

-- Update balance
UPDATE users u
SET 
  total_income = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = u.id AND type = 'income'),
  total_expense = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = u.id AND type = 'expense'),
  balance = (SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) FROM transactions WHERE user_id = u.id)
WHERE id = :user_id;

