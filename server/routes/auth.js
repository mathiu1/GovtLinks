const express = require('express');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
// Use a secure secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        // First user is admin automatically in this simple setup, or manually set via seed
        // For now, let's just make 'admin' username the admin
        const role = username === 'admin' ? 'admin' : 'user';
        const isAdmin = role === 'admin';

        const user = new User({ username, password: hashedPassword, role, isAdmin });
        await user.save();

        // Track Registration in Analytics
        const today = new Date().toISOString().split('T')[0];
        await Analytics.findOneAndUpdate(
            { date: today },
            { $inc: { newRegistrations: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, username: user.username, role: user.role, isAdmin: user.isAdmin } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
