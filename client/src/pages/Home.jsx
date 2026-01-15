import React, { useEffect, useState, useContext, useMemo, memo } from 'react';
import { fetchItems, prefetchItem } from '../api'; // Import prefetch
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { FaLayerGroup, FaFileAlt, FaIdCard, FaLandmark, FaSeedling, FaFemale, FaGraduationCap, FaHome, FaGlobe, FaBus, FaFileContract, FaBriefcase, FaHeartbeat, FaChevronRight, FaSearch, FaBolt, FaTimes, FaFingerprint, FaAddressCard, FaVoteYea, FaShoppingBasket, FaPassport, FaPiggyBank, FaRupeeSign, FaMapMarkedAlt, FaCar, FaFileSignature, FaLightbulb, FaRobot, FaCheckCircle } from 'react-icons/fa';
import Hero from '../components/Hero';
import AdUnit from '../components/AdUnit';

import { serviceTopics, schemeTopics, careerTopics } from '../constants/topicData.jsx';

import BannerSlider from '../components/BannerSlider';

// --- Skeleton Component ---
const CardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-full flex flex-col gap-4 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
            <div className="w-5/6 h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
    </div>
);

// --- Helper: Get Icon/Image and Color ---
const getCategoryIcon = (subCategory) => {
    // ... [No changes] ...
    switch (subCategory) {
        case 'Aadhaar':
            return {
                type: 'image',
                src: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png",
                icon: <FaFingerprint />,
                color: "text-red-600 bg-red-50 dark:bg-red-900/20"
            };
        case 'PAN Card':
            return {
                type: 'image',
                src: "https://www.shutterstock.com/image-vector/pan-card-permanent-account-number-260nw-2603373875.jpg",
                icon: <FaAddressCard />,
                color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
            };
        case 'Voter ID':
            return {
                type: 'image',
                src: "https://voters.eci.gov.in/static/media/Portallogo.239672214918b407e9c7d3e4312b8ac4.svg",
                icon: <FaVoteYea />,
                color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
            };
        case 'Ration Card':
            return {
                type: 'image',
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/TamilNadu_Logo.svg/1200px-TamilNadu_Logo.svg.png",
                icon: <FaShoppingBasket />,
                color: "text-green-600 bg-green-50 dark:bg-green-900/20"
            };
        case 'Passport':
            return {
                type: 'image',
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Passport_Seva_Logo.png/800px-Passport_Seva_Logo.png",
                icon: <FaPassport />,
                color: "text-blue-700 bg-blue-50 dark:bg-blue-900/20"
            };
        case 'PF / EPF':
            return {
                type: 'image',
                src: "https://www.epfindia.gov.in/images/EPFO_Logo.png",
                icon: <FaPiggyBank />,
                color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20"
            };
        case 'Income Tax':
            return {
                type: 'icon',
                icon: <FaRupeeSign />,
                color: "text-green-700 bg-green-50 dark:bg-green-900/20"
            };
        case 'Land Records':
            return {
                type: 'image',
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/TamilNadu_Logo.svg/1200px-TamilNadu_Logo.svg.png",
                icon: <FaMapMarkedAlt />,
                color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
            };
        case 'Transport':
            return {
                type: 'icon',
                icon: <FaCar />,
                color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
            };
        case 'Revenue Dept':
            return {
                type: 'image',
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/TamilNadu_Logo.svg/1200px-TamilNadu_Logo.svg.png",
                icon: <FaFileSignature />,
                color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20"
            };
        case 'Electricity / EB':
            return {
                type: 'image',
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/TANGEDCO_Logo.png/600px-TANGEDCO_Logo.png",
                icon: <FaLightbulb />,
                color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
            };
        case 'Agriculture':
            return {
                type: 'icon',
                icon: <FaSeedling />,
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
            };
        case 'Health':
            return {
                type: 'icon',
                icon: <FaHeartbeat />,
                color: "text-red-500 bg-red-50 dark:bg-red-900/20"
            };
        default:
            return {
                type: 'icon',
                icon: <FaLayerGroup />,
                color: "text-slate-500 bg-slate-100 dark:bg-slate-800"
            };
    }
};

