const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'No token' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        next();
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Update quiz results (Reward XP, handle streaks)
router.post('/quiz-result', auth, async (req, res) => {
    try {
        const { score, totalQuestions, bonus, mode, multiplier } = req.body;
        const user = req.user;

        // Reward XP: 10 per correct answer + bonus, with optional multiplier
        const baseXP = (score * 10);
        const xpGained = (baseXP * (multiplier || 1)) + (bonus || 0);

        // Migrate Legacy Users: If totalXP is 0 but they have XP, sync it once.
        if (!user.totalXP || user.totalXP < user.xp) {
            user.totalXP = user.xp;
        }

        user.xp = (user.xp || 0) + xpGained;       // Spendable Balance
        user.totalXP = (user.totalXP || 0) + xpGained; // Lifetime Progress for Levels

        // Hardcore Scaling Level Up Logic (Based on TOTAL XP now):
        // L1->L2: 200 XP
        // L2->L3: 400 XP
        // L3->L4: 600 XP
        // ... (NextXP = Level * 200)
        let newLevel = 1;
        let xpThreshold = 200; // Steep Starting Point
        let tempTotalXP = user.totalXP; // USE TOTAL XP FOR LEVELING

        while (tempTotalXP >= xpThreshold) {
            tempTotalXP -= xpThreshold;
            newLevel++;
            xpThreshold += 200; // Steep Increment (+200 each level)
        }

        const leveledUp = newLevel > user.level;
        user.level = newLevel;

        // Streak Logic
        const now = new Date();
        const lastQuiz = user.lastQuizDate ? new Date(user.lastQuizDate) : null;
        if (lastQuiz) {
            const diffDays = Math.floor((now - lastQuiz) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                user.streak += 1;
            } else if (diffDays > 1) {
                user.streak = 1;
            }
        } else {
            user.streak = 1;
        }

        // Badge Logic
        const newBadges = [];
        const existingBadges = user.badges || [];

        // 1. First Step
        if (!existingBadges.includes('First Step')) {
            newBadges.push('First Step');
        }
        // 2. High Flyer (Level 5)
        if (!existingBadges.includes('High Flyer') && user.level >= 5) {
            newBadges.push('High Flyer');
        }
        // 3. Streak Master (3 Days)
        if (!existingBadges.includes('Streak Master') && user.streak >= 3) {
            newBadges.push('Streak Master');
        }
        // 4. Quiz God (100% Score)
        if (!existingBadges.includes('Quiz God') && score === totalQuestions && totalQuestions >= 5) {
            newBadges.push('Quiz God');
        }
        // 5. Survivor (Survival Mode Score > 20)
        if (mode === 'survival' && !existingBadges.includes('Survivor') && score >= 20) {
            newBadges.push('Survivor');
        }
        // 6. Speedster (Speed Run Score > 15)
        if (mode === 'speedrun' && !existingBadges.includes('Speedster') && score >= 15) {
            newBadges.push('Speedster');
        }

        if (newBadges.length > 0) {
            user.badges = [...existingBadges, ...newBadges];
        }

        user.lastQuizDate = now;
        await user.save();

        res.json({
            message: 'Stats updated',
            xpGained,
            leveledUp,
            newBadges,
            user: {
                xp: user.xp,
                level: user.level,
                streak: user.streak,
                shields: user.shields,
                badges: user.badges,
                totalXP: user.totalXP,
                unlockedIslands: user.unlockedIslands
            }
        });
    } catch (error) {
        console.error("Gamification Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
});

// Update Shields (called when user wins or buys a shield)
router.post('/update-shields', auth, async (req, res) => {
    try {
        const { change } = req.body; // e.g. +1 or -1
        req.user.shields = Math.max(0, (req.user.shields || 0) + change);
        await req.user.save();
        res.json({ shields: req.user.shields });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Buy Island with XP
router.post('/buy-island', auth, async (req, res) => {
    try {
        const { islandId } = req.body;
        const user = req.user;

        const PURCHASE_COST = 300;

        if (user.xp < PURCHASE_COST) {
            return res.status(400).json({ message: 'Insufficient XP. You need 300 XP to buy this island.' });
        }

        if (user.unlockedIslands.includes(islandId)) {
            return res.status(400).json({ message: 'Island already unlocked.' });
        }

        // Deduct XP and add to unlocked list
        user.xp -= PURCHASE_COST;
        user.unlockedIslands.push(islandId.toString());

        await user.save();

        res.json({
            message: 'Island purchased successfully!',
            user: {
                xp: user.xp,
                level: user.level,
                streak: user.streak,
                shields: user.shields,
                badges: user.badges,
                totalXP: user.totalXP,
                unlockedIslands: user.unlockedIslands
            }
        });
    } catch (error) {
        console.error("Buy Island Error:", error);
        res.status(500).json({ message: 'Server error during purchase' });
    }
});

// Spend XP on Game Power-ups
router.post('/use-powerup', auth, async (req, res) => {
    try {
        const { type } = req.body;
        const user = req.user;

        const costs = {
            'revive': 200,
            'hint': 50,
            'magnet': 100,
            'freeze': 150,
            'swap': 150,
            'shield': 125,
            'boost': 200,
            'xray': 250,
            'snap': 180,
            'overtime': 100,
            'autopilot': 500
        };

        const cost = costs[type] || 0;

        if (user.xp < cost) {
            return res.status(400).json({ message: `Insufficient XP. You need ${cost} XP for this power-up.` });
        }

        user.xp -= cost;
        await user.save();

        res.json({
            message: 'Power-up purchased!',
            user: {
                xp: user.xp,
                level: user.level,
                streak: user.streak,
                shields: user.shields,
                badges: user.badges,
                totalXP: user.totalXP,
                unlockedIslands: user.unlockedIslands
            }
        });
    } catch (error) {
        console.error("Power-up Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
