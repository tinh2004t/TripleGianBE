const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};
