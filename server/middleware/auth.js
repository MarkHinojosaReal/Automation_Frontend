const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if email domain is @therealbrokerage.com
    if (!decoded.email || !decoded.email.endsWith('@therealbrokerage.com')) {
      return res.status(403).json({ error: 'Access denied. Only @therealbrokerage.com emails allowed.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
