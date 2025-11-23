-- create database (run outside transaction)
-- CREATE DATABASE spendwise;

-- tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- income | expense
  target BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) DEFAULT '',
  amount BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL, -- income | expense
  category VARCHAR(100),
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
