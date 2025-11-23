const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/appConfig');

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success:false, message:'No token provided' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ success:false, message:'Token error' });

  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ success:false, message:'Token malformatted' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: decoded.id, username: decoded.username };
    return next();
  } catch (err) {
    return res.status(401).json({ success:false, message:'Token invalid' });
  }
};
