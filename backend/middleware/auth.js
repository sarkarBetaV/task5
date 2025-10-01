import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Important: Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Note: Check if user exists and isn't blocked
    const result = await db.query(
      'SELECT id, name, email, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const user = result.rows[0];
    
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

export { authenticate };