 
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Important: Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Note: Check if user exists and isn't blocked (requirement)
    const [users] = await db.execute(
      'SELECT id, name, email, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const user = users[0];
    
    // Nota bene: Redirect condition for blocked users
    if (user.status === 'blocked') {
      return res.status(401).json({ 
        message: 'Account is blocked. Please contact administrator.',
        redirectToLogin: true 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { authenticate };