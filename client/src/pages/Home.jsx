import React, { useEffect, useState, useContext, useMemo, memo } from 'react';
import { fetchItems } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { FaLayerGroup, FaFileAlt, FaIdCard, FaLandmark, FaSeedling, FaFemale, FaGraduationCap, FaHome, FaGlobe, FaBus, FaFileContract, FaBriefcase, FaHeartbeat, FaChevronRight, FaSearch, FaBolt, FaTimes } from 'react-icons/fa';
import Hero from '../components/Hero';
import AdUnit from '../components/AdUnit';

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
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();

    useEffect(() => {
        const getItems = async () => {
            try {
                const { data } = await fetchItems();
                setItems(data);
            } catch (error) {
                console.error(error);
            }
        };
        getItems();
    }, []);

    const serviceTopics = [
        { id: 'aadhar', en: 'Aadhaar', ta: 'ஆதார்', icon: <FaIdCard /> },
        { id: 'pan', en: 'PAN Card', ta: 'பான் கார்டு', icon: <FaIdCard /> },
        { id: 'voter', en: 'Voter ID', ta: 'வாக்காளர் அட்டை', icon: <FaIdCard /> },
        { id: 'ration', en: 'Ration Card', ta: 'ரேஷன் கார்டு', icon: <FaIdCard /> },
        { id: 'passport', en: 'Passport', ta: 'பாஸ்போர்ட்', icon: <FaGlobe /> },
        { id: 'pf', en: 'PF / EPF', ta: 'பிஎஃப்', icon: <FaFileAlt /> },
        { id: 'tax', en: 'Income Tax', ta: 'வருமான வரி', icon: <FaLandmark /> },
        { id: 'land', en: 'Patta / Chitta', ta: 'பட்டா / சிட்டா', icon: <FaFileAlt /> },
        { id: 'transport', en: 'Transport / RTO', ta: 'போக்குவரத்து', icon: <FaBus /> },
        { id: 'revenue', en: 'Certificates (Revenue)', ta: 'வருவாய் துறை', icon: <FaFileContract /> },
        { id: 'employment', en: 'Employment', ta: 'வேலைவாய்ப்பு', icon: <FaBriefcase /> },
        { id: 'utilities', en: 'Electricity / EB', ta: 'மின்சாரம் / EB', icon: <FaBolt /> },
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

    const displayedItems = useMemo(() => {
        return items.filter(item => {
            const content = JSON.stringify(item).toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = !query || content.includes(query);

            if (!matchesSearch) return false;
            if (selectedTopic === 'All') return true;

            switch (selectedTopic) {
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
            // Inject ad every 6 items
            if ((index + 1) % 6 === 0) {
                adCount++;
                const isVideo = adCount % 2 === 0; // Alternate formats
                result.push({
                    isAd: true,
                    _id: `ad-injected-${adCount}`, // Use _id to match key expectations if possible, or handle in map
                    type: isVideo ? 'video' : 'display',
                    label: isVideo ? 'Video Ad' : 'Display Ad'
                });
            }
        });
        return result;
    }, [displayedItems]);

    const handleTopicClick = (id) => {
        setSelectedTopic(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

                    <div>
                        <h4 className="px-4 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {language === 'en' ? 'Core Services' : 'முக்கிய சேவைகள்'}
                        </h4>
                        <div className="space-y-1">
                            {serviceTopics.map(topic => (
                                <SidebarItem key={topic.id} topic={topic} selectedTopic={selectedTopic} onClick={handleTopicClick} language={language} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="px-4MB-3 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {language === 'en' ? 'Welfare Schemes' : 'நலத்திட்டங்கள்'}
                        </h4>
                        <div className="space-y-1">
                            {schemeTopics.map(topic => (
                                <SidebarItem key={topic.id} topic={topic} selectedTopic={selectedTopic} onClick={handleTopicClick} language={language} />
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 w-full max-w-[100vw] overflow-x-hidden">
                <Hero items={items} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                        {selectedTopic === 'All' ? (language === 'en' ? 'All Services & Schemes' : 'அனைத்து சேவைகள் & திட்டங்கள்') :
                            (language === 'en' ? [...serviceTopics, ...schemeTopics].find(t => t.id === selectedTopic)?.en : [...serviceTopics, ...schemeTopics].find(t => t.id === selectedTopic)?.ta)}
                    </h2>
                    <span className="self-start md:self-auto text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-wide">
                        {displayedItems.length} {language === 'en' ? 'Results Found' : 'முடிவுகள்'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                    <AnimatePresence mode="popLayout">
                        {displayedItemsWithAds.map((item) => (
                            item.isAd ? (
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
                            ) : (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => navigate(`/detail/${item._id}`)}
                                    className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            {item.sub_category}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all">
                                            <FaChevronRight className="text-xs" />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10">
                                        {language === 'en' ? item.title_en : item.title_ta}
                                    </h3>

                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1 relative z-10">
                                        {language === 'en' ? item.description_en : item.description_ta}
                                    </p>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto flex items-center text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors relative z-10">
                                        {language === 'en' ? 'Read More' : 'மேலும் படிக்க'}
                                    </div>

                                    {/* Hover Gradient Blob */}
                                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors duration-500"></div>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>

                    {displayedItems.length === 0 && (
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
