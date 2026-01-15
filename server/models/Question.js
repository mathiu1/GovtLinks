const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    examType: { type: String, required: true, index: true }, // e.g., "TNPSC Group 4"
    subject: { type: String, required: true, index: true }, // e.g., "General Tamil"

    question_en: { type: String, required: true },
    question_ta: { type: String, required: true },

    options: [{
        id: String, // 'A', 'B', 'C', 'D'
        text_en: String,
        text_ta: String
    }],

    correctOptionId: { type: String, required: true }, // 'A'

    explanation_en: String,
    explanation_ta: String,

    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [String] // e.g., "History", "Grammar"
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
