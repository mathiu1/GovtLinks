const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_ta: { type: String, required: true },
    category: { type: String, enum: ['Service', 'Scheme', 'Exam'], required: true },
    sub_category: { type: String }, // e.g., Identity, Agriculture, etc.
    description_en: String,
    description_ta: String,
    steps: [{
        title_en: String,
        desc_en: String,
        title_ta: String,
        desc_ta: String
    }],
    official_link: String,
    youtube_link: String
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
