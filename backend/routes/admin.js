const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../dbconnect');
const { auth } = require('./auth');

const router = express.Router();

// Get dashboard stats
router.get('/dash', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const stores = await pool.query('SELECT COUNT(*) FROM stores');
    const ratings = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalStores: parseInt(stores.rows[0].count),
      totalRatings: parseInt(ratings.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add new user
router.post('/user', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  const { name, email, pwd, addr, role } = req.body;

  // Validate name
  if (!name || name.length < 20) {
    return res.status(400).json({ msg: 'Name must be 20+ chars' });
  }

  try {
    // Check if email exists
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(409).json({ msg: 'Email already exists' });
    }

    // Create user
    const hash = await bcrypt.hash(pwd, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hash, addr || '', role]
    );

    res.status(201).json({ msg: 'User added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, address, role FROM users ORDER BY name'
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all store owners
router.get('/owners', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'store_owner' ORDER BY name"
    );
    res.json({ owners: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete user
router.delete('/user/:id', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add new store
router.post('/store', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  const { name, email, addr, ownerId } = req.body;

  // Validate store name
  if (!name || name.length < 3) {
    return res.status(400).json({ msg: 'Store name must be 3+ chars' });
  }

  try {
    await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4)',
      [name, email, addr || '', ownerId || null]
    );
    res.status(201).json({ msg: 'Store added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all stores with ratings
router.get('/stores', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    const result = await pool.query('SELECT * FROM stores ORDER BY name');
    
    // Get rating for each store
    const stores = [];
    for (const store of result.rows) {
      const rating = await pool.query(
        'SELECT AVG(rating) as avg FROM ratings WHERE store_id = $1',
        [store.id]
      );
      const avg = rating.rows[0].avg ? parseFloat(rating.rows[0].avg).toFixed(1) : '0.0';
      
      stores.push({ ...store, rating: avg });
    }

    res.json({ stores, total: stores.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete store
router.delete('/store/:id', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }

  try {
    await pool.query('DELETE FROM stores WHERE id = $1', [req.params.id]);
    res.json({ msg: 'Store deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
