import express from "express";
import Joi from 'joi';
import  bcrypt from 'bcryptjs';
import User from '../models/user.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  authMiddleware,
} from '../utils/jwt.js';

const app = express();
app.use(express.json());
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Server is running!');
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
router.get('/users',async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
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

// Delete a user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id).select('_id name email dob credit_scores');
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

export default router;