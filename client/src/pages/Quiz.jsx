import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiGlobe, FiCpu, FiCheckCircle, FiXCircle, FiArrowRight, FiAward, FiShare2, FiHelpCircle, FiBookOpen, FiActivity, FiTarget, FiFilter, FiClock } from 'react-icons/fi';
import API from '../api';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const CATEGORIES = [
    { id: 'TNPSC Group 4', name: 'TNPSC Group 4', icon: '🏛️', color: 'from-blue-500 to-indigo-600' },
    { id: 'UPSC', name: 'UPSC Civil Services', icon: '🇮🇳', color: 'from-orange-500 to-red-600' },
    { id: 'Railways', name: 'Railways (RRB)', icon: '🚂', color: 'from-emerald-500 to-teal-600' },
    { id: 'SSC', name: 'SSC CGL/CHSL', icon: '📊', color: 'from-purple-500 to-pink-600' },
    { id: 'Police', name: 'Police Constable', icon: '👮', color: 'from-slate-600 to-slate-800' },
    { id: 'Banking', name: 'Banking & PO', icon: '🏦', color: 'from-cyan-500 to-blue-600' }
];

const SUBJECTS = ["All Subjects", "General Tamil", "History", "INM", "Polity", "Geography", "Economics", "Science", "Biology", "Botany", "Zoology", "Physics", "Chemistry", "Environment", "Agriculture", "TN Administration", "Art & Culture", "Indian Culture", "Psychology", "Teaching Aptitude", "Research Aptitude", "Communication", "World History", "Computer", "Cyber Security", "Sports", "Books & Authors", "Important Days", "Awards & Honours", "Organizations", "Govt Schemes", "Disaster Management", "Banking Awareness", "Marketing", "Insurance", "Accounting", "Labour Laws", "General Knowledge", "English", "Reasoning", "Aptitude"];
const DIFFICULTIES = ["All Levels", "Easy", "Medium", "Hard"];

import QuizLayout from '../components/QuizLayout';

