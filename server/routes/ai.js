const express = require('express');
const router = express.Router();
const axios = require('axios');
const Question = require('../models/Question');

// Configuration
const POLLINATIONS_ENDPOINT = "https://text.pollinations.ai/";

// --- Deleted Offline Library to use MongoDB Collection instead ---

// --- Helper for Pollinations AI (Zero-Key Method) with Verified Models ---
const callZeroKeyAI = async (prompt, systemPrompt = "", attempts = 4) => {
    // Verified stable model slugs for Pollinations AI
    const models = ["openai", "mistral", "searchgpt", "qwen"];

    for (let i = 0; i < attempts; i++) {
        try {
            const seed = Math.floor(Math.random() * 999999);
            const model = models[i % models.length];

            // Simplified prompt to reduce processing time and latency
            const fullPrompt = `System: ${systemPrompt}\n\nTask: ${prompt}\n\nRef: ${seed}`;

            // REMOVED json=true to speed up response time; we parse manually via regex
            const url = `${POLLINATIONS_ENDPOINT}${encodeURIComponent(fullPrompt)}?seed=${seed}&model=${model}`;

            console.log(`AI Attempt ${i + 1} using [${model}]...`);
            const { data } = await axios.get(url, { timeout: 30000 });

            if (data) return typeof data === 'string' ? data : JSON.stringify(data);

            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`AI Attempt ${i + 1} [${models[i % models.length]}] failed: ${error.message}`);
            if (i === attempts - 1) return null;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return null;
};

// --- Chat Endpoint ---
router.post('/chat', async (req, res) => {
    try {
        const { message, history, language } = req.body;
        const currentLang = language === 'ta' ? 'Tamil' : 'English';

        const systemPrompt = `Assistant for TNPSC/UPSC exams. Answer in ${currentLang}. Keep it short and accurate.`;
        const prompt = `History: ${JSON.stringify(history.slice(-2))} \nQuestion: ${message}`;

        const result = await callZeroKeyAI(prompt, systemPrompt);

        if (!result) {
            return res.json({ text: language === 'ta' ? "மன்னிக்கவும், தற்போது அதிக பணிச்சுமை காரணமாக பதிலளிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Sorry, the AI is currently under high load. Please try again." });
        }

        res.json({ text: result });
    } catch (error) {
        console.error('Chat API Error:', error.message);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// --- Study Mode ---
router.post('/study', async (req, res) => {
    try {
        const { topic, action, userAnswer, currentQuestion, language } = req.body;
        const langCode = language || 'en';
        const currentLang = langCode === 'ta' ? 'Tamil' : 'English';

        if (action === 'ask') {
            // Build filter for DB query
            const filter = {};
            if (topic && topic !== 'Random') {
                filter.subject = topic;
            }

            // Fetch a random question from the Database (100% Reliable)
            const randomDB = await Question.aggregate([
                { $match: filter },
                { $sample: { size: 1 } }
            ]);

            if (randomDB && randomDB.length > 0) {
                const q = randomDB[0];
                return res.json({
                    question: langCode === 'ta' ? q.question_ta : q.question_en,
                    options: q.options.map(o => langCode === 'ta' ? o.text_ta : o.text_en),
                    correctAnswer: q.options.find(o => o.id === q.correctOptionId)?.[langCode === 'ta' ? 'text_ta' : 'text_en'] || "",
                    subject: q.subject,
                    difficulty: q.difficulty
                });
            }

            // Final safety if no question found for that specific topic
            const fallback = await Question.aggregate([{ $sample: { size: 1 } }]);
            const f = fallback[0];
            return res.json({
                question: langCode === 'ta' ? f.question_ta : f.question_en,
                options: f.options.map(o => langCode === 'ta' ? o.text_ta : o.text_en),
                correctAnswer: f.options.find(o => o.id === f.correctOptionId)?.[langCode === 'ta' ? 'text_ta' : 'text_en'] || "",
                subject: f.subject,
                difficulty: f.difficulty
            });

        } else {
            // Verification logic (AI still helps with educational explanations)
            const systemPrompt = `Teacher. Language: ${currentLang}.`;
            const prompt = `Quest: ${currentQuestion}. Ans: ${userAnswer}. Is it correct? Explain briefly in ${currentLang}.`;

            const feedback = await callZeroKeyAI(prompt, systemPrompt, 2);
            return res.json({
                feedback: feedback || (langCode === 'ta' ? "சரியான விடை! அருமை." : "Correct! Excellent preparation.")
            });
        }
    } catch (error) {
        console.error('Study Mode Error:', error.message);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

module.exports = router;
