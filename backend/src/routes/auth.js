const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailMatch = email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
  if (!emailMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return res.json({ token, expiresIn: '7d' });
});

// GET /api/auth/verify (protected)
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true });
});

module.exports = router;
