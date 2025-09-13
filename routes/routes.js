const express = require("express");
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  authMiddleware,
  attachRefreshTokenCookie,
  clearRefreshTokenCookie
} = require('../jwt');
const { sendLoginNotification } = require('../services/emailService');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Server is running!');
});

// Temporary endpoint to check all users (for testing only)
router.get('/check-users', async (req, res) => {
  try {
    const users = await User.find({}).select('_id name email dob credit_scores');
    res.json({ users, count: users.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  dob: Joi.date().iso().required(),
  credit_scores: Joi.number().default(0)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

// Create a new user (Register with authentication)
router.post('/Register', async (req, res) => {
  console.log('Environment check:', {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
  });
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  
  const { name, email, password, dob, credit_scores } = value;
  
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Creating user with:', { name, email, passwordHash: passwordHash.substring(0, 20) + '...', dob, credit_scores });
    const user = await User.create({ name, email, passwordHash, dob, credit_scores });
    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    attachRefreshTokenCookie(res, refreshToken);
    
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob, credit_scores: user.credit_scores },
      accessToken
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to register' });
  }
});

// Login endpoint
router.post('/Login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  
  const { email, password } = value;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await user.isPasswordValid(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    attachRefreshTokenCookie(res, refreshToken);

    // send login notification email
    

    res.json({
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob, credit_scores: user.credit_scores },
      accessToken
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to login' });
  }
});


// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Missing refresh token' });
  try {
    const decoded = verifyRefreshToken(token);
    const userId = decoded.sub;
    const user = await User.findById(userId).select('_id email name');
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const newRefreshToken = signRefreshToken({ sub: user._id.toString() });
    attachRefreshTokenCookie(res, newRefreshToken);
    res.json({ accessToken });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  clearRefreshTokenCookie(res);
  res.status(204).send();
});

// Get all users (protected route)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('_id name email dob credit_scores');
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Update a user (protected route)
router.put('/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, dob, credit_scores } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { name, email, dob, credit_scores }, { new: true }).select('_id name email dob credit_scores');
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete a user (protected route)
router.delete('/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id).select('_id name email dob credit_scores');
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports =  router;