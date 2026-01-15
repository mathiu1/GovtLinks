import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import AdUnit from './AdUnit';
import { motion, AnimatePresence } from 'framer-motion';

const BannerPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Do not show on Admin pages
        if (location.pathname.startsWith('/admin')) return;

        // Show banner after 5 seconds delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Do not show on Admin pages
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 left-0 md:top-auto md:bottom-4 md:right-4 z-[60] w-full md:w-[400px] px-4 md:px-0"
            >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 transition-colors shadow-sm"
                    >
                        <FaTimes className="text-xs" />
                    </button>

                    <div className="p-1 px-3 py-6 bg-slate-50/50 dark:bg-slate-900/50">
                        <h4 className="absolute top-2 left-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sponsored</h4>
                        {/* Use a slot suited for rectangle/banner ads */}
                        <AdUnit
                            slot="3792867709"
                            testLabel="Popup Ad Banner"
                            className="!min-h-[100px] md:!min-h-[250px] !bg-transparent !border-0"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BannerPopup;
