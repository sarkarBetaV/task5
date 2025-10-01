import express from 'express';
import cors from 'cors';
import db from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();

// Important: CORS configuration for your frontend
app.use(cors({
  origin: [
    'https://user-management-frontend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// Important: Database initialization
async function initializeDatabase() {
  try {
    const client = await db.connect();
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('🚀 Creating database tables...');
      
      // Create users table
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'unverified' CHECK (status IN ('unverified', 'active', 'blocked')),
          last_login_time TIMESTAMPTZ,
          registration_time TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      
      // Create unique index
      await client.query(`
        CREATE UNIQUE INDEX idx_email_unique ON users(email);
      `);
      
      console.log('✅ Database tables created successfully!');
    } else {
      console.log('✅ Database tables already exist');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// Initialize database
initializeDatabase();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Note: REMOVED all static file serving - frontend is separate

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});