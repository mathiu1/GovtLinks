import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaCheck, FaHistory, FaTrophy, FaArrowLeft, FaRedo, FaBars, FaStar, FaGlobe } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { LanguageContext } from '../context/LanguageContext';

// --- GAME DATA (LEVELS with Tamil Support) ---
const LEVELS = [
    {
        id: 1,
        title: "Indian Independence",
        title_ta: "இந்திய விடுதலைப் போராட்டம்",
        events: [
            { id: "e1", text: "Arrival of East India Company", text_ta: "கிழக்கிந்திய கம்பெனி வருகை", year: 1600 },
            { id: "e2", text: "Battle of Plassey", text_ta: "பிலாசி போர்", year: 1757 },
            { id: "e3", text: "Sepoy Mutiny", text_ta: "சிப்பாய் கலகம்", year: 1857 },
            { id: "e4", text: "Formation of Congress", text_ta: "காங்கிரஸ் கட்சித் தோற்றம்", year: 1885 },
            { id: "e5", text: "Partition of Bengal", text_ta: "வங்கப் பிரிவினை", year: 1905 },
        ]
    },
    {
        id: 2,
        title: "Gandhian Era",
        title_ta: "காந்திய சகாப்தம்",
        events: [
            { id: "g1", text: "Champaran Satyagraha", text_ta: "சம்பரான் சத்தியாகிரகம்", year: 1917 },
            { id: "g2", text: "Jallianwala Bagh", text_ta: "ஜாலியன் வாலாபாக்", year: 1919 },
            { id: "g3", text: "Non-Cooperation Movement", text_ta: "ஒத்துழையாமை இயக்கம்", year: 1920 },
            { id: "g4", text: "Dandi March", text_ta: "தண்டி யாத்திரை", year: 1930 },
            { id: "g5", text: "Quit India Movement", text_ta: "வெள்ளையனே வெளியேறு இயக்கம்", year: 1942 },
        ]
    },
    {
        id: 3,
        title: "Ancient Tamil Nadu",
        title_ta: "பண்டைய தமிழகம்",
        events: [
            { id: "t1", text: "Sangam Age Begins", text_ta: "சங்க காலம் தொடக்கம்", year: -300 },
            { id: "t2", text: "Silappathikaram Written", text_ta: "சிலப்பதிகாரம் இயற்றப்பட்டது", year: 200 },
            { id: "t3", text: "Pallava Dynasty Rise", text_ta: "பல்லவ வம்ச எழுச்சி", year: 550 },
            { id: "t4", text: "Thanjavur Big Temple", text_ta: "தஞ்சை பெரிய கோவில்", year: 1010 },
            { id: "t5", text: "Decline of Cholas", text_ta: "சோழர் வீழ்ச்சி", year: 1279 },
        ]
    }
];

