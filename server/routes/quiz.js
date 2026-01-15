const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Get Quiz Questions (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { exam, subject, difficulty, limit = 10 } = req.query;
        let query = {};

        if (exam) {
            const exams = exam.split(',');
            query.examType = { $in: exams };
        }
        if (subject && subject !== 'All Subjects') {
            const subjects = subject.split(',');
            query.subject = { $in: subjects };
        }
        if (difficulty && difficulty !== 'All Levels') query.difficulty = difficulty.toLowerCase();

        // Get random questions
        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: Number(limit) } }
        ]);

        // If not enough questions found matching strict criteria, fallback to just exam type to ensure user sees something
        if (questions.length < 1 && exam) {
            const fallback = await Question.aggregate([
                { $match: { examType: exam } },
                { $sample: { size: Number(limit) } }
            ]);
            return res.json(fallback);
        }

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit Answer (Stub for now, can be expanded to save user progress)
router.post('/submit', async (req, res) => {
    // In future: Save to UserProgress model
    res.json({ message: 'Answer recorded' });
});

module.exports = router;
