// services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // pastikan ini sesuai path
const { jwtSecret, jwtExpiresIn } = require('../config/appConfig'); // opsional config

// REGISTER
exports.register = async ({ name, email, username, password }) => {
  // Cek apakah username sudah ada
  const existingUsername = await User.findByUsername(username);
  if (existingUsername) throw new Error('Username already exists');

  // Cek apakah email sudah ada
  const existingEmail = await User.findByEmail(email);
  if (existingEmail) throw new Error('Email already registered');

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat user baru
  const user = await User.create({
    name,
    email,
    username,
    password: hashedPassword,
    balance: 0,
    total_income: 0,
    total_expense: 0,
  });

  // Return data minimal (tidak termasuk password)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
  };
};

// LOGIN
exports.login = async ({ username, password }) => {
  // Cari user berdasarkan username
  const user = await User.findByUsername(username);
  if (!user) throw new Error('Invalid credentials');

  // Compare password
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  // Generate token JWT
  const payload = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || jwtSecret || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || jwtExpiresIn || '7d',
  });

  return {
    token,
    user: payload,
  };
};
