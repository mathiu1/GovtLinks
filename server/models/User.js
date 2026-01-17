const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: {
        type: String,
        required: false, // Temporarily relaxed for legacy data support
        unique: true,
        sparse: true, // Allows multiple null/undefined values
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isAdmin: { type: Boolean, default: false },
    // Gamification fields
    xp: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 }, // Lifetime XP for leveling (never decreases)
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastQuizDate: { type: Date },
    shields: { type: Number, default: 0 },
    unlockedIslands: { type: [String], default: [] },
    badges: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
