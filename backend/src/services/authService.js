const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

exports.register = async ({ username, password }) => {
  const existing = await User.findByUsername(username);
  if (existing) throw new Error('username already exists');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create(username, hash);
  return { id: user.id, username: user.username };
};

exports.login = async ({ username, password }) => {
  const user = await User.findByUsername(username);
  if (!user) throw new Error('invalid credentials');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('invalid credentials');

  const payload = { id: user.id, username: user.username };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return { token, user: payload };
};
