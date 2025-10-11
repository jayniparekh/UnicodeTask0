import express from "express";
const router = express.Router();
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import mail from "../utils/mail.js";
import {
  signAccessToken,
  signRefreshToken
} from '../utils/jwt.js';

router.get("/test", (req, res) => {
  res.send("Test route working");
});

// Create a new user (Register with authentication)
router.post('/Register', async (req, res) => {
  
  try {
    const { name, email, password, dob, credit_scores } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const salt= await bcrypt.genSalt(Number(process.env.SALT));
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
        name,
        email,
        passwordHash,
        dob,
        credit_scores,
    });
    await newUser.save();

    console.log('Creating user with:', { name, email, passwordHash: passwordHash.substring(0, 20) + '...', dob, credit_scores });

    await mail(
            email,
            "Welcome to Unicode!",
            "You have successfully registered!",
    );
    const accessToken = signAccessToken({ sub: newUser._id.toString(), email: newUser.email });
    const refreshToken = signRefreshToken({ sub: newUser._id.toString() });
    
    res.status(201).json({
      user: { id: newUser._id, name: newUser.name, email: newUser.email, dob: newUser.dob, credit_scores: newUser.credit_scores },
      accessToken,refreshToken
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

export default router;