const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
    guestVisits: { type: Number, default: 0 },
    memberVisits: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
