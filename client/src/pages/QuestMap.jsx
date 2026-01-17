import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaStar, FaCompass, FaGamepad, FaGlobe, FaCoins, FaCheck } from 'react-icons/fa';
import { FiArrowLeft, FiX, FiShoppingCart } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../api';

// Full list of 40 Subjects
const ISLANDS = [
    { id: 1, name: 'History', name_ta: 'வரலாறு', color: 'amber', icon: '🏰', requiredLevel: 1 },
    { id: 2, name: 'Polity', name_ta: 'அரசியலமைப்பு', color: 'blue', icon: '⚖️', requiredLevel: 2 },
    { id: 3, name: 'Science', name_ta: 'அறிவியல்', color: 'rose', icon: '🧪', requiredLevel: 3 },
    { id: 4, name: 'General Tamil', name_ta: 'தமிழ்', color: 'emerald', icon: '📜', requiredLevel: 4 },
    { id: 5, name: 'Geography', name_ta: 'புவியியல்', color: 'teal', icon: '🌍', requiredLevel: 5 },
    { id: 6, name: 'Economics', name_ta: 'பொருளாதாரம்', color: 'cyan', icon: '💰', requiredLevel: 6 },
    { id: 7, name: 'General Knowledge', name_ta: 'பொது அறிவு', color: 'indigo', icon: '💡', requiredLevel: 7 },
    { id: 8, name: 'English', name_ta: 'ஆங்கிலம்', color: 'violet', icon: '📖', requiredLevel: 8 },
    { id: 9, name: 'INM', name_ta: 'தேசிய இயக்கம்', color: 'purple', icon: '🇮🇳', requiredLevel: 9 },
    { id: 10, name: 'Reasoning', name_ta: 'காரணமறிதல்', color: 'fuchsia', icon: '🧠', requiredLevel: 10 },
    { id: 11, name: 'Computer', name_ta: 'கணினி', color: 'orange', icon: '💻', requiredLevel: 11 },
    { id: 12, name: 'Environment', name_ta: 'சுற்றுச்சூழல்', color: 'lime', icon: '🌱', requiredLevel: 12 },
    { id: 13, name: 'Art & Culture', name_ta: 'கலை மற்றும் கலாச்சாரம்', color: 'pink', icon: '🎨', requiredLevel: 13 },
    { id: 14, name: 'Banking', name_ta: 'வங்கி', color: 'yellow', icon: '🏦', requiredLevel: 14 },
    { id: 15, name: 'Biology', name_ta: 'உயிரியல்', color: 'green', icon: '🧬', requiredLevel: 15 },
    { id: 16, name: 'Physics', name_ta: 'இயற்பியல்', color: 'sky', icon: '⚛️', requiredLevel: 16 },
    { id: 17, name: 'Chemistry', name_ta: 'வேதியியல்', color: 'red', icon: '🧪', requiredLevel: 17 },
    { id: 18, name: 'Sports', name_ta: 'விளையாட்டு', color: 'amber', icon: '🏆', requiredLevel: 18 },
    { id: 19, name: 'Books', name_ta: 'புத்தகங்கள்', color: 'blue', icon: '📚', requiredLevel: 19 },
    { id: 20, name: 'Important Days', name_ta: 'முக்கிய நாட்கள்', color: 'rose', icon: '📅', requiredLevel: 20 },
    { id: 21, name: 'Agriculture', name_ta: 'வேளாண்மை', color: 'emerald', icon: '🌾', requiredLevel: 21 },
    { id: 22, name: 'TN Admin', name_ta: 'தமிழக நிர்வாகம்', color: 'teal', icon: '🏛️', requiredLevel: 22 },
    { id: 23, name: 'Schemes', name_ta: 'திட்டங்கள்', color: 'cyan', icon: '📋', requiredLevel: 23 },
    { id: 24, name: 'Awards', name_ta: 'விருதுகள்', color: 'indigo', icon: '🎖️', requiredLevel: 24 },
    { id: 25, name: 'Organizations', name_ta: 'அமைப்புகள்', color: 'violet', icon: '🏢', requiredLevel: 25 },
    { id: 26, name: 'Psychology', name_ta: 'உளவியல்', color: 'purple', icon: '🤯', requiredLevel: 26 },
    { id: 27, name: 'Botany', name_ta: 'தாவரவியல்', color: 'fuchsia', icon: '🌿', requiredLevel: 27 },
    { id: 28, name: 'Zoology', name_ta: 'விலங்கியல்', color: 'orange', icon: '🐘', requiredLevel: 28 },
    { id: 29, name: 'World History', name_ta: 'உலக வரலாறு', color: 'lime', icon: '🌎', requiredLevel: 29 },
    { id: 30, name: 'Marketing', name_ta: 'சந்தைப்படுத்தல்', color: 'pink', icon: '📈', requiredLevel: 30 },
    { id: 31, name: 'Insurance', name_ta: 'காப்பீடு', color: 'yellow', icon: '🛡️', requiredLevel: 31 },
    { id: 32, name: 'Teaching', name_ta: 'கற்பித்தல்', color: 'green', icon: '👨‍🏫', requiredLevel: 32 },
    { id: 33, name: 'Research', name_ta: 'ஆராய்ச்சி', color: 'sky', icon: '🔬', requiredLevel: 33 },
    { id: 34, name: 'Cyber Security', name_ta: 'இணைய பாதுகாப்பு', color: 'red', icon: '🔐', requiredLevel: 34 },
    { id: 35, name: 'Disaster Mgmt', name_ta: 'பேரிடர் மேலாண்மை', color: 'amber', icon: '🌪️', requiredLevel: 35 },
    { id: 36, name: 'Labour Laws', name_ta: 'தொழிலாளர் சட்டம்', color: 'blue', icon: '🔨', requiredLevel: 36 },
    { id: 37, name: 'Accounting', name_ta: 'கணக்கியல்', color: 'rose', icon: '🧾', requiredLevel: 37 },
    { id: 38, name: 'Indian Culture', name_ta: 'இந்திய கலாச்சாரம்', color: 'emerald', icon: '🕌', requiredLevel: 38 },
    { id: 39, name: 'Communication', name_ta: 'தகவல் தொடர்பு', color: 'teal', icon: '📡', requiredLevel: 39 },
    { id: 40, name: 'Aptitude', name_ta: 'கணிதத் திறன்', color: 'cyan', icon: '📐', requiredLevel: 40 },
];

