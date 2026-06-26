const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../dbconnect');

const router = express.Router();

// Check if user has valid token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.userId = data.userId;
    req.userRole = data.userRole;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Bad token' });
  }
};

// Register new user
router.post('/register', async (req, res) => 
  {
  const { name, email, pwd, addr } = req.body;
  
  // Validate input
  if (!name || name.length < 20 || name.length > 60) 
  {
    return res.status(400).json({ msg: 'Name must be 20-60 chars' });
  }
  if (!email || !email.includes('@')) 
  {
    return res.status(400).json({ msg: 'Invalid email' });
  }
  if (!pwd || pwd.length < 8 || pwd.length > 16) 
  {    
    return res.status(400).json({ msg: 'Password must be 8-16 chars' });
  }
  if (!/[A-Z]/.test(pwd)) 
  {
    return res.status(400).json({ msg: 'Need 1 uppercase letter' });
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) 
  {
    return res.status(400).json({ msg: 'Need 1 special character' });
  }

  try {
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) 
    {
      return res.status(409).json({ msg: 'Email already exists' });
    }

    const hash = await bcrypt.hash(pwd, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hash, addr || '', 'normal_user']
    );

    res.status(201).json({ msg: 'Registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, pwd } = req.body;

  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ msg: 'Wrong email or password' });
    }

    // Check password
    const user = result.rows[0];
    const ok = await bcrypt.compare(pwd, user.password);
    if (!ok) {
      return res.status(401).json({ msg: 'Wrong email or password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, userRole: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    res.json({
      msg: 'Login successful',
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Change password
router.put('/pwd', auth, async (req, res) => {
  const { old, newpwd } = req.body;

  // Validate new password
  if (!newpwd || newpwd.length < 8 || newpwd.length > 16) {
    return res.status(400).json({ msg: 'Password must be 8-16 chars' });
  }
  if (!/[A-Z]/.test(newpwd)) {
    return res.status(400).json({ msg: 'Need 1 uppercase letter' });
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newpwd)) {
    return res.status(400).json({ msg: 'Need 1 special character' });
  }

  try {
    // Get user
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check old password
    const ok = await bcrypt.compare(old, result.rows[0].password);
    if (!ok) {
      return res.status(401).json({ msg: 'Wrong old password' });
    }

    // Update password
    const hash = await bcrypt.hash(newpwd, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.userId]);

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = { router, auth };
