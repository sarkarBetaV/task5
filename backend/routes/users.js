import express from 'express';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Important: All routes require authentication
router.use(authenticate);

// Note: Get all users (sorted by last login time)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
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

    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
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

    await db.query(
      'UPDATE users SET status = $1 WHERE id = ANY($2)',
      ['blocked', userIds]
    );

    res.json({ message: 'Users blocked successfully.' });
  } catch (error) {
    console.error('Block users error:', error);
    res.status(500).json({ message: 'Failed to block users.' });
  }
});

// Note: Unblock users
router.post('/unblock', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    await db.query(
      'UPDATE users SET status = $1 WHERE id = ANY($2)',
      ['active', userIds]
    );

    res.json({ message: 'Users unblocked successfully.' });
  } catch (error) {
    console.error('Unblock users error:', error);
    res.status(500).json({ message: 'Failed to unblock users.' });
  }
});

// Nota bene: Delete users (permanent deletion)
router.post('/delete', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    await db.query(
      'DELETE FROM users WHERE id = ANY($1)',
      [userIds]
    );

    res.json({ message: 'Users deleted successfully.' });
  } catch (error) {
    console.error('Delete users error:', error);
    res.status(500).json({ message: 'Failed to delete users.' });
  }
});

// Important: Delete unverified users
router.post('/delete-unverified', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM users WHERE status = $1 RETURNING id',
      ['unverified']
    );

    res.json({ 
      message: `Unverified users deleted successfully.`,
      deletedCount: result.rows.length
    });
  } catch (error) {
    console.error('Delete unverified error:', error);
    res.status(500).json({ message: 'Failed to delete unverified users.' });
  }
});

// Important: Default export
export default router;