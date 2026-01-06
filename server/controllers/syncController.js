const Item = require('../models/Item');

// Simulating a sync from an external source or local JSON
exports.syncData = async (req, res) => {
    try {
        const count = await Item.countDocuments();
        // In a real app, logic to fetch external API and update DB would go here.
        res.json({
            status: 'success',
            message: 'Sync check complete. Data is up to date.',
            count: count,
            source: 'Local Database (Simulated Remote Sync)'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
