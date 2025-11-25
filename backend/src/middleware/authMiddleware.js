// authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET || "your-secret-key";

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token tidak valid atau expired." });
  }
};

// **Export langsung sebagai function**
module.exports = authenticateToken;
