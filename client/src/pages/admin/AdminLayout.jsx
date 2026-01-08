import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiPieChart, FiLogOut, FiMenu, FiX, FiGrid, FiBookOpen, FiAward, FiUsers, FiImage, FiBriefcase, FiMoon, FiSun } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const NavItem = ({ to, icon: Icon, label, end = false, setIsSidebarOpen }) => (
    <NavLink
        to={to}
        end={end}
        onClick={() => setIsSidebarOpen(false)}
        className={({ isActive }) => `
            group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm relative overflow-hidden
            ${isActive
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }
        `}
    >
        {({ isActive }) => (
            <>
                <Icon className="text-lg relative z-10" />
                <span className="relative z-10">{label}</span>
                {/* Hover Highlight for inactive state - DISABLED if active to prevent clash */}
                <div className={`absolute inset-0 bg-slate-100 dark:bg-slate-800 transition-opacity duration-300 -z-0 ${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
            </>
        )}
    </NavLink>
);

const AdminLayout = () => {
    const { logout, user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    };

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={isMobile ? (isSidebarOpen ? 'open' : 'closed') : 'open'}
                variants={sidebarVariants}
                className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform lg:transform-none lg:static lg:flex shadow-2xl lg:shadow-none flex flex-col h-full`}
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <span className="font-bold text-xl">G</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Govt<span className="text-blue-600 dark:text-blue-400">Links</span></h2>
                    </NavLink>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <FiX />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">

                    {/* Section: Main */}
                    <div>
                        <p className="px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
                        <div className="space-y-1.5">
                            <NavItem to="/admin" icon={FiPieChart} label="Dashboard" end setIsSidebarOpen={setIsSidebarOpen} />
                        </div>
                    </div>

                    {/* Section: Content */}
                    <div>
                        <p className="px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Content Management</p>
                        <div className="space-y-1.5">
                            <NavItem to="/admin/services" icon={FiGrid} label="Services" setIsSidebarOpen={setIsSidebarOpen} />
                            <NavItem to="/admin/schemes" icon={FiBookOpen} label="Schemes" setIsSidebarOpen={setIsSidebarOpen} />
                            <NavItem to="/admin/jobs" icon={FiBriefcase} label="Jobs" setIsSidebarOpen={setIsSidebarOpen} />
                            <NavItem to="/admin/exams" icon={FiAward} label="Exams" setIsSidebarOpen={setIsSidebarOpen} />
                            <NavItem to="/admin/banners" icon={FiImage} label="Banners" setIsSidebarOpen={setIsSidebarOpen} />
                        </div>
                    </div>

                    {/* Section: System */}
                    <div>
                        <p className="px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">System</p>
                        <div className="space-y-1.5">
                            <NavItem to="/admin/users" icon={FiUsers} label="Users List" setIsSidebarOpen={setIsSidebarOpen} />
                        </div>
                    </div>

                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-bold text-sm group"
                    >
                        <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar */}
                <header className="h-16 md:h-20 px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
                        >
                            <FiMenu className="text-lg" />
                        </button>
                        <h1 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white lg:hidden">
                            Admin<span className="text-blue-600 dark:text-blue-400">Panel</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
                        >
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 uppercase">
                                {user?.username?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{user?.username || 'Admin User'}</p>
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Outlet */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8 custom-scrollbar relative w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