// Shuffle helper
const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const BackgroundParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/20 rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        opacity: Math.random()
                    }}
                    animate={{
                        y: [null, Math.random() * -100 - 50],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

const ChronologyGame = ({ isSidebarOpen }) => {
    const navigate = useNavigate();
    const langContext = useContext(LanguageContext);
    const language = langContext?.language || 'en';
    const toggleLanguage = langContext?.toggleLanguage;

    const [gameState, setGameState] = useState('intro'); // 'intro', 'playing', 'won', 'lost', 'completed'
    const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
    const [items, setItems] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize Level
    useEffect(() => {
        if (gameState === 'playing') {
            loadLevel(currentLevelIdx);
        }
    }, [currentLevelIdx, gameState]);

    const loadLevel = (idx) => {
        if (idx >= LEVELS.length) {
            setGameState('completed');
            return;
        }
        const levelData = LEVELS[idx];
        const shuffled = shuffle([...levelData.events]);
        setItems(shuffled);
        setTimeLeft(60);
        setGameState('playing');
    };

    // Timer Logic
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft <= 0) {
            handleCheckOrder();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    const handleCheckOrder = () => {
        const isCorrect = items.every((item, i) => {
            if (i === 0) return true;
            return item.year >= items[i - 1].year;
        });

        if (isCorrect) {
            setGameState('won');
            const timeBonus = timeLeft * 20;
            const levelBonus = 500;
            setScore(prev => prev + levelBonus + timeBonus);
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#3B82F6', '#F59E0B', '#10B981']
            });
        } else {
            setGameState('lost');
        }
    };

    const handleNextLevel = () => {
        setCurrentLevelIdx(prev => prev + 1);
    };

    const handleRetry = () => {
        loadLevel(currentLevelIdx);
    };

    const currentLevel = LEVELS[currentLevelIdx];

    return (
        <div className="min-h-screen bg-[#020617] font-sans relative overflow-hidden text-slate-100 flex flex-col transition-all duration-500">

            {/* Premium Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[130px] animate-pulse delay-1000"></div>
                <BackgroundParticles />
            </div>

            {/* Header */}
            <header className="relative z-20 p-3 md:p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl bg-slate-950/40">
                <div className="flex items-center gap-2 md:gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/activities')}
                        className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 transition-all text-white/70"
                    >
                        <FaArrowLeft className="text-sm md:text-base" />
                    </motion.button>
                    <div>
                        <h1 className="text-sm md:text-xl font-bold text-white tracking-tight leading-none mb-1 truncate max-w-[120px] md:max-w-none">
                            {language === 'en' ? 'Chronology Conquest' : 'காலவரிசைப் போர்'}
                        </h1>
                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 opacity-60">
                            <FaHistory className="text-indigo-400" />
                            {language === 'en' ? `LVL ${currentLevelIdx + 1}` : `நிலை ${currentLevelIdx + 1}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => toggleLanguage()}
                        className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] md:text-xs font-bold text-slate-400 hover:text-white transition-all shadow-lg"
                    >
                        <FaGlobe className="text-blue-400" />
                        {language === 'en' ? 'EN' : 'தமிழ்'}
                    </button>

                    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
                        <FaTrophy className="text-yellow-400 text-sm md:text-base" />
                        <span className="font-black font-mono text-base md:text-xl">{score}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 w-full max-w-2xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center">

                <AnimatePresence mode="wait">
                    {gameState === 'intro' ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, y: -30 }}
                            className="w-full max-w-xl bg-slate-900/40 backdrop-blur-[40px] p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] text-center relative overflow-hidden group"
                        >
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-colors duration-1000"></div>

                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 ring-4 ring-white/10">
                                    <FaHistory size={40} className="text-white drop-shadow-lg" />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-none">
                                    {language === 'en' ? 'Conquest' : 'காலவரிசை'}
                                    <span className="block text-xs text-blue-400/80 mt-3 font-bold tracking-[0.2em] uppercase">{language === 'en' ? 'Mission Brief' : 'விளையாட்டு விதிமுறைகள்'}</span>
                                </h2>

                                <div className="space-y-8 text-left mb-10 max-w-md mx-auto">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold shrink-0 shadow-lg text-lg">1</div>
                                        <p className="text-slate-300 font-bold text-sm md:text-base leading-relaxed">
                                            {language === 'en' ? 'Drag historical events into the correct chronological order from earliest to latest.' : 'வரலாற்று நிகழ்வுகளை ஆரம்பம் முதல் இறுதி வரை சரியான காலவரிசையில் வரிசைப்படுத்தவும்.'}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center font-bold shrink-0 shadow-lg text-lg">2</div>
                                        <p className="text-slate-300 font-bold text-sm md:text-base leading-relaxed">
                                            {language === 'en' ? 'Be quick! You only have 60 seconds per level. Faster completion earns more XP.' : 'வேகமாகச் செய்யுங்கள்! ஒரு நிலைக்கு 60 வினாடிகள் மட்டுமே உள்ளன. விரைவில் முடித்தால் அதிக XP கிடைக்கும்.'}
                                        </p>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => loadLevel(0)}
                                    className="w-full py-4 md:py-5 rounded-xl bg-white text-slate-950 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all uppercase tracking-wider"
                                >
                                    {language === 'en' ? "INITIATE CONQUEST" : "போரைத் தொடங்கு"}
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full">
                            {/* Level Title Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={currentLevelIdx + (gameState === 'playing' ? '_playing' : '_res')}
                                className="w-full text-center mb-10"
                            >
                                <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
                                    {gameState === 'completed'
                                        ? (language === 'en' ? 'Conquest Complete!' : 'வெற்றி முடிந்தது!')
                                        : (language === 'en' ? currentLevel?.title : currentLevel?.title_ta)}
                                </h2>

                                {gameState === 'playing' && (
                                    <div className="flex items-center justify-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Time Remaining</div>
                                            <div className={`text-4xl font-mono font-black ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-blue-400'}`}>
                                                {timeLeft}s
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Game Logic Container */}
                            <div className="w-full relative min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    {gameState === 'playing' ? (
                                        <motion.div
                                            key={`playing_${currentLevelIdx}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            className="space-y-4"
                                        >
                                            <Reorder.Group
                                                axis="y"
                                                onReorder={setItems}
                                                values={items}
                                                className="flex flex-col gap-4"
                                            >
                                                {items.map((item) => (
                                                    <Reorder.Item
                                                        key={item.id}
                                                        value={item}
                                                        whileDrag={{
                                                            scale: 1.02,
                                                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                                                            zIndex: 50,
                                                        }}
                                                        layout
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 600,
                                                            damping: 30,
                                                            mass: 1
                                                        }}
                                                        className="group relative bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-colors select-none touch-none"
                                                    >
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-slate-500 group-hover:text-white transition-all pointer-events-none">
                                                            <FaBars className="text-xs" />
                                                        </div>
                                                        <div className="flex-1 pointer-events-none">
                                                            <p className="font-semibold text-sm md:text-base text-white/90">
                                                                {language === 'en' ? item.text : item.text_ta}
                                                            </p>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>

                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={handleCheckOrder}
                                                className="w-full mt-8 py-4 md:py-5 rounded-xl bg-blue-600 font-bold text-base md:text-lg shadow-xl tracking-wide flex items-center justify-center gap-3 transition-all uppercase"
                                            >
                                                <FaCheck /> {language === 'en' ? 'VERIFY TIMELINE' : 'வரிசையைச் சரிபார்க்கவும்'}
                                            </motion.button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={`result_${gameState}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6"
                                        >
                                            {/* Results List */}
                                            <div className="space-y-3">
                                                {items.map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        className={`
                                                            relative rounded-[2rem] border p-6 flex items-center justify-between backdrop-blur-3xl transition-all duration-500
                                                            ${gameState === 'won' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}
                                                        `}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-base md:text-lg">{language === 'en' ? item.text : item.text_ta}</span>
                                                        </div>
                                                        <div className={`font-black font-mono text-xl px-5 py-2.5 rounded-2xl bg-slate-950/80 border ${gameState === 'won' ? 'text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'text-rose-400 border-rose-500/30'}`}>
                                                            {item.year < 0 ? `${Math.abs(item.year)} BC` : item.year}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Action Panels */}
                                            <div className="pt-8 w-full">
                                                {gameState === 'won' ? (
                                                    <div className="text-center">
                                                        <motion.div
                                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                            className="text-yellow-400 flex justify-center gap-3 text-4xl mb-8"
                                                        >
                                                            <FaStar /><FaStar /><FaStar />
                                                        </motion.div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            onClick={handleNextLevel}
                                                            className="w-full py-6 rounded-2xl bg-white text-slate-900 font-bold text-xl shadow-xl flex items-center justify-center gap-4 transition-all uppercase tracking-wider"
                                                        >
                                                            {language === 'en' ? 'CONTINUE JOURNEY' : 'பயணத்தைத் தொடரவும்'} <FaTrophy />
                                                        </motion.button>
                                                    </div>
                                                ) : gameState === 'lost' ? (
                                                    <div className="text-center p-8 bg-black/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl">
                                                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                            <FaRedo className="text-rose-500 text-3xl" />
                                                        </div>
                                                        <p className="text-white font-bold mb-8 text-2xl tracking-tight leading-tight">Timeline Disrupted!<br /><span className="text-rose-500 text-lg">Would you like to try again?</span></p>
                                                        <div className="flex flex-col md:flex-row gap-4">
                                                            <button
                                                                onClick={handleRetry}
                                                                className="flex-1 py-5 rounded-3xl bg-white text-slate-950 font-black text-xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
                                                            >
                                                                {language === 'en' ? 'RETRY' : 'மீண்டும் முயற்சி'}
                                                            </button>
                                                            <button
                                                                onClick={() => navigate('/activities')}
                                                                className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-semibold text-base hover:bg-slate-700 transition-all border border-white/10"
                                                            >
                                                                {language === 'en' ? 'EXIT' : 'வெளியேறு'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="text-center p-12 bg-gradient-to-b from-slate-900/80 to-slate-950/80 rounded-[4rem] border border-white/10 backdrop-blur-2xl shadow-3xl shadow-blue-500/10"
                                                    >
                                                        <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-orange-500 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-12">
                                                            <FaTrophy className="text-white text-3xl" />
                                                        </div>
                                                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight uppercase leading-none">Time Master</h3>
                                                        <p className="text-slate-400 font-medium mb-10 text-lg max-w-sm mx-auto">You've successfully restored the entire chronological history!</p>
                                                        <button
                                                            onClick={() => navigate('/activities')}
                                                            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold text-xl hover:bg-blue-500 transition-all shadow-lg uppercase tracking-wider"
                                                        >
                                                            {language === 'en' ? 'CLAIM REWARDS' : 'பலன்களைப் பெறு'}
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ChronologyGame;
