import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();

// Important: Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Note: CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-url.onrender.com'] // Update with your actual frontend URL
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Nota bene: API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Important: Serve frontend in production - PUT THIS AT THE END
if (process.env.NODE_ENV === 'production') {
  // Serve static files from frontend build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
