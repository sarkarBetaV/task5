import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const router = express.Router();

// Important: User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Note: Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Nota bene: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Important: Database will handle uniqueness through index
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );

    // Note: Send confirmation email asynchronously
    console.log(`Registration successful for ${email}. Verification email would be sent.`);

    res.status(201).json({ 
      message: 'Registration successful!',
      userId: result.rows[0].id 
    });

  } catch (error) {
    // Important: Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

// Important: User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Note: Find user by email
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // Nota bene: Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(400).json({ message: 'Account is blocked.' });
    }

    // Important: Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Note: Update last login time
    await db.query(
      'UPDATE users SET last_login_time = NOW() WHERE id = $1',
      [user.id]
    );

    // Important: Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed.' });
  }
});

// Note: Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await db.query(
      'UPDATE users SET status = $1 WHERE email = $2 AND status = $3 RETURNING id',
      ['active', email, 'unverified']
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Verification failed or already verified.' });
    }

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Verification failed.' });
  }
});

// Important: Default export
export default router;