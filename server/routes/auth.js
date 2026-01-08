const express = require('express');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema, validate } = require('../middleware/validate'); // Import validation

const router = express.Router();
const { logAction } = require('../utils/auditLogger');

// Register with Strict Validation
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check duplicates (still needed despite schema)
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            if (existingUser.username === username) return res.status(400).json({ message: 'Username is already taken' });
            if (existingUser.email === email) return res.status(400).json({ message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds to 12 for enterprise
        const role = username === 'admin' ? 'admin' : 'user';
        const isAdmin = role === 'admin';

        const user = new User({ username, email, password: hashedPassword, role, isAdmin });
        await user.save();

        logAction('REGISTER', req, { userId: user._id, email }); // Log Register

        // Analytics
        const today = new Date().toISOString().split('T')[0];
        await Analytics.findOneAndUpdate(
            { date: today },
            { $inc: { newRegistrations: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: 'Registration successful! Please login.' });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login with Strict Validation
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: user.role, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Strict Cookie Settings
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Relaxed for better user experience (links from email, etc.)
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin
            }
        });

        logAction('LOGIN', req, { userId: user._id }); // Log Login
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Verify Token
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
