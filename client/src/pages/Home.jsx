import React, { useEffect, useState, useContext, useMemo, memo } from 'react';
import { fetchItems, prefetchItem } from '../api'; // Import prefetch
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { FaLayerGroup, FaFileAlt, FaIdCard, FaLandmark, FaSeedling, FaFemale, FaGraduationCap, FaHome, FaGlobe, FaBus, FaFileContract, FaBriefcase, FaHeartbeat, FaChevronRight, FaSearch, FaBolt, FaTimes, FaFingerprint, FaAddressCard, FaVoteYea, FaShoppingBasket, FaPassport, FaPiggyBank, FaRupeeSign, FaMapMarkedAlt, FaCar, FaFileSignature, FaLightbulb } from 'react-icons/fa';
import Hero from '../components/Hero';
import AdUnit from '../components/AdUnit';

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

// --- Collapsible Section Component ---
const CollapsibleSidebarSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
                <span>{title}</span>
                <FaChevronRight className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sidebar Item Component ---
const SidebarItem = memo(({ topic, selectedTopic, onClick, language }) => {
    const isSelected = selectedTopic === topic.id;

    return (
        <button
            onClick={() => onClick(topic.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${isSelected
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
        >
            <span className={`text-lg transition-colors ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                {topic.icon}
            </span>
            <span className="text-sm flex-1">{language === 'en' ? topic.en : topic.ta}</span>
            {isSelected && <motion.div layoutId="active-pill" className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
        </button>
    );
});

const Home = ({ isSidebarOpen, closeSidebar }) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState('All');
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

    const serviceTopics = [
        { id: 'aadhar', en: 'Aadhaar', ta: 'ஆதார்', icon: <FaFingerprint /> },
        { id: 'pan', en: 'PAN Card', ta: 'பான் கார்டு', icon: <FaAddressCard /> },
        { id: 'voter', en: 'Voter ID', ta: 'வாக்காளர் அட்டை', icon: <FaVoteYea /> },
        { id: 'ration', en: 'Ration Card', ta: 'ரேஷன் கார்டு', icon: <FaShoppingBasket /> },
        { id: 'passport', en: 'Passport', ta: 'பாஸ்போர்ட்', icon: <FaPassport /> },

        { id: 'pf', en: 'PF / EPF', ta: 'பிஎஃப்', icon: <FaPiggyBank /> },
        { id: 'tax', en: 'Income Tax', ta: 'வருமான வரி', icon: <FaRupeeSign /> },
        { id: 'land', en: 'Patta / Chitta', ta: 'பட்டா / சிட்டா', icon: <FaMapMarkedAlt /> },
        { id: 'transport', en: 'Transport / RTO', ta: 'போக்குவரத்து', icon: <FaCar /> },
        { id: 'revenue', en: 'Certificates (Revenue)', ta: 'வருவாய் துறை', icon: <FaFileSignature /> },
        { id: 'employment', en: 'Employment', ta: 'வேலைவாய்ப்பு', icon: <FaBriefcase /> },
        { id: 'utilities', en: 'Electricity / EB', ta: 'மின்சாரம் / EB', icon: <FaLightbulb /> },
    ];

    const schemeTopics = [
        { id: 'all_schemes', en: 'All Schemes', ta: 'நலத்திட்டங்கள்', icon: <FaLayerGroup /> },
        { id: 'agri', en: 'Agriculture', ta: 'விவசாயம்', icon: <FaSeedling /> },
        { id: 'women', en: 'Women Welfare', ta: 'பெண்கள் நலம்', icon: <FaFemale /> },
        { id: 'student', en: 'Student/Scholarship', ta: 'மாணவர்', icon: <FaGraduationCap /> },
        { id: 'health', en: 'Health Schemes', ta: 'மருத்துவம்', icon: <FaHeartbeat /> },
        { id: 'loan', en: 'Loans', ta: 'கடனுதவி', icon: <FaLandmark /> },
        { id: 'housing', en: 'Housing', ta: 'வீட்டுவசதி', icon: <FaHome /> },
    ];

    const careerTopics = [
        { id: 'all_career', en: 'Jobs & Exams', ta: 'வேலைவாய்ப்பு & தேர்வுகள்', icon: <FaBriefcase /> },
        { id: 'job_state', en: 'State Govt Jobs', ta: 'மாநில அரசு வேலைகள்', icon: <FaLandmark /> },
        { id: 'job_central', en: 'Central Govt Jobs', ta: 'மத்திய அரசு வேலைகள்', icon: <FaGlobe /> },
        { id: 'exam_entrance', en: 'Entrance Exams', ta: 'நுழைவுத் தேர்வுகள்', icon: <FaFileAlt /> },
        { id: 'job_railway', en: 'Railways', ta: 'ரயில்வே', icon: <FaBus /> },
    ];

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

    // Inject Ads randomly (approx every 6 items)
    const displayedItemsWithAds = useMemo(() => {
        const result = [];
        let adCount = 0;
        displayedItems.forEach((item, index) => {
            result.push(item);
            // Inject ad every 3 items
            if ((index + 1) % 3 === 0) {
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
    }, [displayedItems]);

    const handleTopicClick = (id) => {
        setSelectedTopic(id);
        const element = document.getElementById('content-list');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (window.innerWidth <= 1024) closeSidebar();
    };

    return (
        <div className="flex min-h-screen pt-20">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-20 left-0 w-72 h-[calc(100vh-80px)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4 space-y-8 pb-20">
                    <div>
                        <button
                            onClick={() => handleTopicClick('All')}
                            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 font-bold border ${selectedTopic === 'All'
                                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <FaLayerGroup />
                            <span>{language === 'en' ? 'All Items' : 'அனைத்தும்'}</span>
                        </button>
                    </div>

                    <CollapsibleSidebarSection title={language === 'en' ? 'Core Services' : 'முக்கிய சேவைகள்'}>
                        {serviceTopics.map(topic => (
                            <SidebarItem key={topic.id} topic={topic} selectedTopic={selectedTopic} onClick={handleTopicClick} language={language} />
                        ))}
                    </CollapsibleSidebarSection>

                    <CollapsibleSidebarSection title={language === 'en' ? 'Welfare Schemes' : 'நலத்திட்டங்கள்'}>
                        {schemeTopics.map(topic => (
                            <SidebarItem key={topic.id} topic={topic} selectedTopic={selectedTopic} onClick={handleTopicClick} language={language} />
                        ))}
                    </CollapsibleSidebarSection>

                    <CollapsibleSidebarSection title={language === 'en' ? 'Career & Education' : 'வேலைவாய்ப்பு & கல்வி'}>
                        {careerTopics.map(topic => (
                            <SidebarItem key={topic.id} topic={topic} selectedTopic={selectedTopic} onClick={handleTopicClick} language={language} />
                        ))}
                    </CollapsibleSidebarSection>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 w-full max-w-[100vw] overflow-x-hidden">
                <Hero items={items} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <BannerSlider />

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
                                            className="col-span-1"
                                        >
                                            <AdUnit
                                                testLabel={item.label}
                                                className="h-full min-h-[300px] shadow-sm"
                                                format="auto"
                                            />
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => navigate(`/detail/${item._id}`)}
                                        onMouseEnter={() => prefetchItem(item._id)} // Prefetch on Hover
                                        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {item.sub_category}
                                            </span>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 ${getCategoryIcon(item.sub_category).color}`}>
                                                <ServiceIcon config={getCategoryIcon(item.sub_category)} className="text-xl" />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10">
                                            {language === 'en' ? item.title_en : item.title_ta}
                                        </h3>

                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-2 flex-1 relative z-10">
                                            {language === 'en' ? item.description_en : item.description_ta}
                                        </p>

                                        {/* Highlight Vacancies for Jobs */}
                                        {item.category === 'Job' && item.vacancies && (
                                            <div className="mb-2">
                                                <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                                                    {language === 'en' ? `Vacancies: ${item.vacancies}` : `காலியிடங்கள்: ${item.vacancies}`}
                                                </span>
                                            </div>
                                        )}

                                        {/* Show Dates for Jobs/Exams */}
                                        {(item.category === 'Job' || item.category === 'Exam') && item.applicationEndDate && (
                                            <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 font-medium z-10 relative">
                                                <span className="text-red-500 font-bold">{language === 'en' ? 'Last Date:' : 'கடைசி தேதி:'}</span> {new Date(item.applicationEndDate).toLocaleDateString()}
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto flex items-center text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors relative z-10">
                                            {language === 'en' ? 'Read More' : 'மேலும் படிக்க'}
                                        </div>

                                        {/* Hover Gradient Blob */}
                                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors duration-500 z-0"></div>
                                    </motion.div>
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
            </main>
        </div>
    );
};

export default Home;
