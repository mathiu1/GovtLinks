const Item = require('../models/Item');

// In-Memory Cache for List View
let cache = {
    data: null,
    lastUpdated: 0,
    TTL: 10 * 60 * 1000 // 10 Minutes
};

exports.syncData = async (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    try {
        const count = await Item.countDocuments();
        res.json({
            status: 'success',
            message: 'Sync check complete. Data is up to date.',
            count: count,
            source: 'Local Database'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const now = Date.now();

        // Serve from Cache
        if (cache.data && (now - cache.lastUpdated < cache.TTL)) {
            res.set('Cache-Control', 'public, max-age=300');
            return res.json(cache.data);
        }

        // Fetch Optimized Data (Project Out Heavy Fields)
        // Exclude steps and links arrays for the list view to reduce payload size
        const items = await Item.find({}, {
            steps: 0,
            official_links: 0,
            youtube_links: 0,
            __v: 0
        }).sort({ createdAt: -1 }).lean();

        // Update Cache
        cache.data = items;
        cache.lastUpdated = now;

        res.set('Cache-Control', 'public, max-age=300');
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch Single Item (Full Details)
exports.getItemById = async (req, res) => {
    try {
        // Cache single items for shorter duration
        res.set('Cache-Control', 'public, max-age=60');

        const { id } = req.params;
        const item = await Item.findById(id).lean();

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
