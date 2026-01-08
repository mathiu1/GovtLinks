import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchItemById } from '../api'; // Updated Import
import { LanguageContext } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaExternalLinkAlt, FaInfoCircle } from 'react-icons/fa';
import AdUnit from '../components/AdUnit';

const DetailSkeleton = () => (
    <div className="max-w-5xl w-full animate-pulse">
        {/* Button Skel */}
        <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-full mb-8"></div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 md:p-12 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row gap-8 mb-10">
                <div className="flex-1 space-y-6">
                    {/* Tags Skel */}
                    <div className="flex gap-4">
                        <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    </div>
                    {/* Title Skel */}
                    <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="w-1/2 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>

                    {/* Desc Skel */}
                    <div className="space-y-4">
                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                </div>
                {/* Right Side Skel */}
                <div className="w-full lg:w-[336px] flex flex-col gap-6">
                    <div className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
            </div>

            {/* Steps Skel */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-10 space-y-8">
                <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl flex-shrink-0"></div>
                        <div className="flex-1 space-y-4">
                            <div className="w-1/3 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useContext(LanguageContext);
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getItem = async () => {
            setLoading(true);
            try {
                // Fetch ONLY the specific item by ID (Fast!)
                const response = await fetchItemById(id);
                setItem(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        getItem();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen pt-28 pb-20 px-4 flex justify-center gap-6">
            {/* Desktop Sidebars Skel */}
            <div className="hidden 2xl:block w-[160px]"></div>
            <DetailSkeleton />
            <div className="hidden 2xl:block w-[160px]"></div>
        </div>
    );

    if (!item) return (
        <div className="min-h-screen pt-40 px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-500">Item not found</h2>
            <button onClick={() => navigate('/')} className="text-blue-600 mt-4 hover:underline">Return Home</button>
        </div>
    );

    const officialLinks = item.official_links && item.official_links.length > 0
        ? item.official_links
        : (item.official_link ? [{ url: item.official_link, label_en: 'Visit Official Website', label_ta: 'அதிகாரப்பூர்வ தளம்' }] : []);

    const youtubeLinks = item.youtube_links && item.youtube_links.length > 0
        ? item.youtube_links
        : (item.youtube_link ? [item.youtube_link] : []);

    return (
        <div className="min-h-screen pt-28 pb-20 px-4">
            <div className="flex justify-center gap-6">
                {/* Left Side Ad - Desktop Only */}
                <div className="hidden 2xl:block w-[160px] flex-shrink-0">
                    <div className="sticky top-24">
                        <AdUnit
                            slot="8853622693"
                            testLabel="Left Side Ad"
                            className="w-[160px] h-[600px] shadow-sm bg-transparent border-none"
                            format="vertical"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-5xl w-full">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 mb-8 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold text-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        {language === 'en' ? 'Back to Services' : 'பின் செல்ல'}
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                    >
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 mb-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {item.category}
                                        </span>
                                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            {item.sub_category}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
                                        {language === 'en' ? item.title_en : item.title_ta}
                                    </h1>
                                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-3xl">
                                        {/* Sanitize if this was rich text, though it's currently text node. If rich text: */}
                                        {/* dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(language === 'en' ? item.description_en : item.description_ta) }} */}
                                        {language === 'en' ? item.description_en : item.description_ta}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-6 w-full lg:w-[336px] flex-shrink-0">
                                    {officialLinks.map((link, idx) => (
                                        <div key={idx} className="w-full">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-1 transition-all duration-300 w-full"
                                            >
                                                <span>{language === 'en' ? (link.label_en || 'Visit Official Website') : (link.label_ta || 'அதிகாரப்பூர்வ தளம்')}</span>
                                                <FaExternalLinkAlt />
                                            </a>
                                            <div className="mt-3 text-center text-xs text-slate-400 font-medium">
                                                {language === 'en' ? 'Opens in new tab' : 'புதிய தாவலில் திறக்கும்'}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Sidebar Ad - Always visible */}
                                    <AdUnit
                                        slot="8853622693"
                                        testLabel="Sidebar Detail Ad"
                                        className="w-full min-h-[250px] shadow-sm rounded-2xl"
                                        format="rectangle"
                                    />
                                </div>
                            </div>

                            {youtubeLinks.map((videoUrl, idx) => (
                                <div key={idx} className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                                    <iframe
                                        className="w-full aspect-video"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                                        title={`YouTube video player ${idx + 1}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ))}

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-10">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                                        <FaInfoCircle />
                                    </div>
                                    {language === 'en' ? 'Application Process' : 'விண்ணப்ப செயல்முறை'}
                                </h3>

                                <div className="space-y-6 relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>

                                    {item.steps && item.steps.length > 0 ? (
                                        item.steps.map((step, index) => (
                                            <React.Fragment key={index}>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="relative flex gap-3 md:gap-6 p-4 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group md:ml-4"
                                                >
                                                    <div className="hidden md:flex flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:border-blue-500 dark:group-hover:text-blue-400 items-center justify-center font-bold text-xl shadow-sm transition-all z-10">
                                                        {index + 1}
                                                    </div>
                                                    {/* Mobile number */}
                                                    <div className="md:hidden flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>

                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {language === 'en' ? step.title_en : step.title_ta}
                                                        </h4>
                                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                            {language === 'en' ? step.desc_en : step.desc_ta}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                                {/* Inject Ad every 3 steps */}
                                                {(index + 1) % 3 === 0 && (
                                                    <div className="md:ml-4">
                                                        <AdUnit
                                                            slot="6018402331" // Reusing footer slot for now or create new
                                                            testLabel={`Step Ad ${index + 1}`}
                                                            className="w-full min-h-[200px] shadow-sm rounded-2xl"
                                                        />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 dark:text-slate-400 italic p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-700">
                                            {language === 'en' ? 'No detailed steps available.' : 'விவரமான படிகள் இல்லை.'}
                                        </p>
                                    )}
                                </div>

                                {/* Bottom Banner Ad */}
                                <div className="mt-12">
                                    <AdUnit
                                        slot="6018402331"
                                        testLabel="Footer Detail Ad"
                                        className="w-full min-h-[200px] shadow-sm rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side Ad - Desktop Only */}
                <div className="hidden 2xl:block w-[160px] flex-shrink-0">
                    <div className="sticky top-24">
                        <AdUnit
                            slot="8853622693"
                            testLabel="Right Side Ad"
                            className="w-[160px] h-[600px] shadow-sm bg-transparent border-none"
                            format="vertical"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail;
