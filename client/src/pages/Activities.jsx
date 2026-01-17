import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaHeart, FaGamepad, FaMapMarkedAlt, FaTrophy, FaArrowLeft, FaGift, FaHistory, FaClock, FaArrowRight, FaStar, FaShieldAlt, FaLink } from 'react-icons/fa';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import confetti from 'canvas-confetti';
import Badges from '../components/Badges';

const ActivityCard = ({ title, desc, icon, color, onClick, badge, isLocked }) => (
    <motion.div
        whileHover={!isLocked ? { y: -10, scale: 1.02 } : {}}
        whileTap={!isLocked ? { scale: 0.98 } : {}}
        onClick={!isLocked ? onClick : null}
        className={`group relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 ${isLocked ? 'grayscale opacity-70 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-blue-500/10'}`}
    >
        {/* Glow Effect */}
        <div className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${color}`}></div>

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-3xl text-white shadow-lg shadow-current/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    {icon}
                </div>
                {badge && (
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        {badge}
                    </span>
                )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                {desc}
            </p>

            <div className="mt-auto flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                <span>{isLocked ? 'Locked' : 'Start Activity'}</span>
                {!isLocked && <FaArrowRight className="group-hover:translate-x-2 transition-transform" />}
            </div>
        </div>

        {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-full shadow-lg">
                    <span className="text-2xl">🔒</span>
                </div>
            </div>
        )}
    </motion.div>
);

const Activities = () => {
    const { language } = useContext(LanguageContext);
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isSpinning, setIsSpinning] = useState(false);
    const [reward, setReward] = useState(null);
    const [showSpinModal, setShowSpinModal] = useState(false);
    const [lastSpinDate, setLastSpinDate] = useState(localStorage.getItem('lastSpinDate'));

    const canSpin = !lastSpinDate || new Date(lastSpinDate).toDateString() !== new Date().toDateString();

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

    const handleSpin = async () => {
        if (!user) {
            alert(language === 'en' ? "Please login to spin!" : "சுழற்ற உள்நுழையவும்!");
            return;
        }
        if (isSpinning || !canSpin) return;

        setIsSpinning(true);

        // Randomly pick a reward
        const rewards = [
            { type: 'xp', value: 50, label: '50 XP' },
            { type: 'xp', value: 100, label: '100 XP' },
            { type: 'shield', value: 1, label: '1 Shield' },
            { type: 'xp', value: 200, label: 'Bonus 200 XP' }
        ];

        const win = rewards[Math.floor(Math.random() * rewards.length)];

        // Simulate spin delay
        setTimeout(async () => {
            setIsSpinning(false);
            setReward(win);

            // Update Backend/State
            try {
                if (win.type === 'xp') {
                    await API.post('/gamification/quiz-result', { score: 0, totalQuestions: 0, bonus: win.value });
                    updateUser({ xp: (user.xp || 0) + win.value });
                } else if (win.type === 'shield') {
                    await API.post('/gamification/update-shields', { change: 1 });
                    updateUser({ shields: (user.shields || 0) + 1 });
                }

                const today = new Date().toISOString();
                localStorage.setItem('lastSpinDate', today);
                setLastSpinDate(today);

                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3B82F6', '#8B5CF6', '#F59E0B']
                });
            } catch (error) {
                console.error("Spin reward failed", error);
            }
        }, 3000);
    };

    return (
        <div className="min-h-screen pt-24 md:pt-24 pb-20 px-4 md:px-8 lg:p-12 lg:ml-72 max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <header className="mb-12 relative">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-600/5">
                            <FaBolt className="animate-pulse" /> {language === 'en' ? 'Game Center' : 'விளையாட்டு மையம்'}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-[1000] text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-4">
                            {language === 'en' ? 'Learn Faster. ' : 'வேகமாகக் கற்றுக் கொள்ளுங்கள். '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                {language === 'en' ? 'Play Smarter.' : 'புத்திசாலித்தனமாக விளையாடுங்கள்.'}
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'en'
                                ? 'Turn your exam preparation into a rewarding journey with interactive challenges and daily wins.'
                                : 'உங்கள் தேர்வு பயிற்சியை ஊடாடும் சவால்கள் மற்றும் தினசரி வெற்றிகளுடன் பயனுள்ள பயணமாக மாற்றவும்.'}
                        </p>
                    </div>

                    {/* Stats Dashboard */}
                    <AnimatePresence>
                        {user && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 lg:grid-cols-3 gap-3"
                            >
                                <div className="p-4 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-slate-800 shadow-xl min-w-[140px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FaBolt className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Level {user.level || 1}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress.percentage}%` }}
                                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                            />
                                        </div>
                                        <div className="text-xs font-black text-blue-600 dark:text-blue-400 tabular-nums">
                                            {progress.xpInLevel} <span className="text-[10px] text-slate-400">/ {progress.totalNeeded} XP</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-slate-800 shadow-xl min-w-[140px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FaStar className="text-yellow-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">XP Balance</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{user.xp || 0}</div>
                                </div>
                                <div className="p-4 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-slate-800 shadow-xl min-w-[140px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FaShieldAlt className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shields</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{user.shields || 0}</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </header>

            {/* Daily Reward Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/20 rounded-full blur-[80px] animate-pulse"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                                {language === 'en' ? 'Your Daily Lucky Spin' : 'உங்கள் தினசரி லக்கி ஸ்பின்'}
                            </h2>
                            <p className="text-indigo-100 text-lg mb-8 font-medium max-w-md opacity-80">
                                {language === 'en'
                                    ? 'Spin the wheel every 24 hours to win bonus XP or shields to save your lives in Survival Mode!'
                                    : 'தினசரி ஒருமுறை சுழற்றி போனஸ் XP அல்லது உயிர் காக்கும் ஷீல்டுகளை வெல்லுங்கள்!'}
                            </p>

                            {!canSpin ? (
                                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold">
                                    <FaClock />
                                    {language === 'en' ? 'Next spin available tomorrow' : 'அடுத்த ஸ்பின் நாளை கிடைக்கும்'}
                                </div>
                            ) : (
                                <button
                                    onClick={handleSpin}
                                    disabled={isSpinning}
                                    className="px-10 py-5 bg-white text-indigo-900 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto md:mx-0"
                                >
                                    {isSpinning ? (language === 'en' ? 'Spinning...' : 'சுழல்கிறது...') : (language === 'en' ? 'Spin Wheel Now' : 'இப்போதே சுழற்றுங்கள்')}
                                    {!isSpinning && <FaBolt className="animate-bounce" />}
                                </button>
                            )}
                        </div>

                        {/* Visual Wheel Placeholder / Animation */}
                        <div className="relative">
                            <motion.div
                                animate={isSpinning ? { rotate: 1800 } : { rotate: 0 }}
                                transition={{ duration: 3, ease: "circOut" }}
                                className="w-56 h-56 md:w-72 md:h-72 rounded-full border-[10px] border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-xl relative"
                            >
                                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                                    <div className="border-r border-b border-white/10 flex items-center justify-center"><span className="text-2xl">⭐</span></div>
                                    <div className="border-b border-white/10 flex items-center justify-center"><span className="text-2xl">🛡️</span></div>
                                    <div className="border-r border-white/10 flex items-center justify-center"><span className="text-2xl">⚡</span></div>
                                    <div className="flex items-center justify-center"><span className="text-2xl">💎</span></div>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-2xl z-20">
                                    <FaBolt size={24} />
                                </div>
                                {/* Pointer */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 z-30 shadow-lg"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <ActivityCard
                    title={language === 'en' ? 'Survival Mode' : 'சர்வைவல் முறை'}
                    desc={language === 'en' ? 'Test your expertise with 3 lives. One mistake and you lose one. How far can you go?' : '3 உயிர்களுடன் உங்கள் திறமையை சோதிக்கவும். ஒரு தவறு ஒரு உயிரை இழக்கச் செய்யும்.'}
                    icon={<FaHeart />}
                    color="bg-rose-500 shadow-rose-500/20"
                    badge="Most Fun"
                    onClick={() => navigate('/game', { state: { mode: 'survival' } })}
                />

                <ActivityCard
                    title={language === 'en' ? 'Quiz Quest' : 'வினாடி வினா குவெஸ்ட்'}
                    desc={language === 'en' ? 'Embark on a map journey! Unlock new subject islands by getting 10/10 in quizzes.' : 'வரைபடப் பயணத்தைத் தொடங்குங்கள்! 10/10 மதிப்பெண்களைப் பெற்று புதிய பாடத் தீவுகளைத் திறக்கவும்.'}
                    icon={<FaMapMarkedAlt />}
                    color="bg-emerald-500 shadow-emerald-500/20"
                    badge="RPG Map"
                    onClick={() => navigate('/quest')}
                />

                <ActivityCard
                    title={language === 'en' ? 'Speed Run' : 'வேகமான பயிற்சி'}
                    desc={language === 'en' ? 'Can you answer 20 questions in under 2 minutes? Race against the clock!' : '2 நிமிடங்களில் 20 கேள்விகளுக்குப் பதிலளிக்க முடியுமா? கடிகாரத்துடன் போட்டியிடுங்கள்!'}
                    icon={<FaGamepad />}
                    color="bg-amber-500 shadow-amber-500/20"
                    badge="Timed"
                    isLocked={user?.level < 2}
                    onClick={() => navigate('/game', { state: { mode: 'speedrun' } })}
                />

                <ActivityCard
                    title={language === 'en' ? 'Chronology Conquest' : 'காலவரிசைப் போர்'}
                    desc={language === 'en' ? 'Master History! Drag and drop events into the correct timeline order before time runs out.' : 'வரலாற்றில் தேர்ச்சி பெறுங்கள்! நேரம் முடிவதற்குள் நிகழ்வுகளை சரியான வரிசையில் வரிசைப்படுத்தவும்.'}
                    icon={<FaHistory />}
                    color="bg-purple-500 shadow-purple-500/20"
                    badge="New Game"
                    onClick={() => navigate('/chronology')}
                />

            </div>

            {/* Your Badges Collection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-20 mb-12 p-8 md:p-12 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-3">
                            <FaTrophy className="text-sm" /> {language === 'en' ? 'Achievements' : 'சாதனைகள்'}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight">
                            {language === 'en' ? 'Your Trophy Case' : 'உங்கள் கோப்பைகள்'}
                        </h2>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Earned</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{(user?.badges || []).length} <span className="text-slate-400 text-lg">/ {6}</span></p>
                    </div>
                </div>

                <Badges userBadges={user?.badges || []} />
            </motion.div>

            {/* Spin Reward Modal */}
            <AnimatePresence>
                {reward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] text-center max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl"
                        >
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-4xl mb-6 shadow-xl">
                                {reward.type === 'shield' ? '🛡️' : '✨'}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                {language === 'en' ? 'Congratulations!' : 'வாழ்த்துகள்!'}
                            </h3>
                            <p className="text-slate-500 font-medium mb-8">
                                {language === 'en' ? `You won ${reward.label} !` : `நீங்கள் ${reward.label} -ஐ வென்றீர்கள்!`}
                            </p>
                            <button
                                onClick={() => setReward(null)}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                            >
                                {language === 'en' ? 'Claim Reward' : 'பலனை பெற்றுக்கொள்'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Activities;