const Quiz = ({ isSidebarOpen, closeSidebar, handleTopicClick }) => {
    const { language } = useContext(LanguageContext);
    const { user, updateUser } = useContext(AuthContext); // Get user context for updates
    const location = useLocation();
    const gameMode = location.state?.mode || 'standard'; // 'standard', 'survival', 'speedrun'

    // UI State Steps: 'category' -> 'filter' -> 'quiz'
    const [step, setStep] = useState(location.state?.mode ? 'quiz' : 'category');

    // Game State
    const [lives, setLives] = useState(3);
    const [xpEarned, setXpEarned] = useState(0);

    // Selection State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");

    // Quiz State
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcriptDebug, setTranscriptDebug] = useState("");
    const [newBadges, setNewBadges] = useState([]); // Store badges won in this session

    const [autoRead, setAutoRead] = useState(false);
    const [timeLeft, setTimeLeft] = useState(gameMode === 'speedrun' ? 120 : 30); // 120s for speedrun total, 30s per q for others

    // AI Explanation State
    const [aiExplanation, setAiExplanation] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);


    // Audio State
    const [currentAudio, setCurrentAudio] = useState(null);

    const stopSpeaking = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        setCurrentAudio(null);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    const playAudio = async (text, lang) => {
        stopSpeaking();
        try {
            const res = await API.get(`/tts?text=${encodeURIComponent(text)}&lang=${lang}`);
            const chunks = res.data;
            if (chunks.length === 0) return;
            let index = 0;
            const playNext = () => {
                if (index >= chunks.length) {
                    setCurrentAudio(null);
                    return;
                }
                const audio = new Audio(chunks[index].url);
                setCurrentAudio(audio);
                audio.play().catch(e => console.error(e));
                audio.onended = () => {
                    index++;
                    playNext();
                };
            };
            playNext();
        } catch (err) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        if (step === 'quiz' && !loading && questions.length > 0 && autoRead) {
            const timer = setTimeout(() => {
                readQuestion();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentQuestionIndex, loading, questions, autoRead, step]);

    // Timer Logic
    useEffect(() => {
        if (step !== 'quiz' || loading || quizCompleted || selectedOption) return;

        if (timeLeft === 0) {
            handleNext();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, step, loading, quizCompleted, selectedOption, gameMode]);


    // Reset timer on question change (ONLY for standard/survival, NOT speedrun)
    useEffect(() => {
        if (gameMode !== 'speedrun') {
            setTimeLeft(30);
        }
    }, [currentQuestionIndex, gameMode]);

    // Auto-start for special modes
    useEffect(() => {
        if ((gameMode === 'survival' || gameMode === 'speedrun') && step === 'quiz' && questions.length === 0 && !loading) {
            startQuiz();
        }
    }, [gameMode, step, questions.length, loading]);

    // Fetch quiz based on selections
    const startQuiz = async () => {
        try {
            setStep('quiz');
            setLoading(true);

            const params = new URLSearchParams();
            params.append('limit', '10');

            if (selectedCategory) {
                params.append('exam', selectedCategory.id);
            } else if (gameMode === 'survival' || gameMode === 'speedrun') {
                // Default to a popular category if none selected for instant play
                params.append('exam', 'TNPSC Group 4');
            }

            if (selectedSubjects.length > 0 && !(selectedSubjects.length === 1 && selectedSubjects[0] === "All Subjects")) {
                // If "All Subjects" is selected along with others, we might want to just ignore "All Subjects" or handle it.
                // Assuming normal usage:
                const validSubjects = selectedSubjects.filter(s => s !== "All Subjects");
                if (validSubjects.length > 0) {
                    params.append('subject', validSubjects.join(','));
                }
            }

            if (selectedDifficulty && selectedDifficulty !== "All Levels") {
                params.append('difficulty', selectedDifficulty);
            }

            // Game Mode Specific Config
            if (gameMode === 'speedrun') {
                params.append('limit', '20'); // 20 questions for speedrun
            }
            if (gameMode === 'survival') {
                params.append('limit', '50'); // Endless-ish for survival
            }

            const res = await API.get(`/quiz?${params.toString()}`);

            // If API returns empty (strict filter), show warning or handle gracefully
            // If API returns empty (strict filter), handle fallback
            if (res.data.length === 0) {
                const validSubjects = selectedSubjects.filter(s => s !== "All Subjects");

                if (validSubjects.length > 0) {
                    // Fallback: Priority on SUBJECT. If Science is missing for Exam X, show Science from Exam Y.
                    alert(`No questions found for ${selectedCategory.name} with these specific subjects. Loading questions for these subjects from other categories.`);
                    const subjectParam = validSubjects.join(',');
                    const fallbackRes = await API.get(`/quiz?limit=10&subject=${encodeURIComponent(subjectParam)}`);

                    // If still empty (e.g. subject doesn't exist anywhere), then fallback to Exam
                    if (fallbackRes.data.length === 0) {
                        alert(`No questions found for these subjects anywhere. Loading mixed questions for ${selectedCategory.name}.`);
                        const finalFallback = await API.get(`/quiz?limit=10&exam=${encodeURIComponent(selectedCategory.id)}`);
                        setQuestions(finalFallback.data);
                    } else {
                        // Interleave the subject fallback results
                        const interleaved = [];
                        const groups = {};
                        fallbackRes.data.forEach(q => {
                            if (!groups[q.subject]) groups[q.subject] = [];
                            groups[q.subject].push(q);
                        });
                        const groupKeys = Object.keys(groups);
                        const maxLen = Math.max(...groupKeys.map(k => groups[k].length));
                        for (let i = 0; i < maxLen; i++) {
                            groupKeys.forEach(k => {
                                if (groups[k][i]) interleaved.push(groups[k][i]);
                            });
                        }
                        setQuestions(interleaved);
                    }
                } else {
                    // Fallback: No specific subjects, just show Exam questions
                    alert(`No questions found. Loading mixed questions for ${selectedCategory.name}.`);
                    const fallbackRes = await API.get(`/quiz?limit=10&exam=${encodeURIComponent(selectedCategory.id)}`);
                    setQuestions(fallbackRes.data);
                }
            } else {
                // Interleave logic (Subject shuffle)
                const interleaved = [];
                const groups = {};

                // Group by subject
                res.data.forEach(q => {
                    if (!groups[q.subject]) groups[q.subject] = [];
                    groups[q.subject].push(q);
                });

                const groupKeys = Object.keys(groups);
                const maxLen = Math.max(...groupKeys.map(k => groups[k].length));

                for (let i = 0; i < maxLen; i++) {
                    groupKeys.forEach(k => {
                        if (groups[k][i]) interleaved.push(groups[k][i]);
                    });
                }

                setQuestions(interleaved);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to load quiz", error);
            setLoading(false);
        }
    };



    // Fetch AI Explanation
    const fetchAIExplanation = async (question, answer, options) => {
        setLoadingAI(true);
        setAiExplanation(null);
        try {
            const res = await API.post('/ai/explain', {
                question,
                answer,
                options: options.map(o => o.text_en), // Send English text for better AI context
                language
            });
            setAiExplanation(res.data.text);
        } catch (error) {
            console.error("AI Explain Error", error);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleOptionClick = (optionId) => {
        if (selectedOption) return;
        setSelectedOption(optionId);
        const currentQ = questions[currentQuestionIndex];
        const isTa = language !== 'en';

        // Trigger AI Explanation if static explanation is missing or user just answered
        // We always fetch it now to give that "AI" feel the user asked for
        const correctOptText = currentQ.options.find(o => o.id === currentQ.correctOptionId)?.[language === 'en' ? 'text_en' : 'text_ta'];
        fetchAIExplanation(
            language === 'en' ? currentQ.question_en : currentQ.question_ta,
            correctOptText,
            currentQ.options
        );

        if (optionId === currentQ.correctOptionId) {
            setScore(score + 1);
            if (autoRead) speak(isTa ? "சரியான பதில்!" : "Correct Answer!", isTa ? 'ta-IN' : 'en-US');

            // Confetti for correct answer
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#3B82F6']
            });

        } else {
            if (autoRead) speak(isTa ? "அது தவறான பதில்." : "That is incorrect.", isTa ? 'ta-IN' : 'en-US');

            // Survival Mode Logic
            if (gameMode === 'survival') {
                setLives(prev => prev - 1);
                // Shake effect or sound could go here
                if (lives <= 1) {
                    // Game Over logic handled in next render or effect, but let's delay it to show explanation
                    setTimeout(() => finishQuiz(score), 4000); // Give time to read explanation
                }
            }
        }
        setShowExplanation(true);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (step !== 'quiz' || loading || quizCompleted || selectedOption) return;
            const key = e.key.toUpperCase();
            const validKeys = ['A', 'B', 'C', 'D', '1', '2', '3', '4'];
            if (!validKeys.includes(key)) return;

            let index = -1;
            if (key >= '1' && key <= '4') index = parseInt(key) - 1;
            else if (key === 'A') index = 0;
            else if (key === 'B') index = 1;
            else if (key === 'C') index = 2;
            else if (key === 'D') index = 3;

            if (index !== -1 && questions[currentQuestionIndex]?.options[index]) {
                handleOptionClick(questions[currentQuestionIndex].options[index].id);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, loading, quizCompleted, selectedOption, currentQuestionIndex, questions]);

    const handleNext = () => {
        if (gameMode === 'survival' && lives <= 0) {
            finishQuiz(score);
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setShowExplanation(false);
            setAiExplanation(null); // Reset AI
            stopSpeaking();
        } else {
            finishQuiz(score + (selectedOption === questions[currentQuestionIndex]?.correctOptionId ? 1 : 0));
        }
    };

    const finishQuiz = async (finalScore) => {
        setQuizCompleted(true);
        stopSpeaking();

        // Calculate XP
        let bonus = 0;
        if (gameMode === 'survival') bonus = finalScore * 5; // Bonus for survival
        if (gameMode === 'speedrun' && timeLeft > 0) bonus = timeLeft * 2; // Time bonus

        try {
            if (user) {
                const res = await API.post('/gamification/quiz-result', {
                    score: finalScore,
                    totalQuestions: questions.length,
                    bonus,
                    mode: gameMode
                });
                setXpEarned(res.data.xpGained);
                if (res.data.newBadges && res.data.newBadges.length > 0) {
                    setNewBadges(res.data.newBadges);
                    // More confetti!
                    setTimeout(() => {
                        confetti({
                            particleCount: 150,
                            spread: 100,
                            origin: { y: 0.6 },
                            colors: ['#FFD700', '#FFA500']
                        });
                    }, 500);
                }
                updateUser(res.data.user);
            }
        } catch (error) {
            console.error("Failed to save progress", error);
        }

        const msg = language === 'en'
            ? `Quiz completed. You scored ${finalScore}`
            : `வினாடி வினா முடிந்தது. உங்கள் மதிப்பெண் ${finalScore}`;
        if (autoRead) speak(msg, language === 'en' ? 'en-US' : 'ta-IN');
    };

    const speak = (text, lang = 'en-US') => {
        const targetLang = lang === 'ta' || lang === 'ta-IN' ? 'ta' : 'en';
        playAudio(text, targetLang);
    };

    const readQuestion = () => {
        const currentQ = questions[currentQuestionIndex];
        if (!currentQ) return;
        const langCode = language === 'en' ? 'en' : 'ta';
        let fullText = language === 'en' ? currentQ.question_en : currentQ.question_ta;
        currentQ.options.forEach(opt => {
            const optText = language === 'en' ? opt.text_en : opt.text_ta;
            fullText += `. ${language === 'en' ? 'Option' : ''} ${opt.id}. ${optText}`;
        });
        playAudio(fullText, langCode);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Use Chrome for Voice.");
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'en' ? 'en-US' : 'ta-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            checkVoiceAnswer(transcript);
            setIsListening(false);
        };
        recognition.start();
    };

    const checkVoiceAnswer = (transcript) => {
        const currentQ = questions[currentQuestionIndex];
        let matchedId = null;
        const t = transcript.toLowerCase();
        if (['option a', 'a'].some(v => t.includes(v))) matchedId = "A";
        else if (['option b', 'b'].some(v => t.includes(v))) matchedId = "B";
        else if (['option c', 'c'].some(v => t.includes(v))) matchedId = "C";
        else if (['option d', 'd'].some(v => t.includes(v))) matchedId = "D";

        if (matchedId) handleOptionClick(matchedId);
    };

    const restartQuiz = () => {
        setStep('category');
        setScore(0);
        setCurrentQuestionIndex(0);
        setQuizCompleted(false);
        setSelectedOption(null);
        setShowExplanation(false);
        setSelectedCategory(null);
        setSelectedSubjects([]);
    };

    // --- RENDER STEPS ---

    // 1. SELECT CATEGORY
    if (step === 'category') {
        return (
            <QuizLayout isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} handleTopicClick={handleTopicClick} language={language}>
                <div className="min-h-screen pt-8 pb-12 px-4 md:px-8 bg-slate-50 dark:bg-[#0B1120]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                                Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Exam Category</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">
                                Choose an exam board to practice real previous year questions tailored to your syllabus.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
                            {CATEGORIES.map((cat) => (
                                <motion.button
                                    key={cat.id}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setStep('filter');
                                    }}
                                    className="group relative bg-white dark:bg-slate-900 rounded-3xl p-1 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-black/20 text-left transition-all"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                                    <div className="relative p-5 md:p-6 h-full flex flex-col items-center text-center space-y-4">
                                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl md:text-4xl shadow-lg`}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {cat.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium">1500+ Questions</p>
                                        </div>
                                        <div className="mt-auto pt-4 md:opacity-0 md:group-hover:opacity-100 transition-all transform md:translate-y-2 md:group-hover:translate-y-0">
                                            <span className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full md:bg-transparent md:px-0 md:py-0">
                                                Start Practice <FiArrowRight />
                                            </span>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Desktop Next Button */}

                    </div>
                </div>
            </QuizLayout >
        );
    }

    // 2. FILTER OPTIONS
    if (step === 'filter') {
        return (
            <QuizLayout isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} handleTopicClick={handleTopicClick} language={language}>
                <div className="min-h-screen pt-8 pb-12 px-4 flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
                        <button
                            onClick={() => setStep('category')}
                            className="absolute top-4 left-4 md:top-6 md:left-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs uppercase tracking-widest p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            ← Back
                        </button>

                        <div className="text-center mb-8 mt-6">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCategory.color} mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                                {selectedCategory.icon}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
                                Configure Quiz
                            </h2>
                            <p className="text-slate-500 text-sm md:text-base mt-2">Customize your practice session for {selectedCategory.name}</p>
                        </div>

                        <div className="space-y-8">
                            {/* Subject */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                    <FiBookOpen className="text-blue-500" /> Select Subject
                                </label>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    {SUBJECTS.map(sub => {
                                        const isSelected = selectedSubjects.includes(sub);
                                        return (
                                            <button
                                                key={sub}
                                                onClick={() => {
                                                    if (sub === "All Subjects") {
                                                        // "All Subjects" usually implies clearing specific selections or just selecting it alone
                                                        setSelectedSubjects(["All Subjects"]);
                                                    } else {
                                                        let newSubs = [...selectedSubjects];
                                                        if (newSubs.includes("All Subjects")) {
                                                            newSubs = newSubs.filter(s => s !== "All Subjects");
                                                        }

                                                        if (isSelected) {
                                                            newSubs = newSubs.filter(s => s !== sub);
                                                        } else {
                                                            newSubs.push(sub);
                                                        }
                                                        // If nothing left, maybe default back to something or empty
                                                        if (newSubs.length === 0) newSubs = ["All Subjects"];
                                                        setSelectedSubjects(newSubs);
                                                    }
                                                }}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex-grow md:flex-grow-0 ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-md shadow-blue-500/10'
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-blue-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                                    }`}
                                            >
                                                {sub}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                    <FiTarget className="text-emerald-500" /> Select Difficulty
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {DIFFICULTIES.map(diff => (
                                        <button
                                            key={diff}
                                            onClick={() => setSelectedDifficulty(diff)}
                                            className={`px-2 py-3 rounded-xl text-sm font-bold border-2 transition-all ${selectedDifficulty === diff
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-md shadow-emerald-500/10'
                                                : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-emerald-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                                }`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={startQuiz}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Start Quiz ({selectedSubjects.length > 0 ? selectedSubjects.length : 'All'}) <FiActivity />
                            </button>
                        </div>
                    </div>
                </div>
            </QuizLayout>
        );
    }

    // 3. QUIZ INTERFACE - Redesigned
    if (loading) {
        return (
            <QuizLayout>
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-bold text-lg animate-pulse">Designing your quiz...</p>
                    </div>
                </div>
            </QuizLayout>
        );
    }

    if (quizCompleted) {
        return (
            <QuizLayout>
                <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120] text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-lg w-full border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-5xl mb-6 shadow-xl shadow-orange-500/30">
                            <FiAward />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                            {gameMode === 'survival' && lives <= 0 ? (language === 'en' ? 'Game Over!' : 'ஆட்டம் முடிந்தது!') : (language === 'en' ? 'Quiz Completed!' : 'வினாடி வினா முடிந்தது!')}
                        </h2>
                        <p className="text-slate-500 mb-4 text-lg">You scored <span className="text-blue-600 font-bold text-3xl">{score}</span> / <span className="font-bold text-2xl">{questions.length}</span></p>

                        {user && (
                            <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">XP Earned</p>
                                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">+{xpEarned} XP</p>
                            </div>
                        )}

                        {newBadges.length > 0 && (
                            <div className="mb-8 animate-bounce">
                                <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-2">Badge Unlocked!</p>
                                <div className="flex justify-center gap-4">
                                    {newBadges.map(badge => (
                                        <div key={badge} className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-700 font-bold shadow-sm">
                                            🏅 {badge}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={restartQuiz} className="py-4 px-6 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Select New Topic
                            </button>
                            <button onClick={() => {
                                setQuizCompleted(false);
                                setCurrentQuestionIndex(0);
                                setScore(0);
                                setSelectedOption(null);
                                setShowExplanation(false);
                                setNewBadges([]);
                            }} className="py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                                Retry Quiz
                            </button>
                        </div>
                    </motion.div>
                </div>
            </QuizLayout>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return null;

    return (
        <QuizLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-24 md:pb-12">
                {/* Sticky Header - Adjusted for sidebar and navbar overlap */}
                <div className="fixed top-20 left-0 lg:left-72 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Question</h2>
                            <span className="text-xl font-black text-slate-800 dark:text-white">
                                {currentQuestionIndex + 1} <span className="text-slate-400 text-base font-medium">/ {gameMode === 'survival' ? '∞' : questions.length}</span>
                            </span>
                        </div>



                        <div className="flex items-center gap-4">
                            {gameMode === 'survival' && (
                                <div className="flex items-center gap-1 mr-2">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.span
                                            key={i}
                                            animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.3 }}
                                            className="text-2xl"
                                        >
                                            ❤️
                                        </motion.span>
                                    ))}
                                </div>
                            )}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-lg border ${timeLeft <= 10 ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800' : 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800'}`}>
                                <FiClock className={timeLeft <= 10 ? 'animate-pulse' : ''} />
                                <span>{timeLeft}s</span>
                                {gameMode === 'speedrun' && <span className="text-xs uppercase ml-1">Total</span>}
                            </div>
                        </div>
                    </div>

                    {/* Center Badges for Desktop (absolute positioning to keep center) */}
                    <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider">
                            {currentQ.examType}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 text-xs font-bold uppercase tracking-wider">
                            {currentQ.subject}
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${(currentQ.difficulty || selectedDifficulty) === 'easy' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50' :
                            (currentQ.difficulty || selectedDifficulty) === 'hard' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/50' :
                                'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/50'
                            }`}>
                            {currentQ.difficulty ? currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1) : selectedDifficulty}
                        </div>
                    </div>

                    {/* Mobile Badges (Scrollable if needed, compact) */}
                    <div className="md:hidden flex overflow-x-auto no-scrollbar gap-2 px-4 pb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 uppercase tracking-wide border border-slate-200 dark:border-slate-700">{currentQ.examType}</span>
                        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 uppercase tracking-wide border border-blue-100 dark:border-blue-900/50">{currentQ.subject}</span>
                        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-700 dark:text-amber-400 uppercase tracking-wide border border-amber-100 dark:border-amber-900/50">{currentQ.difficulty || selectedDifficulty}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                        <motion.div
                            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                    </div>
                </div>

                <div className="pt-28 md:pt-24 px-4 md:px-8 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={startListening}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${isListening
                                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/30'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500'
                                    }`}
                            >
                                🎤 <span className="hidden md:inline">{isListening ? 'Listening...' : 'Voice Answer'}</span>
                                <span className="md:hidden">Voice</span>
                            </button>
                            <button
                                onClick={() => setAutoRead(!autoRead)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-xl font-bold text-sm transition-all shadow-sm border ${autoRead
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                                    }`}
                            >
                                🔊 <span className="hidden md:inline">{autoRead ? 'Read Aloud: ON' : 'Read Aloud: OFF'}</span>
                                <span className="md:hidden">{autoRead ? 'Read: ON' : 'Read: OFF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Question Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2rem] p-6 md:p-10 shadow-lg md:shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800"
                    >
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed text-slate-900 dark:text-white mb-8 tracking-tight">
                            {language === 'en' ? currentQ.question_en : currentQ.question_ta}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {currentQ.options.map((opt) => {
                                const isSelected = selectedOption === opt.id;
                                const isCorrect = opt.id === currentQ.correctOptionId;

                                let baseStyle = "p-4 md:p-5 rounded-xl md:rounded-2xl border-2 text-left transition-all active:scale-[0.99] flex items-center md:items-start gap-3 md:gap-4 relative group touch-manipulation";
                                let statusStyle = "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40";

                                if (selectedOption) {
                                    if (isCorrect) statusStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500 z-10";
                                    else if (isSelected) statusStyle = "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500 z-10";
                                    else statusStyle = "opacity-50 border-slate-100 dark:border-slate-800 grayscale";
                                } else {
                                    statusStyle += " hover:border-blue-400 dark:hover:border-slate-500 hover:shadow-md dark:hover:shadow-none hover:bg-white dark:hover:bg-slate-800";
                                }

                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionClick(opt.id)}
                                        disabled={!!selectedOption}
                                        className={`${baseStyle} ${statusStyle}`}
                                    >
                                        <span className={`shrink-0 w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-sm font-black transition-colors ${selectedOption && isCorrect ? 'bg-emerald-500 text-white' :
                                            selectedOption && isSelected ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-600 group-hover:border-blue-400 group-hover:text-blue-500'
                                            }`}>
                                            {opt.id}
                                        </span>
                                        <span className={`font-semibold text-base md:text-lg leading-snug ${selectedOption && (isCorrect || isSelected) ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {language === 'en' ? opt.text_en : opt.text_ta}
                                        </span>

                                        {selectedOption && isCorrect && <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-2xl drop-shadow-sm" />}
                                        {selectedOption && isSelected && !isCorrect && <FiXCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-2xl drop-shadow-sm" />}
                                    </button>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {showExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    className="mt-6 md:mt-8 overflow-hidden"
                                >
                                    <div className={`border p-5 md:p-6 rounded-2xl ${selectedOption === currentQ.correctOptionId
                                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                        : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                        }`}>
                                        <h4 className={`flex items-center gap-2 font-black uppercase text-sm tracking-widest mb-3 ${selectedOption === currentQ.correctOptionId
                                            ? 'text-emerald-700 dark:text-emerald-400'
                                            : 'text-red-700 dark:text-red-400'
                                            }`}>
                                            {selectedOption === currentQ.correctOptionId ? (
                                                <><FiCheckCircle className="text-lg" /> {language === 'en' ? 'Correct Answer!' : 'சரியான பதில்!'}</>
                                            ) : (
                                                <><FiXCircle className="text-lg" /> {language === 'en' ? 'Incorrect Answer' : 'தவறான பதில்'}</>
                                            )}
                                        </h4>

                                        {(language === 'en' ? currentQ.explanation_en : currentQ.explanation_ta) && (
                                            <>
                                                <div className="h-px w-full bg-slate-200 dark:bg-slate-700/50 my-3"></div>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base md:text-lg">
                                                    <span className="font-bold block text-xs uppercase text-slate-400 mb-1">Explanation</span>
                                                    {language === 'en' ? currentQ.explanation_en : currentQ.explanation_ta}
                                                </p>
                                            </>
                                        )}

                                        {/* AI Explanation Section */}
                                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest mb-2">
                                                <FiCpu className="text-lg animate-pulse" /> AI Explanation
                                            </div>
                                            {loadingAI ? (
                                                <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                    Thinking...
                                                </div>
                                            ) : (
                                                aiExplanation && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed border border-indigo-100 dark:border-indigo-900/30"
                                                    >
                                                        {aiExplanation}
                                                    </motion.div>
                                                )
                                            )}
                                        </div>

                                        {/* Show correct answer if wrong */}
                                        {selectedOption !== currentQ.correctOptionId && (
                                            <div className="mt-3 p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">{language === 'en' ? 'Correct Answer:' : 'சரியான பதில்:'}</p>
                                                <p className="text-slate-800 dark:text-slate-200 font-bold">
                                                    {currentQ.correctOptionId}. {currentQ.options.find(o => o.id === currentQ.correctOptionId)?.[language === 'en' ? 'text_en' : 'text_ta']}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Desktop Next Button */}
                        <div className="hidden md:flex mt-8 justify-end">
                            <button
                                onClick={handleNext}
                                disabled={!selectedOption}
                                className={`px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all transform hover:-translate-y-1 ${selectedOption
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <FiArrowRight />
                            </button>
                        </div>

                    </motion.div>
                </div>

                {/* Mobile Bottom Bar for Next Button */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-50">
                    <button
                        onClick={handleNext}
                        disabled={!selectedOption}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${selectedOption
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 active:scale-95'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <FiArrowRight />
                    </button>
                </div>
            </div>
        </QuizLayout>
    );
};

export default Quiz;
