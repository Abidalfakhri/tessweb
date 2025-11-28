
const jwt = require("jsonwebtoken");
// Pastikan Anda memanggil dotenv jika tidak dipanggil di file utama Anda
// require('dotenv').config(); 

const authenticateToken = (req, res, next) => {
 const authHeader = req.headers.authorization;

 if (!authHeader || !authHeader.startsWith("Bearer ")) {
  // 401 Unauthorized
  return res.status(401).json({ success: false, message: "Akses ditolak. Token tidak ditemukan." });
 }

 const token = authHeader.split(" ")[1];
 const secretKey = process.env.JWT_SECRET || "your-secret-key-fallback"; // Gunakan fallback key

 try {
  // Verifikasi token
  const decoded = jwt.verify(token, secretKey);
  
  // Menyimpan data user (penting untuk route Wallet)
  // req.user.id ini yang akan digunakan di WalletController
  req.user = { id: decoded.id, username: decoded.username };
  next();
 } catch (err) {
  // 401 Unauthorized (Token invalid/expired)
  return res.status(401).json({ success: false, message: "Token tidak valid atau expired." });
 }
};

module.exports = authenticateToken;