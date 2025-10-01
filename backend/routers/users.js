 
const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Important: All routes require authentication
router.use(authenticate);

// Note: Get all users (sorted by last login time - requirement)
router.get('/', async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        id,
        name,
        email,
        status,
        last_login_time,
        registration_time,
        created_at
      FROM users 
      ORDER BY last_login_time DESC NULLS LAST
    `);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Important: Block users
router.post('/block', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'User IDs are required.' });
    }

    await db.execute(
      'UPDATE users SET status = "blocked" WHERE id IN (?)',
      [userIds]
    );

    res.json({ message: 'Users blocked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to block users.' });
  }
});

// Note: Unblock users
router.post('/unblock', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    await db.execute(
      'UPDATE users SET status = "active" WHERE id IN (?)',
      [userIds]
    );

    res.json({ message: 'Users unblocked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unblock users.' });
  }
});

// Nota bene: Delete users (permanent deletion - requirement)
router.post('/delete', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    await db.execute(
      'DELETE FROM users WHERE id IN (?)',
      [userIds]
    );

    res.json({ message: 'Users deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete users.' });
  }
});

// Important: Delete unverified users
router.post('/delete-unverified', async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM users WHERE status = "unverified"'
    );

    res.json({ message: 'Unverified users deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete unverified users.' });
  }
});

module.exports = router;