import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../context/LanguageContext';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Hero = ({ items, searchQuery, setSearchQuery }) => {
    const { language } = useContext(LanguageContext);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (searchQuery && searchQuery.length > 1) {
            const query = searchQuery.toLowerCase();
            const matches = items.filter(item => {
                const titleEn = item.title_en?.toLowerCase() || '';
                const titleTa = item.title_ta?.toLowerCase() || '';
                const descEn = item.description_en?.toLowerCase() || '';
                return titleEn.includes(query) || titleTa.includes(query) || descEn.includes(query);
            }).slice(0, 5);
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery, items]);

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSuggestionClick = (id) => {
        navigate(`/detail/${id}`);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    return (
        <div className="relative z-20 pb-16 pt-12 text-center px-4 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 dark:border-blue-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    {language === 'en' ? 'Official Government Portal' : 'அதிகாரப்பூர்வ அரசு தளம்'}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white leading-tight">
                    {language === 'en' ? (
                        <>
                            Reimagining Public Services <br className="hidden md:block" /> for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Everyone</span>
                        </>
                    ) : (
                        <>
                            எளிமையான <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">அரசு சேவைகள்</span> <br className="hidden md:block" /> உங்கள் விரல் நுனியில்
                        </>
                    )}
                </h1>

                <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                    {language === 'en' ? 'Navigate through government schemes and services with ease. Fast, reliable, and accessible for every citizen.' : 'அரசுத் திட்டங்கள் மற்றும் சேவைகளை எளிதாக அணுகலாம். விரைவான, நம்பகமான மற்றும் ஒவ்வொரு குடிமகனுக்கும் ஏற்றது.'}
                </p>
            </motion.div>

            <div ref={wrapperRef} className="relative max-w-2xl mx-auto">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative group z-30"
                >
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl group-hover:bg-blue-500/30 transition-all duration-300"></div>
                    <div className="relative flex items-center bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                        <FaSearch className="text-slate-400 text-xl mr-4 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                            placeholder={language === 'en' ? 'Search schemes, documents, services...' : 'திட்டங்கள், ஆவணங்கள், சேவைகளைத் தேடுங்கள்...'}
                            className="w-full bg-transparent outline-none text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
                        />
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden text-left z-50 py-2"
                        >
                            <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {language === 'en' ? 'Suggested' : 'பரிந்துரைக்கப்பட்டது'}
                            </div>
                            {suggestions.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => handleSuggestionClick(item._id)}
                                    className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {language === 'en' ? item.title_en : item.title_ta}
                                        </div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                            {item.sub_category}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">
                                        {language === 'en' ? 'View' : 'பார்க்க'}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Hero;
