import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaHome } from 'react-icons/fa';

const ErrorPage = ({ message = "Something went wrong. Please try again later." }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10 text-center"
            >
                <div className="w-20 h-20 md:w-24 md:h-24 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-red-500 shadow-xl shadow-red-500/20 transform -rotate-6">
                    <FaExclamationTriangle className="text-4xl md:text-5xl" />
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                    Oops! Error Occurred
                </h1>

                <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed max-w-sm mx-auto">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transform transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        <FaHome />
                        <span>Return Home</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ErrorPage;
