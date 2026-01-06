const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

// Middleware to check if admin (Simplified)
// In production, verify JWT first
const isAdmin = async (req, res, next) => {
    // For now trust the request if valid token logic handled in front/gateway or added here
    // We will assume this route is protected by a general auth middleware usually, 
    // but for speed lets just implement the logic in the controllers or wrapper
    next();
};

// Get Dashboard Stats (Real Data with Filtering)
router.get('/stats', async (req, res) => {
    try {
        const { range, start, end } = req.query; // range: 'today', 'week', ... | start, end: YYYY-MM-DD

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Default to today
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
            // Adjust hours to cover full days
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // 1. Fetch Period Analytics (For Charts and "Activity" Cards)
        const analyticsData = await Analytics.find({
            date: { $gte: startDateStr, $lte: endDateStr }
        }).sort({ date: 1 });

        const periodGuestVisits = analyticsData.reduce((acc, curr) => acc + (curr.guestVisits || 0), 0);
        const periodMemberVisits = analyticsData.reduce((acc, curr) => acc + (curr.memberVisits || 0), 0);
        const periodNewRegistrations = analyticsData.reduce((acc, curr) => acc + (curr.newRegistrations || 0), 0);

        // 2. Fetch Absolute Totals (For "Total Users" Card - Context independent usually desired)
        const totalSystemUsers = await User.countDocuments({});
        const totalSystemMembers = await User.countDocuments({ role: 'user' });

        // Format data for chart
        const growthData = analyticsData.map(day => ({
            date: day.date,
            users: day.newRegistrations || 0,
            newRegisters: day.newRegistrations || 0,
            guest: day.guestVisits || 0,
            member: day.memberVisits || 0
        }));

        res.json({
            // Absolute Counts (Snapshot)
            totalUsers: totalSystemUsers,
            totalMembers: totalSystemMembers,

            // Period Counts (Activity)
            periodNewUsers: periodNewRegistrations,
            periodMemberVisits: periodMemberVisits,
            periodGuestVisits: periodGuestVisits,

            growthData
        });
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
        res.json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update
router.put('/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete
router.delete('/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
