import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-[#0B1120]/90 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center gap-8 p-8 rounded-3xl">
                {/* Modern Geometric Spinner */}
                <div className="relative w-24 h-24">
                    <motion.span
                        className="absolute block w-full h-full border-4 border-transparent border-t-blue-600 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.span
                        className="absolute block w-full h-full border-4 border-transparent border-r-indigo-500 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.span
                        className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-l-cyan-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center Pulse */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                            className="w-4 h-4 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* Staggered Text */}
                <div className="flex flex-col items-center gap-1">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                        Loading
                    </h3>
                    <div className="flex gap-1.5 h-1.5">
                        <motion.div
                            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                            className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
