const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const Analytics = require('../models/Analytics');

// Track Visit
router.post('/track-visit', async (req, res) => {
    try {
        const { type } = req.body; // 'guest' or 'member'
        const today = new Date().toISOString().split('T')[0];

        const updateField = type === 'member' ? { memberVisits: 1 } : { guestVisits: 1 };

        await Analytics.findOneAndUpdate(
            { date: today },
            { $inc: updateField },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Visit tracked' });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ message: 'Error tracking visit' });
    }
});

router.get('/sync', syncController.syncData);
router.get('/items', syncController.getAllItems);
router.get('/items/:id', syncController.getItemById); // New Route for Single Item

module.exports = router;
