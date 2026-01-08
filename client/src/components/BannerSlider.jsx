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
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                className="relative h-[220px] md:h-[300px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/50 group"
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
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        {/* 1. Background Image */}
                        <div className="absolute inset-0">
                            <motion.img
                                key={`img-${current}`}
                                src={banners[current].image}
                                alt="Banner Background"
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 6, ease: "linear" }}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* 2. Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${banners[current].gradient} mix-blend-multiply`}></div>

                        {/* 3. Additional Dark Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-black/20"></div>

                        {/* Abstract Background Patterns */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat mix-blend-overlay"></div>
                        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-black/20 rounded-full blur-3xl mix-blend-multiply"></div>

                        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 md:w-2/3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-flex items-center gap-2 mb-4"
                            >
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2">
                                    <FaBullhorn />
                                    {language === 'en' ? 'Latest Update' : 'புதிய அறிவிப்பு'}
                                </span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-2xl md:text-4xl font-extrabold text-white mb-2 leading-tight"
                            >
                                {language === 'en' ? banners[current].title_en : banners[current].title_ta}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-white/90 text-sm md:text-lg font-medium leading-relaxed max-w-xl"
                            >
                                {language === 'en' ? banners[current].desc_en : banners[current].desc_ta}
                            </motion.p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                >
                    <FaChevronLeft />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                >
                    <FaChevronRight />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrent(index);
                                resetTimeout();
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === current ? "w-8 bg-white" : "bg-white/50 hover:bg-white/80"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BannerSlider;
