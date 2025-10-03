import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './config/database.js';

const app = express();

// IMPORTANT: CORS configuration - allow all origins
app.use(cors({
  origin: true, // Allow ALL origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Test database connection
async function testDatabase() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection test:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testDatabase();
  
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// Database check endpoint
app.get('/api/check-database', async (req, res) => {
  try {
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    let userCount = 0;
    if (tableCheck.rows[0].exists) {
      const countResult = await db.query('SELECT COUNT(*) FROM users');
      userCount = parseInt(countResult.rows[0].count);
    }

    res.json({
      table_exists: tableCheck.rows[0].exists,
      user_count: userCount,
      database_url: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      database_url: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  }
});

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body);
  
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );

    console.log('✅ User created successfully');
    res.status(201).json({ 
      message: 'Registration successful!',
      userId: result.rows[0].id 
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
});

// User login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    if (user.status === 'blocked') {
      return res.status(400).json({ message: 'Account is blocked.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    await db.query(
      'UPDATE users SET last_login_time = NOW() WHERE id = $1',
      [user.id]
    );

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
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get all users endpoint
app.get('/api/users', async (req, res) => {
  console.log('📊 Fetching users list');
  
  try {
    const result = await db.query(`
      SELECT id, name, email, status, last_login_time, registration_time
      FROM users 
      ORDER BY last_login_time DESC NULLS LAST
    `);

    console.log(`✅ Found ${result.rows.length} users`);
    res.json(result.rows);

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({ message: 'Failed to fetch users: ' + error.message });
  }
});

// Block users endpoint
app.post('/api/users/block', async (req, res) => {
  console.log('🚫 Block users:', req.body);
  try {
    const { userIds } = req.body;
    await db.query('UPDATE users SET status = $1 WHERE id = ANY($2)', ['blocked', userIds]);
    res.json({ message: 'Users blocked successfully' });
  } catch (error) {
    console.error('Block error:', error);
    res.status(500).json({ message: 'Failed to block users' });
  }
});

// Unblock users endpoint
app.post('/api/users/unblock', async (req, res) => {
  console.log('✅ Unblock users:', req.body);
  try {
    const { userIds } = req.body;
    await db.query('UPDATE users SET status = $1 WHERE id = ANY($2)', ['active', userIds]);
    res.json({ message: 'Users unblocked successfully' });
  } catch (error) {
    console.error('Unblock error:', error);
    res.status(500).json({ message: 'Failed to unblock users' });
  }
});

// Delete users endpoint
app.post('/api/users/delete', async (req, res) => {
  console.log('🗑️ Delete users:', req.body);
  try {
    const { userIds } = req.body;
    await db.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
    res.json({ message: 'Users deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete users' });
  }
});

// Delete unverified users endpoint
app.post('/api/users/delete-unverified', async (req, res) => {
  console.log('🧹 Delete unverified users');
  try {
    const result = await db.query('DELETE FROM users WHERE status = $1', ['unverified']);
    res.json({ message: `Deleted ${result.rowCount} unverified users` });
  } catch (error) {
    console.error('Delete unverified error:', error);
    res.status(500).json({ message: 'Failed to delete unverified users' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Backend server running on port', PORT);
  console.log('✅ CORS enabled for all origins');
  console.log('✅ Endpoints available:');
  console.log('   - /api/health');
  console.log('   - /api/auth/register');
  console.log('   - /api/auth/login');
  console.log('   - /api/users');
});