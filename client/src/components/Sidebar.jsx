import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLayerGroup, FaChevronRight, FaFileAlt, FaRobot, FaBolt } from 'react-icons/fa';
import { serviceTopics, schemeTopics, careerTopics } from '../constants/topicData.jsx';
import { LanguageContext } from '../context/LanguageContext';

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

const Sidebar = ({ isSidebarOpen, closeSidebar, selectedTopic, handleTopicClick, navigate }) => {
    const { language } = React.useContext(LanguageContext);
    return (
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

                    <button
                        onClick={() => {
                            handleTopicClick('practice_quiz');
                            navigate('/quiz');
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-5 py-3 mt-3 rounded-xl transition-all duration-200 font-bold border ${selectedTopic === 'practice_quiz'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                            : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                    >
                        <FaFileAlt />
                        <span>{language === 'en' ? 'Practice Exams' : 'பயிற்சித் தேர்வுகள்'}</span>
                    </button>

                    <button
                        onClick={() => {
                            if (typeof handleTopicClick === 'function') handleTopicClick('ai');
                            navigate('/ai');
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-5 py-3 mt-3 rounded-xl transition-all duration-200 font-bold border ${selectedTopic === 'ai'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/30'
                            : 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600'
                            }`}
                    >
                        <FaRobot />
                        <span>{language === 'en' ? 'AI Assistant' : 'AI உதவியாளர்'}</span>
                    </button>

                    <button
                        onClick={() => {
                            if (typeof handleTopicClick === 'function') handleTopicClick('activities');
                            navigate('/activities');
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-5 py-3 mt-3 rounded-xl transition-all duration-200 font-bold border ${selectedTopic === 'activities'
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30'
                            : 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600'
                            }`}
                    >
                        <FaBolt className="text-orange-500 group-hover:text-white" />
                        <span>{language === 'en' ? 'Fun Activities' : 'செயல்பாடுகள்'}</span>
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
    );
};

export default Sidebar;
