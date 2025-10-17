import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import sendMail from "../utils/mail.js";
import { clearRefreshTokenCookie } from '../utils/jwt.js';
import uploadToCloudinary from '../utils/cloudinary.js';

import {
  signAccessToken,
  signRefreshToken,
  attachRefreshTokenCookie
} from '../utils/jwt.js';

// (Register with authentication)
async function Register(req, res){
  
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

    await sendMail(
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
}

// Login endpoint
async function Login(req, res){

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    attachRefreshTokenCookie(res, refreshToken);

    // send login notification email
    await sendMail(
            email,
            "Welcome to Unicode!",
            "You have successfully logged in!",
    );

    res.json({
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob, credit_scores: user.credit_scores },
      accessToken
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to login' });
  }
}

// Logout endpoint
async function Logout(req, res){
  clearRefreshTokenCookie(res);
  res.status(204).send();
}

async function uploadProfileIcon(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.path, { folder: "profile_icons" });
    result.secure_url
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profile_image: result.secure_url },
      { new: true }
    );

    //fs.unlinkSync(req.file.path);

    return res.json({ message: "Profile picture updated!", user });
    console.log("Profile picture updated for user:", user._id);
    console.log('Cloudinary URL:', result.secure_url);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Get all users (protected route)
async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

// Update a user
async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, dob, credit_scores } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { name, email, dob, credit_scores }, { new: true }).select('_id name email dob credit_scores');
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

// Delete a user
async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id).select('_id name email dob credit_scores');
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

export {
  Register,
  Login,
  Logout,
  uploadProfileIcon,
  getUsers,
  updateUser,
  deleteUser
};