const QuestMap = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useContext(AuthContext);
    const langContext = useContext(LanguageContext);
    const language = langContext?.language || 'en';
    const toggleLanguage = langContext?.toggleLanguage;
    const [selectedIsland, setSelectedIsland] = useState(null);
    const [purchasingIsland, setPurchasingIsland] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [ripples, setRipples] = useState([]);
    const [compassRotation, setCompassRotation] = useState(0);

    // Progress Logic
    const userLevel = user?.level || 1;
    const unlockedList = user?.unlockedIslands || [];

    // Responsive Logic Listener
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Track clicks for ripples
    const handleClick = (e) => {
        const id = Date.now();
        setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 1000);
    };

    // --- Grid-Snake Layout Logic ---
    const columns = isMobile ? 2 : 3;
    const xSpacing = isMobile ? 160 : 350;
    const rowHeight = isMobile ? 180 : 250;

    // Calculate node positions
    const pathPoints = ISLANDS.map((_, index) => {
        const row = Math.floor(index / columns);
        let col = index % columns;

        // Snake effect: Reverse column order for odd rows
        if (row % 2 !== 0) {
            col = columns - 1 - col;
        }

        // Calculate centering offset
        const totalGridWidth = (columns - 1) * xSpacing;
        const startX = -totalGridWidth / 2;

        const x = startX + (col * xSpacing);
        const y = row * rowHeight + 150;

        return { x, y, row, col };
    });

    // Calculate total height
    const totalRows = Math.ceil(ISLANDS.length / columns);
    const totalHeight = totalRows * rowHeight + 400;

    // --- CURVY PATH GENERATOR ---
    let pathD = `M ${pathPoints[0]?.x || 0} ${pathPoints[0]?.y || 0}`;

    pathPoints.forEach((p, i) => {
        if (i === 0) return;
        const prev = pathPoints[i - 1];

        const isNewRow = p.row !== prev.row;
        if (isNewRow) {
            // 180-Degree Smooth Turn
            const bulgeDir = (prev.row % 2 === 0) ? 1 : -1;
            const bulgeSize = isMobile ? 130 : 220;

            const cp1x = prev.x + (bulgeSize * bulgeDir);
            const cp1y = prev.y; // Start tangent horizontal

            const cp2x = p.x + (bulgeSize * bulgeDir);
            const cp2y = p.y; // End tangent horizontal

            pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
        } else {
            // Perfect Horizontal Line through centers
            pathD += ` L ${p.x} ${p.y}`;
        }
    });

    // Helper to calculate scaling XP progress
    const getLevelProgress = (totalXp) => {
        let level = 1;
        let nextLevelRequirement = 200; // Hardcore Start
        let xpInCurrentLevel = totalXp || 0;

        while (xpInCurrentLevel >= nextLevelRequirement) {
            xpInCurrentLevel -= nextLevelRequirement;
            level++;
            nextLevelRequirement += 200; // Hardcore Step
        }

        return {
            level,
            xpInLevel: xpInCurrentLevel,
            totalNeeded: nextLevelRequirement,
            percentage: (xpInCurrentLevel / nextLevelRequirement) * 100
        };
    };

    const progress = getLevelProgress(user?.xp);

    const handleIslandClick = (island) => {
        const isUnlocked = island.id === 1 || unlockedList.includes(island.id.toString());

        if (!isUnlocked) {
            setPurchasingIsland(island);
            return;
        }

        setSelectedIsland(island);
    };

    const buyIsland = async () => {
        if (!purchasingIsland) return;
        setPurchaseLoading(true);
        try {
            const res = await API.post('/gamification/buy-island', { islandId: purchasingIsland.id });
            if (res.data.user) {
                updateUser(res.data.user);
                setPurchasingIsland(null);
            }
        } catch (error) {
            console.error("Purchase Error", error);
            alert(error.response?.data?.message || "Purchase failed. Check your XP balance.");
        } finally {
            setPurchaseLoading(false);
        }
    };

    const startQuest = () => {
        if (!selectedIsland) return;
        navigate('/game', {
            state: {
                mode: 'quest',
                islandId: selectedIsland.id,
                subject: selectedIsland.name
            }
        });
    };

    return (
        <div
            onClick={handleClick}
            className="min-h-screen bg-[#60a5fa] font-sans relative overflow-x-hidden overflow-y-auto"
        >
            {/* Tropical Ocean Adventure Theme - Rich Color Grading */}
            <div className="fixed inset-0 z-0 bg-[#0ea5e9] pointer-events-none overflow-hidden">
                {/* Deep Ocean Base Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-300 via-sky-400 to-blue-600"></div>

                {/* Moving Water/Wave Gradients */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [-50, 50, -50],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-full h-[60%] bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_70%)] blur-[80px]"
                />

                {/* Sunrays */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_40px,transparent_40px,transparent_80px)] opacity-30"></div>

                {/* Ocean Vignette */}
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(3,105,161,0.5)] pointer-events-none"></div>

                {/* Dynamic Fish Schools 🐟 - Better Organic Movement */}
                {[...Array(5)].map((_, schoolIdx) => (
                    <motion.div
                        key={`school-${schoolIdx}`}
                        initial={{
                            x: `${Math.random() * 100}vw`,
                            y: `${Math.random() * 200}vh`,
                            rotate: 0
                        }}
                        animate={{
                            x: [
                                `${Math.random() * 100}vw`,
                                `${Math.random() * 80 + 10}vw`,
                                `${Math.random() * 80 + 10}vw`,
                                `${Math.random() * 100}vw`
                            ],
                            y: [
                                `${Math.random() * 100}vh`,
                                `${Math.random() * 80 + 10}vh`,
                                `${Math.random() * 80 + 10}vh`,
                                `${Math.random() * 100}vh`
                            ],
                            rotate: [0, 45, -45, 0]
                        }}
                        transition={{
                            duration: 50 + Math.random() * 40,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute pointer-events-none"
                    >
                        {[...Array(4 + Math.floor(Math.random() * 4))].map((_, fishIdx) => (
                            <motion.div
                                key={`fish-${fishIdx}`}
                                style={{
                                    left: Math.sin(fishIdx) * 40,
                                    top: Math.cos(fishIdx) * 25,
                                    fontSize: isMobile ? '14px' : '22px'
                                }}
                                animate={{
                                    x: [0, 15, 0], // Forward surge
                                    y: [0, -5, 0], // Slight vertical bob
                                    rotate: [0, 5, -5, 0], // Tail wag
                                    scaleX: schoolIdx % 2 === 0 ? 1 : -1, // Flip direction if needed
                                    opacity: [0.4, 0.6, 0.4] // Light shimmer
                                }}
                                transition={{
                                    duration: 1.5 + Math.random(),
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: fishIdx * 0.2
                                }}
                                className="absolute opacity-40 grayscale-[0.2] contrast-[1.4]"
                            >
                                🐟
                            </motion.div>
                        ))}
                    </motion.div>
                ))}

                {/* Jumping Dolphin Animation 🐬 (Rare) */}
                <motion.div
                    animate={{
                        x: ['-20vw', '120vw'],
                        y: [400, 250, 400, 250, 400],
                        rotate: [0, -45, 45, -45, 45, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, repeatDelay: 15, ease: "linear" }}
                    className="absolute text-5xl z-10 opacity-60 drop-shadow-2xl"
                >
                    🐬
                </motion.div>

                {/* Mouse Interaction Ripples */}
                <AnimatePresence mode='popLayout'>
                    {ripples.map(ripple => (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="fixed w-12 h-12 border-2 border-white/40 rounded-full pointer-events-none z-50 overflow-visible"
                            style={{
                                left: ripple.x - 24,
                                top: ripple.y - 24,
                                boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                            }}
                        />
                    ))}
                </AnimatePresence>


                {/* Floating Bubbles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`bubble-${i}`}
                        className="absolute rounded-full border border-white/30 bg-white/10"
                        style={{
                            width: 10 + Math.random() * 30,
                            height: 10 + Math.random() * 30,
                            left: `${Math.random() * 100}%`,
                            bottom: `-100px`
                        }}
                        animate={{
                            y: [-100, -1200],
                            x: [0, Math.sin(i) * 50, 0],
                            opacity: [0, 0.6, 0]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 15,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear"
                        }}
                    />
                ))}

                {/* Tropical Birds flying in background */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`bird-${i}`}
                        className="absolute text-2xl z-10 opacity-40 select-none"
                        initial={{ x: '-10vw', y: 100 + (i * 150) }}
                        animate={{ x: '110vw', y: [100 + (i * 150), 50 + (i * 150), 100 + (i * 150)] }}
                        transition={{ duration: 25 + (i * 5), repeat: Infinity, ease: "linear" }}
                    >
                        🕊️
                    </motion.div>
                ))}
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 p-2 md:p-6 flex justify-between items-start pointer-events-none">
                <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
                    <button
                        onClick={() => navigate('/activities')}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-lg active:scale-95 text-sky-600 flex items-center justify-center transition-all border-2 md:border-4 border-white"
                    >
                        <FiArrowLeft className="text-xl md:text-2xl" strokeWidth={3} />
                    </button>

                    <button
                        onClick={() => toggleLanguage()}
                        className="h-10 md:h-12 px-3 md:px-5 rounded-xl md:rounded-2xl bg-white shadow-lg active:scale-95 text-sky-600 flex items-center justify-center gap-2 transition-all border-2 md:border-4 border-white text-[10px] md:text-xs font-black uppercase tracking-widest"
                    >
                        <FaGlobe className="text-blue-500 text-sm md:text-base" />
                        <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
                    </button>
                </div>

                <div className="flex flex-col items-end gap-2 md:gap-3 pointer-events-auto">
                    {/* Level Progress Tracker */}
                    <div className="flex items-center gap-2 md:gap-3 bg-slate-900/90 backdrop-blur-xl px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-white/20 shadow-2xl">
                        <div className="flex flex-col items-start gap-1">
                            <span className="hidden md:block text-[10px] font-black text-sky-400 uppercase tracking-widest leading-none">Level {progress.level} Progress</span>
                            <div className="w-20 md:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.percentage}%` }}
                                    className="h-full bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_0_10px_#38bdf8]"
                                />
                                <div className="absolute inset-0 bg-white/10 h-1/2"></div>
                            </div>
                            <span className="text-[9px] font-black text-sky-300/60 uppercase tabular-nums">
                                {progress.xpInLevel} / {progress.totalNeeded} XP
                            </span>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-sky-500 flex items-center justify-center font-black text-white text-xs md:text-base shadow-lg border-2 border-white/20">
                            {progress.level}
                        </div>
                    </div>

                    <div className="px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-white shadow-lg border-2 md:border-4 border-white flex items-center gap-2 min-w-[70px] md:min-w-[100px] justify-center">
                        <FaStar className="text-yellow-400 drop-shadow-sm text-base md:text-xl" />
                        <span className="font-black text-sky-600 text-sm md:text-lg tabular-nums">
                            {user?.xp || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative w-full max-w-6xl mx-auto min-h-screen pb-32 pt-36 md:pt-40 flex justify-center transition-all duration-300">

                {/* SVG Path */}
                <svg
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full z-0 overflow-visible pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                    style={{
                        height: totalHeight,
                        width: isMobile ? 500 : 1200
                    }}
                    viewBox={isMobile ? `-250 0 500 ${totalHeight}` : `-600 0 1200 ${totalHeight}`}
                >
                    <defs>
                        <filter id="oceanGlow">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <path d={pathD} stroke="rgba(255,255,255,0.2)" strokeWidth={isMobile ? "24" : "34"} fill="none" strokeLinecap="round" />
                    <path d={pathD} stroke="white" strokeWidth={isMobile ? "10" : "14"} fill="none" strokeLinecap="round" strokeDasharray="18 12" filter="url(#oceanGlow)" />

                    {/* Decorative Ship Mascot on Path */}
                    <foreignObject x={-40} y={rowHeight * 1.5 + 130} width={80} height={80}>
                        <motion.div
                            animate={{
                                y: [0, 8, 0],
                                rotate: [-5, 5, -5],
                                x: [0, 5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="text-white text-5xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                        >
                            ⛵
                        </motion.div>
                    </foreignObject>

// Nodes inside SVG for 1:1 coordinate matching
                    {ISLANDS.map((island, index) => {
                        const isUnlocked = island.id === 1 || unlockedList.includes(island.id.toString());
                        const point = pathPoints[index];
                        const isCurrent = island.requiredLevel === userLevel;

                        const colors = {
                            amber: 'from-amber-400 to-orange-500 border-orange-200',
                            orange: 'from-orange-400 to-red-500 border-orange-200',
                            yellow: 'from-yellow-400 to-amber-500 border-yellow-200',
                            emerald: 'from-emerald-400 to-green-500 border-emerald-200',
                            teal: 'from-teal-400 to-emerald-500 border-teal-200',
                            cyan: 'from-cyan-400 to-blue-500 border-cyan-200',
                            blue: 'from-blue-400 to-indigo-500 border-blue-200',
                            indigo: 'from-indigo-400 to-violet-500 border-indigo-200',
                            violet: 'from-violet-400 to-purple-500 border-violet-200',
                            purple: 'from-purple-400 to-fuchsia-500 border-purple-200',
                            fuchsia: 'from-fuchsia-400 to-pink-500 border-fuchsia-200',
                            rose: 'from-rose-400 to-red-500 border-rose-200',
                            pink: 'from-pink-400 to-rose-500 border-pink-200',
                            green: 'from-green-400 to-emerald-500 border-green-200',
                            sky: 'from-sky-400 to-blue-500 border-sky-200',
                            red: 'from-red-400 to-rose-500 border-red-200',
                            lime: 'from-lime-400 to-green-500 border-lime-200',
                        };
                        const colorClass = colors[island.color] || colors.blue;

                        return (
                            <foreignObject
                                key={island.id}
                                x={point.x - (isMobile ? 50 : 80)}
                                y={point.y - (isMobile ? 40 : 60)}
                                width={isMobile ? 100 : 160}
                                height={isMobile ? 150 : 200}
                                className="overflow-visible pointer-events-auto"
                            >
                                <motion.div
                                    className="relative flex flex-col items-center group w-full h-full"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                >
                                    {/* NODE BUTTON */}
                                    <button
                                        onClick={() => handleIslandClick(island)}
                                        className={`
                                            relative rounded-full flex items-center justify-center z-10 
                                            transition-all duration-300 ease-out 
                                            ${isMobile ? 'w-12 h-12 border-[3.5px]' : 'w-20 h-20 border-[6px]'} 
                                            ${isUnlocked
                                                ? `bg-gradient-to-b ${colorClass} shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95`
                                                : 'bg-slate-700/80 border-slate-600/50 shadow-none grayscale hover:scale-110 active:scale-95'
                                            }
                                            border-white
                                        `}
                                    >
                                        {/* Internal Glow for fun look */}
                                        {isUnlocked && (
                                            <div className="absolute inset-0 rounded-full bg-white/20 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}

                                        {/* Scanning Shine Effect */}
                                        {isUnlocked && (
                                            <motion.div
                                                animate={{ x: ['-200%', '200%'] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-45"
                                            />
                                        )}

                                        <span className={`relative z-10 drop-shadow-lg font-black ${isMobile ? 'text-lg' : 'text-3xl'} ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                                            {isUnlocked ? island.id : <FaLock size={isMobile ? 12 : 24} />}
                                        </span>

                                        {/* Splash Effect on Hover */}
                                        {isUnlocked && (
                                            <motion.div
                                                className="absolute -inset-4 border-2 border-white/0 rounded-full z-0"
                                                whileHover={{
                                                    scale: [1, 1.5],
                                                    opacity: [1, 0],
                                                    borderColor: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']
                                                }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                            />
                                        )}
                                        {/* Player Avatar Pulse */}
                                        {isCurrent && (
                                            <motion.div
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute -inset-8 border-4 border-white/30 rounded-full z-0 pointer-events-none"
                                            />
                                        )}
                                    </button>

                                    {/* Interactive Floating Item (Treasure/Crate) */}
                                    {isUnlocked && index % 2 === 0 && (
                                        <motion.div
                                            animate={{ y: [0, 5, 0], x: [0, 3, 0] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="absolute -right-2 top-0 text-xl pointer-events-none drop-shadow-md"
                                        >
                                            {index % 4 === 0 ? '📦' : '💎'}
                                        </motion.div>
                                    )}

                                    {/* Level Node Info Label */}
                                    <div className={`mt-2 w-max transition-opacity ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className="bg-white/90 backdrop-blur text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-md text-slate-600 uppercase tracking-tight shadow-sm border border-white/50 block">
                                            {language === 'en' ? island.name : island.name_ta}
                                        </span>
                                    </div>

                                    {/* PLAYER AVATAR */}
                                    {isCurrent && (
                                        <motion.div
                                            initial={{ y: -50, opacity: 0 }}
                                            animate={{ y: isMobile ? -58 : -75, opacity: 1 }}
                                            className="absolute z-20 pointer-events-none flex flex-col items-center"
                                        >
                                            <motion.div
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden rotate-3"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                                                <motion.div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCompassRotation(prev => prev + 360);
                                                    }}
                                                    animate={{ rotate: compassRotation }}
                                                    transition={{ type: "spring", stiffness: 100 }}
                                                    className="cursor-default active:scale-90 transition-transform"
                                                >
                                                    <FaCompass className="text-sky-600 text-2xl md:text-4xl" />
                                                </motion.div>
                                            </motion.div>
                                            <div className="w-4 h-4 bg-white rotate-45 mt-[-8px] shadow-lg border-b border-r border-slate-100"></div>
                                        </motion.div>
                                    )}

                                    {/* Stars */}
                                    {isUnlocked && island.requiredLevel < userLevel && (
                                        <div className="flex gap-1 mt-2">
                                            {[1, 2, 3].map(s => (
                                                <FaStar key={s} className="text-yellow-400 text-[10px] md:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </foreignObject>
                        );
                    })}
                </svg>
            </div>

            {/* Selection Modal */}
            <AnimatePresence>
                {selectedIsland && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedIsland(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="relative z-10 w-full max-w-xs md:max-w-sm bg-white/95 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 pointer-events-auto border-4 border-white text-center shadow-[0_40px_80px_rgba(3,105,161,0.3)]"
                        >
                            {/* 3D-ish Icon Float */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className={`w-24 h-24 md:w-32 md:h-32 mx-auto -mt-20 md:-mt-24 mb-6 rounded-3xl bg-gradient-to-tr from-${selectedIsland.color}-400 to-${selectedIsland.color}-500 border-8 border-white shadow-2xl flex items-center justify-center text-5xl md:text-6xl`}
                            >
                                <span className="relative z-10 drop-shadow-md">{selectedIsland.icon}</span>
                            </motion.div>

                            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-tight">
                                {language === 'en' ? selectedIsland.name : selectedIsland.name_ta}
                            </h2>
                            <p className="text-sky-500 font-black text-xs md:text-sm mb-8 uppercase tracking-[0.2em]">
                                {language === 'en' ? 'Island Challenge' : 'தீவு சவால்'}
                            </p>

                            <button
                                onClick={startQuest}
                                className={`w-full py-4 md:py-5 rounded-2xl font-black text-white text-lg md:text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-default
                                            ${selectedIsland.color === 'amber' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : ''}
                                            ${selectedIsland.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-red-500' : ''}
                                            ${selectedIsland.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : ''}
                                            ${selectedIsland.color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : ''}
                                            ${selectedIsland.color === 'teal' ? 'bg-gradient-to-r from-teal-400 to-emerald-500' : ''}
                                            ${selectedIsland.color === 'cyan' ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : ''}
                                            ${selectedIsland.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : ''}
                                            ${selectedIsland.color === 'indigo' ? 'bg-gradient-to-r from-indigo-400 to-violet-500' : ''}
                                            ${selectedIsland.color === 'violet' ? 'bg-gradient-to-r from-violet-400 to-purple-500' : ''}
                                            ${selectedIsland.color === 'purple' ? 'bg-gradient-to-r from-purple-400 to-fuchsia-500' : ''}
                                            ${selectedIsland.color === 'fuchsia' ? 'bg-gradient-to-r from-fuchsia-400 to-pink-500' : ''}
                                            ${selectedIsland.color === 'rose' ? 'bg-gradient-to-r from-rose-400 to-red-500' : ''}
                                            ${selectedIsland.color === 'pink' ? 'bg-gradient-to-r from-pink-400 to-rose-500' : ''}
                                            ${selectedIsland.color === 'green' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : ''}
                                            ${selectedIsland.color === 'sky' ? 'bg-gradient-to-r from-sky-400 to-blue-500' : ''}
                                            ${selectedIsland.color === 'red' ? 'bg-gradient-to-r from-red-400 to-rose-500' : ''}
                                            ${selectedIsland.color === 'lime' ? 'bg-gradient-to-r from-lime-400 to-green-500' : ''}
                                        `}
                            >
                                <FaGamepad className="text-2xl" /> {language === 'en' ? 'EXPLORE ISLAND' : 'தீவை ஆராயுங்கள்'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Buy Island Modal */}
            <AnimatePresence>
                {purchasingIsland && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPurchasingIsland(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative z-10 w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-sky-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-sky-400">
                                <FaLock size={32} />
                            </div>

                            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                                {language === 'en' ? 'Island Locked' : 'தீவு பூட்டப்பட்டுள்ளது'}
                            </h2>
                            <p className="text-slate-400 text-sm mb-8 font-medium">
                                {language === 'en'
                                    ? `This island is locked. You can unlock ${purchasingIsland.name} instantly by using 300 XP!`
                                    : `இந்த தீவு பூட்டப்பட்டுள்ளது. 300 XP-யை பயன்படுத்தி ${purchasingIsland.name_ta} தீவை உடனடியாகத் திறக்கலாம்!`}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={buyIsland}
                                    disabled={purchaseLoading || (user?.xp || 0) < 300}
                                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl font-black text-slate-900 flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                >
                                    {purchaseLoading ? (
                                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FaCoins size={20} />
                                            {language === 'en' ? 'BUY FOR 300 XP' : '300 XP-க்கு வாங்கவும்'}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setPurchasingIsland(null)}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-750 rounded-2xl font-black text-white text-sm transition-all active:scale-95"
                                >
                                    {language === 'en' ? 'MAYBE LATER' : 'பிறகு பார்க்கலாம்'}
                                </button>
                            </div>

                            {user?.xp < 300 && (
                                <p className="mt-4 text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">
                                    {language === 'en' ? 'NOT ENOUGH XP' : 'போதுமான XP இல்லை'}
                                </p>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestMap;
