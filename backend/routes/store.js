const express = require('express');
const pool = require('../dbconnect');
const { auth } = require('./auth');

const router = express.Router();

// Create new store
router.post('/store', auth, async (req, res) => {
  if (req.userRole !== 'store_owner') {
    return res.status(403).json({ msg: 'Owner only' });
  }

  const { name, email, address } = req.body;

  // Validate store name
  if (!name || name.length < 3) {
    return res.status(400).json({ msg: 'Store name must be 3+ chars' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address || '', req.userId]
    );

    res.status(201).json({
      msg: 'Store created successfully',
      store: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get owner dashboard
router.get('/dash', auth, async (req, res) => {
  if (req.userRole !== 'store_owner') {
    return res.status(403).json({ msg: 'Owner only' });
  }

  try {
    // Get all stores owned by this user
    const result = await pool.query(
      'SELECT * FROM stores WHERE owner_id = $1 ORDER BY name',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'No stores found' });
    }

    // Get ratings for each store
    const stores = [];
    for (const store of result.rows) {
      // Get average rating
      const avgRating = await pool.query(
        'SELECT AVG(rating) as avg FROM ratings WHERE store_id = $1',
        [store.id]
      );
      const avg = avgRating.rows[0].avg ? parseFloat(avgRating.rows[0].avg).toFixed(1) : '0.0';

      // Get all ratings with user names
      const ratings = await pool.query(
        'SELECT r.*, u.name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = $1 ORDER BY r.created_at DESC',
        [store.id]
      );

      stores.push({
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        avgRating: avg,
        ratings: ratings.rows
      });
    }

    res.json({ stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
