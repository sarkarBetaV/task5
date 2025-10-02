import express from 'express';
import cors from 'cors';
import db from './config/database.js';

const app = express();

// Important: Basic CORS
app.use(cors({
  origin: ['https://user-management-frontend.onrender.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Important: Test if database connection works
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

// Simple health check - NO routes import needed yet
app.get('/api/health', async (req, res) => {
  const dbConnected = await testDatabase();
  
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple test registration endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body);
  
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Test database connection first
    try {
      await db.query('SELECT 1');
    } catch (dbError) {
      return res.status(500).json({ message: 'Database not available' });
    }

    // Check if users table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(500).json({ message: 'Users table does not exist' });
    }

    // Simple insert (without password hashing for testing)
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, password] // Note: Plain password for testing
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

// Simple test login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    
    // Simple password check (plain text for testing)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      token: 'test-jwt-token',
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Backend server running on port', PORT);
  console.log('✅ Health endpoint: /api/health');
  console.log('✅ Register endpoint: /api/auth/register');
  console.log('✅ Login endpoint: /api/auth/login');
});