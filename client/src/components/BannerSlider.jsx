import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaBullhorn } from 'react-icons/fa';
import { LanguageContext } from '../context/LanguageContext';
import API from '../api';

const BannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const { language } = useContext(LanguageContext);
    const timeoutRef = useRef(null);
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await API.get('/banners');
                if (res.data && res.data.length > 0) {
                    setBanners(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch banners", error);
            }
        };
        fetchBanners();
    }, []);

    const nextSlide = () => {
        if (banners.length === 0) return;
        setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        if (banners.length === 0) return;
        setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        if (!paused && banners.length > 1) {
            resetTimeout();
            timeoutRef.current = setTimeout(
                () => setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1)),
                5000
            );
            return () => resetTimeout();
        }
    }, [current, paused, banners]);

    if (banners.length === 0) return null; // Don't show if no banners

    const handleTouchStart = (e) => {
        touchStartX.current = e.targetTouches[0].clientX;
        setPaused(true);
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        setPaused(false);
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    return (
        <div
            className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-16"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                className="relative h-[280px] md:h-[450px] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group bg-slate-100 dark:bg-slate-900"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="absolute inset-0"
                    >
                        {/* 1. Background Image with Parallax Zoom */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.img
                                key={`img-${current}`}
                                src={banners[current].image}
                                alt="Banner Background"
                                initial={{ scale: 1.2, rotate: 1 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 10, ease: "linear" }}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* 2. Layered Premium Gradient Overlays */}
                        <div className={`absolute inset-0 bg-gradient-to-tr ${banners[current].gradient} opacity-80 md:opacity-70 mix-blend-multiply`}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block"></div>

                        {/* Decorative Premium Elements */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-[120px] mix-blend-overlay animate-pulse"></div>
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black rounded-full blur-[100px] mix-blend-multiply"></div>
                        </div>

                        {/* Text Content Area */}
                        <div className="relative h-full container mx-auto flex flex-col justify-end md:justify-center p-8 pr-12 md:p-20">
                            <div className="max-w-3xl">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="inline-flex items-center gap-2 mb-6"
                                >
                                    <span className="bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-white/20 shadow-xl flex items-center gap-2">
                                        <FaBullhorn className="text-blue-300" />
                                        {language === 'en' ? 'Exclusive Insight' : 'முக்கிய அறிவிப்பு'}
                                    </span>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.7, ease: "backOut" }}
                                    className={`${language === 'ta' ? 'text-2xl md:text-7xl' : 'text-3xl md:text-7xl'} font-[1000] text-white mb-4 md:mb-6 leading-[1.2] md:leading-[1.1] tracking-tighter drop-shadow-2xl`}
                                >
                                    {language === 'en' ? banners[current].title_en : banners[current].title_ta}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.7 }}
                                    className={`text-white/80 ${language === 'ta' ? 'text-sm md:text-2xl' : 'text-base md:text-2xl'} font-medium leading-relaxed max-w-2xl drop-shadow-lg mb-8 md:mb-0`}
                                >
                                    {language === 'en' ? banners[current].desc_en : banners[current].desc_ta}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="hidden md:block mt-8"
                                >
                                    <button className={`px-10 py-5 bg-white text-slate-900 rounded-2xl font-[1000] ${language === 'ta' ? 'text-base' : 'text-lg'} shadow-2xl hover:bg-slate-50 hover:-translate-y-1.5 transition-all active:scale-95 flex items-center gap-3 group/btn`}>
                                        {language === 'en' ? 'Learn More' : 'மேலும் அறிய'}
                                        <FaChevronRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* 1. Desktop Vertical Indicators */}
                <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-20">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrent(index);
                                resetTimeout();
                            }}
                            className={`group relative flex items-center justify-end gap-3`}
                        >
                            <span className={`text-[10px] font-black text-white uppercase tracking-widest transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 ${index === current ? 'opacity-100 translate-x-0' : ''}`}>
                                0{index + 1}
                            </span>
                            <div className={`h-1.5 rounded-full transition-all duration-500 bg-white shadow-lg ${index === current ? "w-12" : "w-3 opacity-40 hover:opacity-100"}`} />
                        </button>
                    ))}
                </div>

                {/* 2. Mobile Horizontal Indicators */}
                <div className="absolute bottom-6 left-8 flex md:hidden gap-1.5 z-20">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrent(index);
                                resetTimeout();
                            }}
                            className={`h-1 rounded-full transition-all duration-500 bg-white shadow-lg ${index === current ? "w-8" : "w-2 opacity-40"}`}
                        />
                    ))}
                </div>

                {/* Glass Arrows - Desktop Specific */}
                <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-3xl border border-white/10 hidden md:flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 shadow-2xl z-30"
                >
                    <FaChevronLeft size={20} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex md:hidden items-center justify-center text-white shadow-2xl z-30"
                >
                    <FaChevronRight size={14} />
                </button>

                {/* Visual "Neural" Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 pointer-events-none mix-blend-overlay"></div>
            </div>
        </div>
    );
};

export default BannerSlider;
