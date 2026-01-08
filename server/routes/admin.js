const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { logAction } = require('../utils/auditLogger'); // Import Logger
const jwt = require('jsonwebtoken');

// Middleware to check if admin (Simplified)
const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new Error('No token');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) throw new Error('Not authorized');

        req.user = decoded; // Attach for logger
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Admin access required' });
    }
};

router.use(isAdmin); // Protect ALL admin routes

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        // ... existing stats logic (read-only, minimal logging needed)
        // Keeping existing logic for brevity, just wrapping the rest...
        const { range, start, end } = req.query;

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (range === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (range === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        } else if (range === 'custom' && start && end) {
            startDate = new Date(start);
            endDate = new Date(end);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const analyticsData = await Analytics.find({
            date: { $gte: startDateStr, $lte: endDateStr }
        }).sort({ date: 1 });

        const periodGuestVisits = analyticsData.reduce((acc, curr) => acc + (curr.guestVisits || 0), 0);
        const periodMemberVisits = analyticsData.reduce((acc, curr) => acc + (curr.memberVisits || 0), 0);
        const periodNewRegistrations = analyticsData.reduce((acc, curr) => acc + (curr.newRegistrations || 0), 0);

        const totalSystemUsers = await User.countDocuments({});
        const totalSystemMembers = await User.countDocuments({ role: 'user' });

        const growthData = analyticsData.map(day => ({
            date: day.date,
            users: day.newRegistrations || 0,
            newRegisters: day.newRegistrations || 0,
            guest: day.guestVisits || 0,
            member: day.memberVisits || 0
        }));

        res.json({
            totalUsers: totalSystemUsers,
            totalMembers: totalSystemMembers,
            periodNewUsers: periodNewRegistrations,
            periodMemberVisits: periodMemberVisits,
            periodGuestVisits: periodGuestVisits,
            growthData
        });

        logAction('VIEW_ADMIN_DASHBOARD', req); // Log View

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update User Role
router.put('/users/:id', async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');

        logAction('UPDATE_USER_ROLE', req, { targetUserId: req.params.id, newRole: role }); // Log

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        logAction('DELETE_USER', req, { targetUserId: req.params.id }); // Log

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CRUD Items

// Create
router.post('/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();

        logAction('CREATE_ITEM', req, { itemId: newItem._id, title: req.body.title_en }); // Log

        res.json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update
router.put('/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });

        logAction('UPDATE_ITEM', req, { itemId: req.params.id }); // Log

        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete
router.delete('/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);

        logAction('DELETE_ITEM', req, { itemId: req.params.id }); // Log

        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
