import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaFire, FaBolt, FaHeart, FaStar, FaLock } from 'react-icons/fa';

const ALL_BADGES = [
    { id: 'First Step', icon: <FaStar />, color: 'text-yellow-500 bg-yellow-100', desc: 'Completed your 1st Quiz' },
    { id: 'High Flyer', icon: <FaBolt />, color: 'text-blue-500 bg-blue-100', desc: 'Reached Level 5' },
    { id: 'Streak Master', icon: <FaFire />, color: 'text-orange-500 bg-orange-100', desc: '3 Day Streak' },
    { id: 'Quiz God', icon: <FaTrophy />, color: 'text-purple-500 bg-purple-100', desc: '100% Score' },
    { id: 'Survivor', icon: <FaHeart />, color: 'text-red-500 bg-red-100', desc: 'Scored 20+ in Survival' },
    { id: 'Speedster', icon: <FaMedal />, color: 'text-emerald-500 bg-emerald-100', desc: 'Scored 15+ in Speed Run' },
];

const Badges = ({ userBadges = [] }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
            {ALL_BADGES.map((badge) => {
                const isUnlocked = userBadges.includes(badge.id);

                return (
                    <motion.div
                        key={badge.id}
                        whileHover={isUnlocked ? { y: -5, scale: 1.05 } : {}}
                        className={`relative group flex flex-col items-center text-center p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-300 h-full ${isUnlocked
                                ? 'bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white dark:border-slate-700'
                                : 'bg-slate-100/50 dark:bg-slate-900/30 border border-transparent blur-[0.5px] opacity-70 grayscale'
                            }`}
                    >
                        <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl shadow-lg mb-3 md:mb-4 transition-transform group-hover:scale-110 ${isUnlocked ? badge.color : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                            {isUnlocked ? badge.icon : <FaLock className="text-xs md:text-sm opacity-50" />}
                        </div>

                        <div className="flex-1 flex flex-col justify-start w-full">
                            <h4 className={`text-xs md:text-sm font-black leading-tight mb-2 ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                {badge.id}
                            </h4>
                            {isUnlocked && <div className="h-0.5 w-6 mx-auto bg-slate-100 dark:bg-slate-700 mb-2 rounded-full"></div>}
                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-slate-400 leading-snug line-clamp-2 md:line-clamp-none">
                                {badge.desc}
                            </p>
                        </div>

                        {isUnlocked && (
                            <div className="absolute top-2 right-2 md:top-3 md:right-3 flex">
                                <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 animate-ping absolute opacity-75"></span>
                                <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 relative"></span>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default Badges;
