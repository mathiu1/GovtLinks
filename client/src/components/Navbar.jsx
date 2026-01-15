import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaGlobe, FaBars, FaSignInAlt, FaSignOutAlt, FaChartPie, FaUserCircle, FaChevronDown, FaCog } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

// --- User Dropdown Component ---
const UserDropdown = ({ user, isAdmin, handleLogout, language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen(!isOpen);

    const isUserAdmin = isAdmin || user?.role === 'admin' || user?.username === 'admin';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 p-1 pl-1 md:pl-2 pr-1 md:pr-3 rounded-full border border-transparent md:border-slate-200 dark:md:border-slate-700 bg-transparent md:bg-slate-50 dark:md:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer group"
            >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white dark:ring-slate-900 md:ring-0 text-sm md:text-base">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block max-w-[100px] truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {user.username}
                </span>
                <FaChevronDown className={`hidden md:block text-xs text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="font-bold text-slate-900 dark:text-white truncate">{user.username}</p>
                            {isUserAdmin && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    ADMINISTRATOR
                                </span>
                            )}
                        </div>

                        <div className="p-2 space-y-1">
                            {isUserAdmin && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <FaChartPie />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold">Admin Dashboard</p>
                                        <p className="text-xs text-slate-400">Manage site content</p>
                                    </div>
                                </Link>
                            )}

                            <Link
                                to="/profile" // Assuming a profile page exists or just as a placeholder
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <FaCog />
                                </div>
                                <div>
                                    <p className="font-bold">Settings</p>
                                    <p className="text-xs text-slate-400">Account preferences</p>
                                </div>
                            </Link>

                            <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>

                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                    <FaSignOutAlt />
                                </div>
                                <span className="font-bold">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Navbar = ({ toggleSidebar }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { user, logout, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 supports-[backdrop-filter]:bg-white/60 shadow-sm dark:shadow-none"
        >
            <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center h-full max-w-7xl">
                {/* Left: Menu & Logo */}
                <div className="flex items-center gap-3 md:gap-6">
                    <button
                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
                        onClick={toggleSidebar}
                        aria-label="Menu"
                    >
                        <FaBars className="text-lg" />
                    </button>

                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                            <span className="font-bold text-lg md:text-xl">G</span>
                        </div>
                        <span className="text-xl hidden md:block md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                            Govt<span className="text-blue-600 dark:text-blue-400">Links</span>
                        </span>
                    </Link>
                </div>

                {/* Center: Navigation Links (Desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Exam Prep link removed as populated in sidebar */}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Language (Compact on Mobile) */}
                    <button
                        onClick={toggleLanguage}
                        className="h-10 px-3 md:px-4 flex items-center gap-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title="Change Language"
                    >
                        <FaGlobe className={`text-lg ${language === 'en' ? 'text-slate-400' : 'text-blue-500'}`} />
                        <span className="hidden md:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
                        <span className="md:hidden text-xs uppercase">{language === 'en' ? 'TA' : 'EN'}</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-500 dark:hover:text-yellow-400 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
                    </button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    {/* Auth Section */}
                    {user ? (
                        <UserDropdown
                            user={user}
                            isAdmin={isAdmin}
                            handleLogout={handleLogout}
                            language={language}
                        />
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg shadow-slate-200 dark:shadow-slate-800/10 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            <FaSignInAlt />
                            <span className="hidden sm:inline">{language === 'en' ? 'Login' : 'உள்நுழைய'}</span>
                        </Link>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
