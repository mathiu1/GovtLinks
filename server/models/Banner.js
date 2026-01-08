const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_ta: { type: String, required: true },
    desc_en: { type: String, required: true },
    desc_ta: { type: String, required: true },
    image: { type: String, required: true },
    gradient: { type: String, default: "from-blue-600 to-indigo-800" },
    link: { type: String }, // Optional link to a detail page
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', BannerSchema);
