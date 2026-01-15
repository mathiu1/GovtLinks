const express = require('express');
const router = express.Router();
const googleTTS = require('google-tts-api');

// GET /api/tts?text=Hello&lang=en
router.get('/', async (req, res) => {
    try {
        const { text, lang } = req.query;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Split text into chunks if it's long (>200 chars)
        // google-tts-api handles intelligent splitting (punctuation-aware)
        const results = googleTTS.getAllAudioUrls(text, {
            lang: lang || 'en',
            slow: false,
            host: 'https://translate.google.com',
            splitPunctuation: true,
        });

        // results is an array of { url: string, shortText: string, ... }
        res.json(results);

    } catch (err) {
        console.error('TTS Error:', err);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

module.exports = router;
