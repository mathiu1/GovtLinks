import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import AdUnit from './AdUnit';
import { motion, AnimatePresence } from 'framer-motion';

const BannerPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // Do not show on Admin pages
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    useEffect(() => {
        // Show banner after 5 seconds delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-4 right-4 z-50 w-[320px] md:w-[400px]"
            >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                    >
                        <FaTimes />
                    </button>

                    <div className="p-1 pt-8 md:p-4 md:pt-8 bg-slate-50/50 dark:bg-slate-900/50">
                        <h4 className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sponsored</h4>
                        {/* Use a slot suited for rectangle/banner ads */}
                        <AdUnit
                            slot="3792867709"
                            testLabel="Popup Ad Banner"
                            className="!min-h-[250px] !bg-transparent !border-0"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BannerPopup;
