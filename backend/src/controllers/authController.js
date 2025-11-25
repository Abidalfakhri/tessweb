const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Secret key untuk JWT (seharusnya di .env)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// --- Definisikan fungsi menggunakan 'const' ---

/**
 * REGISTER - Daftar user baru
 */
const register = async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    // Validasi input
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi (name, email, username, password)",
      });
    }

    // Cek apakah username atau email sudah ada
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username atau email sudah terdaftar",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const result = await pool.query(
      `INSERT INTO users (name, email, username, password, balance, total_income, total_expense) 
       VALUES ($1, $2, $3, $4, 0, 0, 0) 
       RETURNING id, name, email, username, balance, total_income, total_expense, created_at`,
      [name, email, username, hashedPassword]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        id: newUser.id, 
        username: newUser.username,
        name: newUser.name 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ User registered:", newUser.username);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          balance: parseFloat(newUser.balance),
          total_income: parseFloat(newUser.total_income),
          total_expense: parseFloat(newUser.total_expense),
        },
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat registrasi",
      error: error.message,
    });
  }
};

/**
 * LOGIN - Masuk dengan username & password
 */
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi",
      });
    }

    // Cari user berdasarkan username
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    const user = result.rows[0];

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        id: user.id, 
        username: user.username,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ User logged in:", user.username);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          balance: parseFloat(user.balance),
          total_income: parseFloat(user.total_income),
          total_expense: parseFloat(user.total_expense),
        },
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat login",
      error: error.message,
    });
  }
};

/**
 * GET PROFILE - Ambil data user yang sedang login
 */
const getProfile = async (req, res) => {
  try {
    // Menggunakan data dari req.user yang di-attach oleh middleware
    const userId = req.user.userId || req.user.id; 

    const result = await pool.query(
      `SELECT id, name, email, username, balance, total_income, total_expense, created_at, updated_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        balance: parseFloat(user.balance),
        total_income: parseFloat(user.total_income),
        total_expense: parseFloat(user.total_expense),
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil profil",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};