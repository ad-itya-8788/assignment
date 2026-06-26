const express = require('express');
const pool = require('../dbconnect');
const { auth } = require('./auth');

const router = express.Router();

// Get all stores (with search)
router.get('/stores', auth, async (req, res) => {
  if (req.userRole !== 'normal_user') {
    return res.status(403).json({ msg: 'User only' });
  }

  const search = req.query.name || req.query.addr || '';

  try {
    // Build query with optional search
    let sql = 'SELECT * FROM stores';
    let params = [];
    
    if (search) {
      sql += ' WHERE name ILIKE $1 OR address ILIKE $1';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY name';
    
    // Get stores
    const result = await pool.query(sql, params);
    
    // Get ratings for each store
    const stores = [];
    for (const store of result.rows) {
      // Get average rating
      const avgRating = await pool.query(
        'SELECT AVG(rating) as avg FROM ratings WHERE store_id = $1',
        [store.id]
      );
      const avg = avgRating.rows[0].avg ? parseFloat(avgRating.rows[0].avg).toFixed(1) : '0.0';
      
      // Get user's rating for this store
      const userRating = await pool.query(
        'SELECT rating FROM ratings WHERE user_id = $1 AND store_id = $2',
        [req.userId, store.id]
      );
      const userRated = userRating.rows.length > 0 ? userRating.rows[0].rating : null;
      
      stores.push({
        ...store,
        rating: avg,
        userRating: userRated
      });
    }

    res.json({ stores, total: stores.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Rate a store
router.post('/rate', auth, async (req, res) => {
  if (req.userRole !== 'normal_user') {
    return res.status(403).json({ msg: 'User only' });
  }

  const { sid, rating } = req.body;

  // Validate rating (1-5)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Rating must be 1-5' });
  }

  try {
    // Check if store exists
    const check = await pool.query('SELECT * FROM stores WHERE id = $1', [sid]);
    if (check.rows.length === 0) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    // Check if user already rated this store
    const exist = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
      [req.userId, sid]
    );

    if (exist.rows.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3',
        [rating, req.userId, sid]
      );
    } else {
      // Insert new rating
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [req.userId, sid, rating]
      );
    }

    res.json({ msg: 'Rating saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
