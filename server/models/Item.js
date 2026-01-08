const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_ta: { type: String, required: true },
    category: { type: String, enum: ['Service', 'Scheme', 'Exam', 'Job'], required: true, index: true }, // Indexed
    sub_category: { type: String, index: true }, // Indexed
    description_en: String,
    description_ta: String,
    steps: [{
        title_en: String,
        desc_en: String,
        title_ta: String,
        desc_ta: String
    }],
    official_links: [{
        url: String,
        label_en: String,
        label_ta: String
    }],
    youtube_links: [String],

    // New Fields for Jobs & Exams
    vacancies: String,
    applicationStartDate: Date,
    applicationEndDate: Date,
    examDate: Date,
    location: String
}, { timestamps: true });

// Compound index for frequent filtering scenario
itemSchema.index({ category: 1, createdAt: -1 });
// Single index for global sort
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