// --- Component: Service Icon with Fallback ---
const ServiceIcon = memo(({ config, className }) => {
    const [imgError, setImgError] = useState(false);

    if (config.type === 'image' && !imgError) {
        return (
            <img
                src={config.src}
                alt="Service Logo"
                className={className || "w-full h-full object-contain p-1"}
                loading="lazy"
                onError={() => setImgError(true)}
            />
        );
    }

    return <span className={className || "text-lg"}>{config.icon}</span>;
});

// --- Service Card Component ---
const ServiceCard = memo(({ item, language, navigate, prefetchItem }) => {
    const iconConfig = getCategoryIcon(item.sub_category);
    const isJob = item.category === 'Job';
    const isExam = item.category === 'Exam';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => navigate(`/detail/${item._id}`)}
            onMouseEnter={() => prefetchItem(item._id)}
            className="group relative flex flex-col h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/50 dark:border-slate-800/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(30,58,138,0.15)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer overflow-hidden"
        >
            {/* Glossy Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col gap-1.5">
                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] border border-slate-900/5 dark:border-white/5 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
                        {item.sub_category}
                    </span>
                    {isJob && item.vacancies && (
                        <span className="inline-flex px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-500/10">
                            {language === 'en' ? `+${item.vacancies} Posts` : `+${item.vacancies} இடங்கள்`}
                        </span>
                    )}
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden shadow-inner border border-white/40 dark:border-white/10 ${iconConfig.color} group-hover:scale-110 group-hover:rotate-3 shadow-xl`}>
                    <ServiceIcon config={iconConfig} className="text-2xl" />
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-3 leading-[1.2] tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {language === 'en' ? item.title_en : item.title_ta}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {language === 'en' ? item.description_en : item.description_ta}
                </p>

                {(isJob || isExam) && item.applicationEndDate && (
                    <div className="mt-auto mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {language === 'en' ? 'Closing:' : 'முடிவு:'} <span className="text-red-500/80">{new Date(item.applicationEndDate).toLocaleDateString()}</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Footer Interaction */}
            <div className="relative z-10 pt-4 border-t border-slate-900/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-black text-blue-600/80 dark:text-blue-400/80 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                    {language === 'en' ? 'Explore Details' : 'விவரங்களை காண்க'}
                </span>
                <FaChevronRight className="text-[10px] text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Hover Glimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-x-full group-hover:translate-x-full ease-in-out duration-[1500ms]"></div>

            {/* Abstract Background Bloom */}
            <div className={`absolute -right-12 -bottom-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-all duration-700 ${iconConfig.color}`}></div>
        </motion.div>
    );
});


