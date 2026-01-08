import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaArrowLeft, FaExclamation, FaBriefcase, FaGraduationCap, FaLandmark } from 'react-icons/fa';

const NotFound = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate('/');
        }
    };

    const quickLinks = [
        { icon: <FaBriefcase />, label: 'Jobs', path: '/' },
        { icon: <FaGraduationCap />, label: 'Exams', path: '/' },
        { icon: <FaLandmark />, label: 'Schemes', path: '/' },
    ];

    return (
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#080d1a] flex items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Soft Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-lg bg-white dark:bg-[#111929] rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-6 md:p-10 relative z-10 overflow-hidden"
            >
                {/* Top Shine Effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>

                <div className="flex flex-col items-center text-center">

                    {/* Animated Icon Container */}
                    <div className="relative mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center relative z-10">
                            <FaExclamation className="text-3xl md:text-4xl text-red-500" />
                        </div>
                        {/* Pulsing Rings */}
                        <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping opacity-75 duration-1000"></div>
                        <div className="absolute inset-2 bg-red-500/20 rounded-full animate-pulse"></div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Page Not Found
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-8 leading-relaxed px-2">
                        Something went wrong. The page you are looking for has been removed or doesn't exist.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full mb-6 relative group">
                        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-focus-within:opacity-10 rounded-2xl transition-opacity pointer-events-none"></div>
                        <input
                            type="text"
                            placeholder="E.g. Aadhaar, Jobs, Loans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 md:h-14 pl-4 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all text-sm md:text-base font-medium"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1.5 bottom-1.5 w-10 md:w-11 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <FaSearch />
                        </button>
                    </form>

                    {/* Quick Links (Mobile Friendly) */}
                    <div className="w-full grid grid-cols-3 gap-3 mb-8">
                        {quickLinks.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(link.path)}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all group"
                            >
                                <span className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-lg">
                                    {link.icon}
                                </span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {link.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Primary Actions */}
                    <div className="w-full flex flex-col md:flex-row gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="flex-1 py-3.5 px-6 bg-transparent border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <FaArrowLeft />
                            <span>Go Back</span>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-[2] py-3.5 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <FaHome />
                            <span>Back to Home</span>
                        </button>
                    </div>

                </div>
            </motion.div>

            {/* Sticky/Fixed Footer Links for very small screens? No, stick to centralized card */}
            <div className="absolute bottom-6 text-center text-xs text-slate-400 dark:text-slate-600">
                GovtLinks &copy; {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default NotFound;
