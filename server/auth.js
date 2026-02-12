const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cipher-circuit-secret-key-2026';

// Generate JWT Token
const generateToken = (teamId, teamName) => {
  return jwt.sign(
    { teamId, teamName },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Express middleware to verify JWT in header
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Socket.IO middleware for JWT verification
const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid or expired token'));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  socketAuthMiddleware,
  JWT_SECRET
};
