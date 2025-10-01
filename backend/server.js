 
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Important: Middleware setup
app.use(cors());
app.use(express.json());

// Note: Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Nota bene: Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});