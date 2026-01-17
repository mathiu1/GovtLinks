import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { FiClock, FiCpu, FiCheckCircle, FiXCircle, FiArrowRight, FiShield, FiTrendingUp, FiLayers, FiSearch, FiEye, FiBarChart2, FiRotateCcw, FiZap } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import API from '../api';
import QuizLayout from '../components/QuizLayout';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

const GameQuiz = ({ isSidebarOpen, closeSidebar, handleTopicClick }) => {
    const { user, updateUser } = useContext(AuthContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Game State
    const gameMode = location.state?.mode || 'survival'; // 'survival' or 'speedrun'
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(gameMode === 'speedrun' ? 120 : 30);
    const [loading, setLoading] = useState(true);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [streak, setStreak] = useState(0);

    // --- Lifeline Sub-components ---
    const LifelineBtn = ({ icon, label, cost, active, onClick, disabled, loading, colorClasses }) => {
        const canAfford = (user?.xp >= cost);
        return (
            <button
                onClick={onClick}
                disabled={disabled || !canAfford || loading}
                className={`group flex items-center gap-2 ${disabled || !canAfford ? 'opacity-30' : 'hover:scale-105 active:scale-95 transition-all'}`}>
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-sm md:text-lg border transition-all duration-300
                    ${active ? colorClasses.active : `${colorClasses.base} group-hover:${colorClasses.active}`}
                `}>
                    {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : icon}
                </div>
                <div className="flex flex-col items-start leading-none pointer-events-none">
                    <span className={`text-[9px] font-black uppercase ${colorClasses.text}`}>{label}</span>
                    <span className={`text-[8px] font-bold opacity-60 ${colorClasses.text}`}>{cost} XP</span>
                </div>
            </button>
        );
    };

    const colorMap = {
        amber: { base: 'bg-amber-500/10 border-amber-500/30 text-amber-500', active: 'bg-amber-500 text-black border-amber-400', text: 'text-amber-500' },
        emerald: { base: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500', active: 'bg-emerald-500 text-black border-emerald-400', text: 'text-emerald-500' },
        cyan: { base: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', active: 'bg-cyan-500 text-black border-cyan-400', text: 'text-cyan-400' },
        indigo: { base: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', active: 'bg-indigo-500 text-white border-indigo-400', text: 'text-indigo-400' },
        blue: { base: 'bg-blue-500/10 border-blue-500/30 text-blue-400', active: 'bg-blue-500 text-white border-blue-400', text: 'text-blue-400' },
        orange: { base: 'bg-orange-500/10 border-orange-500/30 text-orange-400', active: 'bg-orange-500 text-white border-orange-400', text: 'text-orange-400' },
        purple: { base: 'bg-purple-500/10 border-purple-500/30 text-purple-400', active: 'bg-purple-500 text-white border-purple-400', text: 'text-purple-400' },
        fuchsia: { base: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400', active: 'bg-fuchsia-500 text-white border-fuchsia-400', text: 'text-fuchsia-400' },
        rose: { base: 'bg-rose-500/10 border-rose-500/30 text-rose-400', active: 'bg-rose-500 text-white border-rose-400', text: 'text-rose-400' },
        violet: { base: 'bg-violet-500/10 border-violet-500/30 text-violet-400', active: 'bg-violet-500 text-white border-violet-400', text: 'text-violet-400' },
        yellow: { base: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', active: 'bg-yellow-500 text-black border-yellow-400', text: 'text-yellow-400' },
        slate: { base: 'bg-slate-500/10 border-slate-500/30 text-slate-400', active: 'bg-slate-500 text-white border-slate-400', text: 'text-slate-400' }
    };
    const [reviveAvailable, setReviveAvailable] = useState(false);
    const [powerupLoading, setPowerupLoading] = useState(null);
    const [hiddenOptions, setHiddenOptions] = useState([]);
    const [activeHint, setActiveHint] = useState(null);
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);

    // New Power-up States
    const [xpBoostCount, setXpBoostCount] = useState(0);
    const [isShieldActive, setIsShieldActive] = useState(false);
    const [isXrayActive, setIsXrayActive] = useState(false);
    const [canSnap, setCanSnap] = useState(false); // For "The Snap" (Undo)

    // Answering State
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [aiExplanation, setAiExplanation] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Audio State (simplified for game)
    const [autoRead] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchGameQuestions();
    }, []);

    const fetchGameQuestions = async () => {
        setLoading(true);
        try {
            // Fetch random questions for game modes
            // Survival gets a large pool (50), Speedrun gets 20
            let url = `/quiz?limit=50&exam=TNPSC Group 4`; // Default

            if (gameMode === 'speedrun') {
                url = `/quiz?limit=20&exam=TNPSC Group 4`;
            } else if (gameMode === 'quest') {
                // Fetch specific subject questions for quest
                const subject = location.state?.subject || 'History';
                url = `/quiz?limit=10&subject=${subject}`;
            }

            const res = await API.get(url);

            if (res.data.length > 0) {
                setQuestions(res.data);
            } else {
                // Fallback if no specific subject questions found
                if (gameMode === 'quest') {
                    alert(`No questions found for ${location.state?.subject}. Loading general questions.`);
                    const fallbackRes = await API.get(`/quiz?limit=10`);
                    setQuestions(fallbackRes.data);
                } else {
                    alert("No questions available for game mode!");
                    navigate('/activities');
                }
            }
        } catch (error) {
            console.error("Game Load Error", error);
        } finally {
            setLoading(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (loading || quizCompleted || selectedOption) return;

        if (timeLeft <= 0) {
            handleNext();
            return;
        }

        if (isTimeFrozen || loadingAI) return;

        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, quizCompleted, selectedOption, isTimeFrozen, loadingAI]);

    // Reset Timer on Question Change (unless speedrun)
    useEffect(() => {
        if (gameMode !== 'speedrun') setTimeLeft(30);
    }, [currentQuestionIndex, gameMode]);

    const handleOptionClick = (optionId) => {
        if (selectedOption) return;
        setSelectedOption(optionId);

        const currentQ = questions[currentQuestionIndex];
        const isCorrect = optionId === currentQ.correctOptionId;

        // Visual Feedback
        if (isCorrect) {
            setScore(prev => prev + 1);
            setStreak(prev => prev + 1);

            // Dynamic Confetti based on streak
            const particleCount = 50 + (streak * 20);
            confetti({
                particleCount: Math.min(particleCount, 200),
                spread: 70,
                origin: { y: 0.7 },
                colors: streak > 2 ? ['#FFD700', '#FFA500', '#FF4500'] : ['#26ccff', '#a25afdaa', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });

            // Handle XP Boost
            if (xpBoostCount > 0) {
                setXpBoostCount(prev => prev - 1);
            }
        } else {
            // Handle Shield
            if (isShieldActive) {
                setIsShieldActive(false);
                return; // Early return prevents life loss
            }

            setStreak(0);
            if (gameMode === 'survival') {
                const newLives = lives - 1;
                setLives(newLives);
                if (newLives <= 0) {
                    setReviveAvailable(true);
                }
            }
            // "The Snap" (Undo) Logic
            setCanSnap(true);
            setTimeout(() => setCanSnap(false), 4000);
        }

        // remove auto trigger
        // fetchAIExplanation(currentQ, isCorrect);
        // setShowExplanation(true);
    };

    const handleUndo = () => {
        if (!canSnap) return;
        setCanSnap(false);
        setSelectedOption(null);
        setShowExplanation(false);
        setAiExplanation(null); // Clear active explanation
        setStreak(prev => prev);
        if (gameMode === 'survival') setLives(prev => prev + 1);
    };

    const swapQuestion = async () => {
        const currentQ = questions[currentQuestionIndex];
        try {
            const res = await API.get('/quiz?limit=1');
            if (res.data.length > 0) {
                const newQuestions = [...questions];
                newQuestions[currentQuestionIndex] = res.data[0];
                setQuestions(newQuestions);
                setActiveHint(null);
            }
        } catch (e) {
            console.error("Swap failed", e);
        }
    };

    const handleExplainRequest = async () => {
        const currentQ = questions[currentQuestionIndex];
        setShowExplanation(true);
        setLoadingAI(true);

        try {
            const correctOptText = currentQ.options.find(o => o.id === currentQ.correctOptionId)?.text_en;
            const res = await API.post('/ai/explain', {
                question: language === 'en' ? currentQ.question_en : currentQ.question_ta,
                answer: correctOptText,
                options: currentQ.options.map(o => o.text_en),
                language
            });

            // Check if user has moved on (although simple state clear in next() usually works, this is safer)
            if (questions[currentQuestionIndex] === currentQ) {
                setAiExplanation(res.data.text);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleNext = () => {
        if (gameMode === 'survival' && lives <= 0 && !reviveAvailable) {
            finishGame(score);
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
            setAiExplanation(null);
            setHiddenOptions([]);
            setActiveHint(null);
        } else {
            finishGame(score + (selectedOption === questions[currentQuestionIndex]?.correctOptionId ? 1 : 0));
        }
    };

    const handlePowerup = async (type) => {
        if (powerupLoading) return;
        setPowerupLoading(type);

        const currentQ = questions[currentQuestionIndex];

        try {
            const res = await API.post('/gamification/use-powerup', { type });
            updateUser(res.data.user);

            if (type === 'revive') {
                setLives(1);
                setReviveAvailable(false);
            } else if (type === 'hint') {
                // Fetch smart AI clue from backend
                setLoadingAI(true);
                const hintRes = await API.post('/ai/hint', {
                    question: language === 'en' ? currentQ.question_en : currentQ.question_ta,
                    options: currentQ.options.map(o => language === 'en' ? o.text_en : o.text_ta),
                    language
                });
                setActiveHint(hintRes.data.text);
                setLoadingAI(false);
            } else if (type === 'magnet') {
                const wrongOptions = currentQ.options
                    .filter(o => o.id !== currentQ.correctOptionId)
                    .map(o => o.id);
                // Randomly pick 2 to hide
                const toHide = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
                setHiddenOptions(toHide);
            } else if (type === 'freeze') {
                setIsTimeFrozen(true);
                setTimeout(() => setIsTimeFrozen(false), 15000);
            } else if (type === 'swap') {
                await swapQuestion();
            } else if (type === 'shield') {
                setIsShieldActive(true);
            } else if (type === 'boost') {
                setXpBoostCount(5);
            } else if (type === 'xray') {
                setIsXrayActive(true);
                setTimeout(() => setIsXrayActive(false), 3000);
            } else if (type === 'overtime') {
                setTimeLeft(prev => prev + 30);
            } else if (type === 'autopilot') {
                handleOptionClick(currentQ.correctOptionId);
            } else if (type === 'snap') {
                handleUndo();
            }
        } catch (e) {
            alert(e.response?.data?.message || 'Power-up failed');
        } finally {
            setPowerupLoading(null);
        }
    };

    const finishGame = async (finalScore) => {
        setQuizCompleted(true);
        // Save score API call...
        try {
            let bonus = 0;
            if (gameMode === 'survival') bonus = finalScore * 5;
            if (gameMode === 'speedrun' && timeLeft > 0) bonus = timeLeft * 2;

            const res = await API.post('/gamification/quiz-result', {
                score: finalScore,
                totalQuestions: questions.length,
                bonus,
                mode: gameMode,
                multiplier: xpBoostCount > 0 ? 2 : 1 // Simple multiplier check
            });

            // Sync User State
            if (res.data.user) {
                updateUser(res.data.user);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // --- RENDER ---

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1120] text-white">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-black tracking-widest animate-pulse">LOADING MISSON...</h2>
            </div>
        );
    }

    if (quizCompleted) {
        let isVictory = !(gameMode === 'survival' && lives <= 0);
        if (gameMode === 'quest') {
            isVictory = score >= questions.length; // Need 100% for quest
        }

        // Colors based on state (Victory = Green/Gold, Defeat = Red/Pink)
        const accentColor = isVictory ? 'text-emerald-400' : 'text-rose-400';
        const glowColor = isVictory ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
        const iconBg = isVictory ? 'bg-gradient-to-tr from-emerald-500 to-green-400' : 'bg-gradient-to-tr from-rose-500 to-red-500';

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19] font-sans p-4">
                {/* Subtle Background Mesh */}
                <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Glow behind the card */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] rounded-full opacity-20 blur-[100px] z-0 pointer-events-none"
                    style={{ backgroundColor: isVictory ? '#10b981' : '#f43f5e' }}
                ></div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative z-10 w-full max-w-[360px] md:max-w-md bg-[#131b2e] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden"
                >
                    <div className="p-6 md:p-10 flex flex-col items-center text-center">

                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${iconBg} flex items-center justify-center text-4xl md:text-5xl shadow-lg mb-6`}
                            style={{ boxShadow: `0 10px 30px -10px ${glowColor}` }}
                        >
                            {isVictory ? '🏆' : '💀'}
                        </motion.div>

                        {/* Text */}
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase">
                            {isVictory ? "Victory!" : "Game Over"}
                        </h1>
                        <p className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-8 ${accentColor}`}>
                            {isVictory ? "Mission Accomplished" : "Better Luck Next Time"}
                        </p>

                        {/* Stats Row */}
                        <div className="flex w-full gap-3 md:gap-4 mb-8">
                            <div className="flex-1 bg-black/40 rounded-xl p-3 md:p-4 border border-white/5">
                                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Correct Answers</p>
                                <p className="text-2xl md:text-3xl font-black text-white">{score} <span className="text-slate-600 text-sm md:text-base">/ {questions.length}</span></p>
                            </div>
                            <div className="flex-1 bg-black/40 rounded-xl p-3 md:p-4 border border-white/5">
                                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total XP</p>
                                <p className={`text-2xl md:text-3xl font-black ${accentColor}`}>
                                    +{(score * 10) + (gameMode === 'survival' ? score * 5 : (gameMode === 'speedrun' && timeLeft > 0 ? timeLeft * 2 : 0))}
                                </p>
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            onClick={() => {
                                if (gameMode === 'quest') {
                                    navigate('/quest', {
                                        state: {
                                            questCompleted: isVictory,
                                            islandId: location.state?.islandId
                                        }
                                    });
                                } else {
                                    navigate('/activities');
                                }
                            }}
                            className="w-full py-3.5 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-white text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                        >
                            {gameMode === 'quest' ? (isVictory ? "CLAIM ISLAND" : "TRY AGAIN") : "RETURN TO BASE"} <FiArrowRight />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="fixed inset-0 z-50 bg-[#0B1120] text-slate-100 flex flex-col font-sans overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen opacity-60"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            {/* Game Header */}
            <div className="relative z-20 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-slate-900/40 backdrop-blur-md border-b border-white/5 shadow-sm">
                <div className="flex items-center gap-3 md:gap-6">
                    <button
                        onClick={() => navigate('/activities')}
                        className="group flex items-center gap-2 text-xs font-black tracking-[0.2em] text-slate-500 hover:text-white transition-colors uppercase"
                    >
                        <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-lg active:scale-90 transition-transform">✕</span>
                        <span className="hidden md:inline">Exit</span>
                    </button>

                    <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-widest text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                        {gameMode.replace('_', ' ')}
                    </span>

                    {/* STREAK COUNTER */}
                    <AnimatePresence>
                        {streak > 1 && (
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                key="streak-badge"
                                className="hidden md:flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-lg shadow-orange-500/50"
                            >
                                <span className="text-lg">🔥</span>
                                <span className="font-black italic text-white text-sm">{streak}x STREAK</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="px-2 py-1 md:px-4 md:py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[9px] md:text-xs font-bold text-slate-300 transition-colors uppercase"
                    >
                        {language === 'en' ? 'தமிழ்' : 'ENG'}
                    </button>

                    {gameMode === 'survival' && (
                        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 md:px-4 md:py-2 rounded-full border border-white/5 backdrop-blur-sm">
                            <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase mr-1 hidden lg:inline">Lives</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        initial={false}
                                        animate={{ scale: i <= lives ? 1 : 0.8, opacity: i <= lives ? 1 : 0.2 }}
                                    >
                                        <FaHeart className={`text-xs md:text-base ${i <= lives ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-slate-600"}`} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={`flex items-center gap-2 md:gap-3 px-2 py-1 md:px-4 md:py-2 rounded-full border backdrop-blur-sm transition-colors ${timeLeft <= 10
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : isTimeFrozen ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-cyan-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}>
                        {isTimeFrozen ? <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="text-xs md:text-base">❄️</motion.span> : <FiClock className={`${timeLeft <= 10 ? 'animate-pulse' : ''} text-xs md:text-base`} />}
                        <span className="font-mono font-bold text-sm md:text-xl min-w-[2ch] text-center">{timeLeft}</span>
                    </div>
                </div>
            </div>

            {/* SECONDARY LIFELINE BAR (TOP) */}
            <div className="relative z-10 px-4 py-3 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row items-center gap-4 shadow-xl">
                <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:inline">Balance</span>
                    <div className="flex items-center gap-2 bg-sky-500/10 px-3 py-1.5 rounded-full border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                        <span className="text-sky-400 text-sm">💎</span>
                        <span className="text-sm font-black text-sky-400 tabular-nums">{user?.xp || 0} XP</span>
                    </div>
                    {/* Active Buffs */}
                    <div className="flex items-center gap-2 ml-2">
                        {isShieldActive && <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 border border-indigo-500/30" title="Shield Active"><FiShield /></motion.div>}
                        {xpBoostCount > 0 && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }} className="px-2 py-0.5 bg-orange-500/20 rounded text-[9px] font-black text-orange-400 border border-orange-500/30">2X XP ({xpBoostCount})</motion.div>}
                    </div>
                </div>

                <div className="w-full overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    <div className="flex items-center gap-4 md:gap-8 min-w-max px-2">
                        {/* CORE 4 */}
                        <LifelineBtn icon="💡" label="Hint" cost={50} active={!!activeHint} onClick={() => handlePowerup('hint')} disabled={selectedOption || !!activeHint} loading={powerupLoading === 'hint'} colorClasses={colorMap.amber} />
                        <LifelineBtn icon="🧲" label="50/50" cost={100} active={hiddenOptions.length > 0} onClick={() => handlePowerup('magnet')} disabled={selectedOption || hiddenOptions.length > 0} loading={powerupLoading === 'magnet'} colorClasses={colorMap.emerald} />
                        <LifelineBtn icon="❄️" label="Freeze" cost={150} active={isTimeFrozen} onClick={() => handlePowerup('freeze')} disabled={selectedOption || isTimeFrozen} loading={powerupLoading === 'freeze'} colorClasses={colorMap.cyan} />

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        {/* STRATEGIC */}
                        <LifelineBtn icon="🔀" label="Swap" cost={150} onClick={() => handlePowerup('swap')} disabled={selectedOption} loading={powerupLoading === 'swap'} colorClasses={colorMap.indigo} />
                        <LifelineBtn icon="🛡️" label="Shield" cost={125} active={isShieldActive} onClick={() => handlePowerup('shield')} disabled={selectedOption || isShieldActive} loading={powerupLoading === 'shield'} colorClasses={colorMap.blue} />
                        <LifelineBtn icon="🚀" label="2x Boost" cost={200} active={xpBoostCount > 0} onClick={() => handlePowerup('boost')} disabled={selectedOption || xpBoostCount > 0} loading={powerupLoading === 'boost'} colorClasses={colorMap.orange} />

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        {/* HIGH STAKES */}
                        <LifelineBtn icon="🔮" label="X-Ray" cost={250} active={isXrayActive} onClick={() => handlePowerup('xray')} disabled={selectedOption || isXrayActive} loading={powerupLoading === 'xray'} colorClasses={colorMap.violet} />
                        <LifelineBtn icon="⚡" label="+30s" cost={100} onClick={() => handlePowerup('overtime')} disabled={selectedOption || gameMode !== 'speedrun'} loading={powerupLoading === 'overtime'} colorClasses={colorMap.yellow} />
                        <LifelineBtn icon="🤖" label="AI Hack" cost={500} onClick={() => handlePowerup('autopilot')} disabled={selectedOption} loading={powerupLoading === 'autopilot'} colorClasses={colorMap.slate} />
                    </div>
                </div>
            </div>

            {/* REVIVE MODAL */}
            <AnimatePresence>
                {reviveAvailable && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
                        >
                            {/* Pulse background */}
                            <div className="absolute inset-0 bg-rose-600/10 animate-pulse pointer-events-none"></div>

                            <div className="relative z-10">
                                <span className="text-6xl mb-6 block">💔</span>
                                <h3 className="text-3xl font-black text-white mb-2 uppercase">MISSION FAILED</h3>
                                <p className="text-slate-400 text-sm mb-10 font-medium">Your lives became Zero. Spend XP to buy a life and keep your progress!</p>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => handlePowerup('revive')}
                                        disabled={user?.xp < 200 || powerupLoading === 'revive'}
                                        className="w-full py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl font-black text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-40"
                                    >
                                        {powerupLoading === 'revive' ? (
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>GET REVIVE (200 XP) <FaHeart /></>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => finishGame(score)}
                                        className="w-full py-3 text-slate-500 font-bold hover:text-white transition-colors"
                                    >
                                        NO THANKS, EXIT
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Game Area */}
            <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col justify-start md:justify-center overflow-y-auto pb-40 md:pb-8">
                {/* Progress Bar */}
                <div className="w-full bg-white/5 h-1 md:h-1.5 rounded-full mb-6 md:mb-8 overflow-hidden flex-shrink-0">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start pb-20 md:pb-0">
                    {/* Question Section */}
                    <div className="lg:col-span-7">
                        <div className="mb-6 md:mb-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold tracking-widest text-slate-400 shadow-sm">
                                    QUESTION {currentQuestionIndex + 1} <span className="text-slate-600">/ {questions.length}</span>
                                </span>
                                {currentQ.subject && (
                                    <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[10px] md:text-xs font-bold tracking-widest text-blue-400 uppercase shadow-sm">
                                        {currentQ.subject}
                                    </span>
                                )}
                                {currentQ.difficulty && (
                                    <span className={`inline-block px-3 py-1 rounded-lg border text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm ${currentQ.difficulty === 'hard' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                        currentQ.difficulty === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        }`}>
                                        {currentQ.difficulty}
                                    </span>
                                )}
                                {/* Mobile Streak Badge */}
                                <AnimatePresence>
                                    {streak > 1 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-[10px] font-black italic text-white shadow-sm"
                                        >
                                            🔥 {streak}x
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-black leading-snug md:leading-tight text-white mb-6 drop-shadow-lg">
                                {language === 'en' ? currentQ.question_en : currentQ.question_ta}
                            </h2>

                        </div>

                        {/* AI Explanation Box - Desktop Position */}
                        {/* AI Explanation Box - Desktop Position */}
                        <div className="hidden lg:block">
                            <AnimatePresence>
                                {showExplanation ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 backdrop-blur-sm"
                                    >
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-xs uppercase mb-3">
                                            <FiCpu className="text-lg animate-pulse" /> AI Analysis
                                        </div>
                                        {loadingAI ? (
                                            <div className="flex items-center gap-2 text-sm italic opacity-50">
                                                <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                                                Processing optimal strategy...
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert prose-sm">
                                                <p className="leading-relaxed text-lg">{aiExplanation}</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            className="mt-6 flex items-center gap-2 text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                                        >
                                            NEXT QUESTION <FiArrowRight />
                                        </button>
                                    </motion.div>
                                ) : (
                                    selectedOption && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 flex flex-col md:flex-row gap-3"
                                        >
                                            <button
                                                onClick={handleExplainRequest}
                                                className="flex-1 py-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 backdrop-blur-md group"
                                            >
                                                <FiCpu className="text-xl group-hover:scale-110 transition-transform" />
                                                <span>Analyze Answer with AI</span>
                                            </button>
                                            <button
                                                onClick={handleNext}
                                                className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>Next Question</span>
                                                <FiArrowRight className="text-xl" />
                                            </button>
                                        </motion.div>
                                    )
                                )}

                                {activeHint && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        className="mt-6 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 text-amber-100 backdrop-blur-xl relative overflow-hidden group"
                                    >
                                        {/* Animated Background Pulse */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 text-amber-500 font-black tracking-[0.2em] text-[10px] uppercase mb-4">
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                                                    <FiCpu className="text-lg" />
                                                </div>
                                                AI SMART CLUE
                                            </div>

                                            <div className="prose prose-invert prose-sm">
                                                {loadingAI ? (
                                                    <div className="flex items-center gap-3 text-amber-500/60 py-3">
                                                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="font-bold tracking-widest text-[10px] uppercase">Unlocking Secret...</span>
                                                    </div>
                                                ) : (
                                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                                        <p className="text-base md:text-lg font-medium leading-relaxed text-amber-100">
                                                            <motion.span
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                {activeHint}
                                                            </motion.span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile AI Hint Position */}
                        <div className="lg:hidden">
                            <AnimatePresence>
                                {activeHint && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-100 backdrop-blur-xl relative overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 text-amber-500 font-black tracking-[0.2em] text-[8px] uppercase mb-2">
                                                <FiCpu className="text-xs animate-pulse" /> AI SMART CLUE
                                            </div>
                                            {loadingAI ? (
                                                <div className="flex items-center gap-2 text-[10px] text-amber-500/60 font-bold uppercase tracking-widest py-2">
                                                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                                    Decrypting...
                                                </div>
                                            ) : (
                                                <p className="text-sm md:text-base font-medium leading-relaxed text-amber-100">
                                                    {activeHint}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Options Section */}
                    <div className="lg:col-span-5 flex flex-col gap-3 md:gap-4">
                        {currentQ.options.map((opt, idx) => {
                            const isSelected = selectedOption === opt.id;
                            const isCorrect = opt.id === currentQ.correctOptionId;

                            let stateClass = "bg-white/5 border-white/10 hover:bg-white/10 active:scale-[0.98]"; // Default
                            let activeClass = "";

                            if (hiddenOptions.includes(opt.id)) {
                                stateClass = "opacity-0 pointer-events-none scale-90";
                            } else if (selectedOption) {
                                if (isSelected) {
                                    stateClass = isCorrect
                                        ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                        : "bg-rose-500/20 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]";
                                } else if (isCorrect) {
                                    stateClass = "bg-emerald-500/10 border-emerald-500/50 opacity-60";
                                } else {
                                    stateClass = "opacity-30 grayscale";
                                }
                            }

                            // Shake Animation for wrong answers
                            const shakeVariants = {
                                idle: { x: 0 },
                                shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
                            };

                            const shouldShake = selectedOption && isSelected && !isCorrect;

                            return (
                                <motion.button
                                    key={opt.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={shouldShake ? "shake" : { opacity: 1, x: 0 }}
                                    variants={shakeVariants}
                                    transition={{ delay: idx * 0.05 }}
                                    disabled={selectedOption !== null}
                                    onClick={() => handleOptionClick(opt.id)}
                                    className={`group relative p-4 md:p-5 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300 w-full flex items-center gap-4 ${stateClass} ${activeClass}`}
                                >
                                    <div className={`
                                        w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs md:text-sm border transition-colors relative
                                        ${selectedOption && isSelected
                                            ? (isCorrect ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-rose-500 border-rose-400 text-white')
                                            : 'bg-white/10 border-white/10 text-slate-400 group-hover:bg-white/20 group-hover:text-white'}
                                    `}>
                                        {opt.id}
                                        {/* Debug/Test Indicator - Very subtle dot for correct answer */}
                                        {!selectedOption && isCorrect && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500/20 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                    <span className={`font-bold text-base md:text-lg leading-snug ${selectedOption && isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {language === 'en' ? opt.text_en : opt.text_ta}
                                    </span>

                                    {selectedOption && isSelected && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isCorrect
                                                ? <FiCheckCircle className="text-xl md:text-2xl text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                : <FiXCircle className="text-xl md:text-2xl text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Mobile Fixed Action Bar */}
            <AnimatePresence>
                {selectedOption && !showExplanation && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#0B1120]/90 backdrop-blur-xl border-t border-white/10 flex flex-col gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
                    >
                        <button
                            onClick={handleExplainRequest}
                            className="w-full py-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 active:bg-indigo-500/20 text-indigo-400 font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                        >
                            <FiCpu className="text-lg animate-pulse" />
                            <span>Analyze AI</span>
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black tracking-widest uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Next Question</span>
                            <FiArrowRight className="text-lg" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile AI Explanation (Slide-up Panel) */}
            <div className="lg:hidden">
                <AnimatePresence>
                    {showExplanation && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                        >
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
                            <div className="max-h-[60vh] overflow-y-auto">
                                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-3 uppercase text-xs tracking-wider">
                                    <FiCpu /> AI Analysis
                                </div>
                                <div className="prose prose-invert prose-sm mb-6">
                                    <p className="text-slate-300 leading-relaxed">
                                        {loadingAI ? (
                                            <span className="flex items-center gap-2 opacity-50">
                                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                                Analyzing Strategy...
                                            </span>
                                        ) : aiExplanation}
                                    </p>
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-black text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
                                >
                                    NEXT QUESTION
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

export default GameQuiz;
