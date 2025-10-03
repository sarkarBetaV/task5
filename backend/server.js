import express from 'express';
import cors from 'cors';

const app = express();

// Simple CORS - allow everything
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple registration (no database)
app.post('/api/auth/register', (req, res) => {
  console.log('Registration attempt:', req.body);
  res.json({ 
    message: 'Registration successful (test mode)',
    userId: 1
  });
});

// Simple login
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({
    token: 'test-token',
    user: { id: 1, name: 'Test User', email: 'test@test.com', status: 'active' }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Simple backend running on port', PORT);
});