// --- Exam Prep Section ---
const ExamPrepSection = ({ language, navigate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 relative group"
        >
            {/* Mesh Gradient / Animated Background */}
            <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-400/5 rounded-[2.5rem] -m-4 blur-2xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>

            <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 rounded-[2.5rem] p-8 md:p-16 shadow-[0_40px_80px_-15px_rgba(30,58,138,0.3)]">
                {/* Decorative mesh blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-400/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 md:w-80 md:h-80 bg-indigo-500/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse delay-700"></div>

                <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center text-left">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-xl"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {language === 'en' ? 'Live Examination Prep' : 'நேரடி தேர்வு பயிற்சி'}
                        </motion.div>

                        <h2 className={`${language === 'ta' ? 'text-2xl md:text-6xl' : 'text-3xl md:text-6xl'} font-[1000] text-white mb-6 leading-[1.3] md:leading-[1.1] tracking-tight`}>
                            {language === 'en' ? 'Conquer the Top' : 'சிகரத்தை எட்டிப் பிடியுங்கள்'} <br />
                            <span className="text-blue-300">{language === 'en' ? 'Govt Exams' : 'அரசுத் தேர்வுகள்'}</span>
                        </h2>

                        <p className="text-blue-100/80 text-base md:text-xl mb-10 leading-relaxed max-w-lg font-medium">
                            {language === 'en'
                                ? 'Join thousands of aspirants mastering TNPSC, UPSC, and SSC with validated patterns and expert-curated modules.'
                                : 'ஆயிரக்கணக்கான அரசுப் பணி ஆர்வலர்களுடன் இணைந்து TNPSC, UPSC மற்றும் SSC தேர்வுகளை எளிதாக எதிர்கொள்ளுங்கள்.'}
                        </p>

                        <button
                            onClick={() => navigate('/quiz')}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-4 px-10 py-5 bg-white text-blue-900 rounded-2xl font-[1000] ${language === 'ta' ? 'text-base' : 'text-lg'} shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.4)] hover:-translate-y-1.5 transition-all active:scale-[0.98] group/btn`}
                        >
                            {language === 'en' ? 'Start Free Mock' : 'இலவச பயிற்சியைத் தொடங்கு'}
                            <FaChevronRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="relative hidden lg:grid grid-cols-2 gap-4">
                        {/* Interactive Bento Tags */}
                        <motion.div whileHover={{ scale: 1.05 }} className="p-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col justify-end h-40 group/item">
                            <span className="text-white text-3xl font-black mb-1">TNPSC</span>
                            <span className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest">{language === 'en' ? 'Group I, II, IV' : 'குரூப் I, II, IV'}</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="p-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col justify-end h-40 mt-8 group/item">
                            <span className="text-white text-3xl font-black mb-1">UPSC</span>
                            <span className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest">{language === 'en' ? 'Prelims & Mains' : 'முதல்நிலை & முதன்மை'}</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="p-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col justify-end h-40 -mt-8 group/item">
                            <span className="text-white text-3xl font-black mb-1">SSC</span>
                            <span className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest">{language === 'en' ? 'CGL, CHSL, MTS' : 'CGL, CHSL, MTS'}</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-400 to-indigo-500 p-8 rounded-3xl shadow-2xl flex items-center justify-center h-40 group/item">
                            <FaBolt className="text-white text-5xl animate-bounce" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AIPracticeSection = ({ language, navigate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-20 relative group"
        >
            {/* Soft Shadow Glow under the card */}
            <div className="absolute inset-x-0 -bottom-10 h-20 bg-indigo-600/10 dark:bg-indigo-400/5 blur-[80px] rounded-full mx-auto w-4/5 pointer-events-none"></div>

            <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-indigo-100/50 dark:border-slate-800/50 rounded-[3rem] p-8 md:p-16 flex flex-col items-center text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">

                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm border border-indigo-600/5">
                        <FaRobot className="animate-spin-slow" />
                        {language === 'en' ? 'Adaptive AI Core' : 'மேம்பட்ட AI கற்றல்'}
                    </div>

                    <h2 className={`${language === 'ta' ? 'text-2xl md:text-6xl' : 'text-3xl md:text-6xl'} font-[1000] text-slate-900 dark:text-white mb-8 leading-[1.3] md:leading-[1.2] tracking-tight`}>
                        {language === 'en' ? 'Supercharge Learning with' : 'உங்கள் கற்றலை ஊக்குவியுங்கள்'} <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{language === 'en' ? 'Personal AI Tutoring' : 'தனிப்பயனாக்கப்பட்ட AI பயிற்சி'}</span>
                    </h2>

                    <p className={`text-slate-600 dark:text-slate-400 ${language === 'ta' ? 'text-lg md:text-2xl' : 'text-xl md:text-2xl'} mb-12 leading-relaxed max-w-2xl mx-auto font-medium`}>
                        {language === 'en'
                            ? 'Experience real-time intelligence that adapts to your speed. Instant explanations, deep analytics, and limitless subjects.'
                            : 'உங்கள் கற்றல் வேகத்திற்கு ஏற்ப தன்னை மாற்றிக்கொள்ளும் நுண்ணறிவை அனுபவியுங்கள். உடனடி விளக்கங்கள் மற்றும் முடிவில்லா பாடங்கள்.'}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-12 md:mb-14">
                        {[
                            { icon: <FaCheckCircle className="text-green-500" />, label_en: 'Smart Explanations', label_ta: 'விளக்கங்கள்' },
                            { icon: <FaLightbulb className="text-yellow-500" />, label_en: 'Adaptive', label_ta: 'மாறும் தன்மை' },
                            { icon: <FaRobot className="text-blue-500" />, label_en: 'Bi-lingual', label_ta: 'இருமொழி' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm border border-white/50 dark:border-slate-700/50">
                                {item.icon}
                                <span className="text-[11px] md:text-sm font-black text-slate-700 dark:text-slate-200">{language === 'en' ? item.label_en : item.label_ta}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                        <button
                            onClick={() => navigate('/ai', { state: { mode: 'study' } })}
                            className={`relative flex items-center gap-5 px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-[1000] ${language === 'ta' ? 'text-lg' : 'text-xl'} md:text-2xl shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-2 transition-all active:scale-[0.98] overflow-hidden group/btn`}
                        >
                            <span className="relative z-10">{language === 'en' ? 'Start AI Practice' : 'AI பயிற்சியைத் தொடங்கவும்'}</span>
                            <FaRobot size={24} className="relative z-10 group-hover/btn:rotate-[360deg] transition-transform duration-1000 ease-in-out" />
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* Visual Depth Particles - Neural Network feel */}
                <div className="absolute top-10 right-10 w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-3 h-3 md:w-4 md:h-4 rounded-full bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.8)] animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-10 w-2 h-2 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
                <div className="absolute top-20 left-1/4 opacity-[0.02] dark:opacity-[0.05] pointer-events-none uppercase font-black text-5xl md:text-8xl -rotate-12 select-none hidden sm:block">INTELLIGENCE</div>
            </div>
        </motion.div>
    );
};

const Home = ({ isSidebarOpen, closeSidebar, selectedTopic, setSelectedTopic, handleTopicClick }) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();

    useEffect(() => {
        const getItems = async () => {
            setIsLoading(true);
            try {
                const { data } = await fetchItems();
                setItems(data);
            } catch (error) {
                console.error(error);
            } finally {
                // Minimum loading time for smooth UX if needed, or immediate
                setIsLoading(false);
            }
        };
        getItems();
    }, []);

    const displayedItems = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return items.filter(item => {
            const content = JSON.stringify(item).toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = !query || content.includes(query);

            if (!matchesSearch) return false;
            if (selectedTopic === 'All') return true;

            switch (selectedTopic) {
                // ... same logical blocks ...
                case 'aadhar': return item.sub_category === 'Aadhaar';
                case 'pan': return item.sub_category === 'PAN Card';
                case 'voter': return item.sub_category === 'Voter ID';
                case 'ration': return item.sub_category === 'Ration Card';
                case 'pf': return item.sub_category === 'PF / EPF';
                case 'passport': return item.sub_category === 'Passport';
                case 'tax': return item.sub_category === 'Income Tax';
                case 'land': return item.sub_category === 'Land Records';
                case 'transport': return item.sub_category === 'Transport';
                case 'revenue': return item.sub_category === 'Revenue Dept';
                case 'employment': return item.sub_category === 'Employment';
                case 'utilities': return item.sub_category === 'Utilities';
                case 'all_schemes': return item.category === 'Scheme';
                case 'agri': return item.sub_category === 'Agriculture';
                case 'women': return item.sub_category === 'Women Welfare' || item.sub_category === 'Student/Women' || item.sub_category === 'Child Welfare';
                case 'student': return item.sub_category === 'Student/Scholarship' || item.sub_category === 'Student/Women';
                case 'health': return item.sub_category === 'Health';
                case 'housing': return item.sub_category === 'Housing';
                case 'loan': return item.sub_category === 'Loan';

                // Career Filters
                case 'all_career': return item.category === 'Job' || item.category === 'Exam';
                case 'job_state': return item.category === 'Job' && item.sub_category === 'State Govt';
                case 'job_central': return item.category === 'Job' && item.sub_category === 'Central Govt';
                case 'job_railway': return item.category === 'Job' && item.sub_category === 'Railways';
                case 'exam_entrance': return item.category === 'Exam' && (item.sub_category === 'Medical' || item.sub_category === 'Engineering' || item.sub_category === 'Entrance');

                default: return false;
            }
        });
    }, [items, selectedTopic, searchQuery]);

    // Inject Ads and Special Features
    const displayedItemsWithAds = useMemo(() => {
        const result = [];

        // Inject "Exam Prep" Feature Card at the top if appropriate
        if (selectedTopic === 'all_career' || selectedTopic === 'exam_entrance' || selectedTopic === 'practice_quiz') {
            result.push({
                _id: 'feature-quiz-card',
                isFeature: true,
                title_en: 'Practice Exams (TNPSC, UPSC, SSC)',
                title_ta: 'பயிற்சித் தேர்வுகள் (TNPSC, UPSC, SSC)',
                description_en: 'Take free mock tests for all government exams. Improve your score with subject-wise quizzes.',
                description_ta: 'அனைத்து அரசுத் தேர்வுகளுக்கும் இலவச இணையவழித் தேர்வுகள். பாடவாரியான வினாடி வினாக்கள்.',
                category: 'Exam', // For color logic
                sub_category: 'Exam Prep',
                vacancies: null,
                applicationEndDate: null
            });
        }

        let adCount = 0;
        displayedItems.forEach((item, index) => {
            result.push(item);
            // Inject ad every 6 items
            if ((index + 1) % 6 === 0) {
                adCount++;
                const isVideo = adCount % 2 === 0; // Alternate formats
                result.push({
                    isAd: true,
                    _id: `ad-injected-${adCount}`,
                    type: isVideo ? 'video' : 'display',
                    label: isVideo ? 'Video Ad' : 'Display Ad'
                });
            }
        });
        return result;
    }, [displayedItems, selectedTopic]);

    return (
        <div className="flex min-h-screen pt-24 lg:pt-20">
            {/* Sidebar is now global in App.jsx */}

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 w-full max-w-[100vw] overflow-x-hidden">
                <Hero items={items} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <BannerSlider />
                {(selectedTopic === 'All' || selectedTopic === 'practice_quiz') && (
                    <>
                        <ExamPrepSection language={language} navigate={navigate} />
                        <AIPracticeSection language={language} navigate={navigate} />
                    </>
                )}

                {selectedTopic !== 'practice_quiz' && (
                    <>
                        <div id="content-list" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                                {selectedTopic === 'All' ? (language === 'en' ? 'All Services & Schemes' : 'அனைத்து சேவைகள் & திட்டங்கள்') :
                                    (language === 'en' ? [...serviceTopics, ...schemeTopics, ...careerTopics].find(t => t.id === selectedTopic)?.en : [...serviceTopics, ...schemeTopics, ...careerTopics].find(t => t.id === selectedTopic)?.ta)}
                            </h2>
                            <span className="self-start md:self-auto text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-wide">
                                {isLoading ? (language === 'en' ? 'Loading results...' : 'ஏற்றப்படுகிறது...') : `${displayedItems.length} ${language === 'en' ? 'Results Found' : 'முடிவுகள்'}`}
                            </span>
                        </div>

                        {/* --- Category / Filter Ad Area --- */}
                        <div className="mb-8">
                            <AdUnit
                                testLabel="Category Header Ad"
                                format="horizontal"
                                className="w-full min-h-[90px] shadow-sm rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                            {/* Skeleton Loader */}
                            {isLoading && (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={`skel-${i}`} className="col-span-1">
                                        <CardSkeleton />
                                    </div>
                                ))
                            )}

                            {!isLoading && (
                                <AnimatePresence mode="popLayout">
                                    {displayedItemsWithAds.map((item) => {
                                        if (item.isAd) {
                                            return (
                                                <motion.div
                                                    key={item._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="col-span-1 h-full"
                                                >
                                                    <AdUnit
                                                        testLabel={item.label}
                                                        className="h-full min-h-[350px] shadow-sm rounded-[2rem] overflow-hidden"
                                                        format="auto"
                                                    />
                                                </motion.div>
                                            );
                                        }

                                        return (
                                            <div key={item._id} className="col-span-1">
                                                <ServiceCard
                                                    item={item}
                                                    language={language}
                                                    navigate={navigate}
                                                    prefetchItem={prefetchItem}
                                                />
                                            </div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}

                            {!isLoading && displayedItems.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <FaSearch className="text-2xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">{language === 'en' ? 'No matches found' : 'முடிவுகள் இல்லை'}</h3>
                                    <p className="text-slate-500 dark:text-slate-500">{language === 'en' ? 'Try adjusting your search.' : 'வேறு தேடலை முயற்சிக்கவும்.'}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Home;
