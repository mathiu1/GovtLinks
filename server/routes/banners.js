const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// Get all active banners (Public)
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Get ALL banners (including inactive)
router.get('/all', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create Banner
router.post('/', async (req, res) => {
    const banner = new Banner({
        title_en: req.body.title_en,
        title_ta: req.body.title_ta,
        desc_en: req.body.desc_en,
        desc_ta: req.body.desc_ta,
        image: req.body.image,
        gradient: req.body.gradient,
        link: req.body.link,
        isActive: req.body.isActive
    });
    try {
        const newBanner = await banner.save();
        res.status(201).json(newBanner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update Banner
router.put('/:id', async (req, res) => {
    try {
        const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBanner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Banner
router.delete('/:id', async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
