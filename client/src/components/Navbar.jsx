import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaGlobe, FaBars, FaSignInAlt, FaSignOutAlt, FaChartPie, FaUserCircle } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { user, logout, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();

    // Robust check for admin privileges
    const isUserAdmin = isAdmin || user?.role === 'admin' || user?.username === 'admin';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 supports-[backdrop-filter]:bg-white/60"
        >
            <div className="container mx-auto px-2 md:px-4 lg:px-12 flex justify-between items-center h-full max-w-7xl">
                <div className="flex items-center gap-2 md:gap-6">
                    <button
                        className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                        onClick={toggleSidebar}
                        aria-label="Menu"
                    >
                        <FaBars className="text-lg md:text-xl" />
                    </button>
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                            <span className="font-bold text-lg md:text-xl">G</span>
                        </div>
                        <span className="hidden xs:inline text-lg md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:opacity-90 transition-opacity">
                            Govt<span className="text-blue-600 dark:text-blue-400">Links</span>
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-1 md:gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <FaGlobe className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
                    </button>
                    {/* Mobile Language Toggle (Icon Only) */}
                    <button
                        onClick={toggleLanguage}
                        className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <FaGlobe />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2.5 md:p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-500 dark:hover:text-yellow-400 transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
                    </button>

                    {/* Auth Buttons */}
                    <div className="pl-2 ml-1 border-l border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        {user ? (
                            <>
                                {isUserAdmin ? (
                                    <Link
                                        to="/admin"
                                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    >
                                        <FaChartPie />
                                        <span>Dashboard</span>
                                    </Link>
                                ) : (
                                    <div className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 font-semibold text-sm">
                                        <FaUserCircle className="text-lg" />
                                        <span>{user.username}</span>
                                    </div>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="p-3 md:px-4 md:py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                                    title="Logout"
                                >
                                    <FaSignOutAlt />
                                    <span className="hidden md:inline text-sm font-bold">Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-slate-800/50 transform hover:-translate-y-0.5 transition-all"
                            >
                                <FaSignInAlt />
                                <span className="hidden md:inline">{language === 'en' ? 'Login' : 'உள்நுழைய'}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
