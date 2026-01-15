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
        <div className="min-h-screen pt-28 pb-20 px-4 flex justify-center gap-6 bg-[#f8fafc] dark:bg-slate-950">
            <div className="hidden 2xl:block w-[160px]"></div>
            <DetailSkeleton />
            <div className="hidden 2xl:block w-[160px]"></div>
        </div>
    );

    if (!item) return (
        <div className="min-h-screen pt-40 px-4 text-center bg-[#f8fafc] dark:bg-slate-950">
            <h2 className="text-2xl font-[900] text-slate-400">Item not found</h2>
            <button onClick={() => navigate('/')} className="text-blue-600 font-black mt-6 hover:underline uppercase tracking-widest text-sm italic">Return Home</button>
        </div>
    );

    const officialLinks = item.official_links && item.official_links.length > 0
        ? item.official_links
        : (item.official_link ? [{ url: item.official_link, label_en: 'Visit Official Website', label_ta: 'அதிகாரப்பூர்வ தளம்' }] : []);

    const youtubeLinks = item.youtube_links && item.youtube_links.length > 0
        ? item.youtube_links
        : (item.youtube_link ? [item.youtube_link] : []);

    return (
        <div className="min-h-screen pt-20 md:pt-28 pb-20 px-4 relative overflow-hidden bg-[#f8fafc] dark:bg-slate-950 lg:pl-72">
            {/* Atmospheric Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-[140px] animate-pulse delay-1000"></div>
                <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-sky-500/5 dark:bg-sky-400/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="flex justify-center gap-6 relative z-10">
                {/* Left Side Ad */}
                <div className="hidden 2xl:block w-[160px] flex-shrink-0">
                    <div className="sticky top-24">
                        <AdUnit
                            testLabel="Left Side Ad"
                            className="w-[160px] h-[600px] shadow-sm bg-white/5 dark:bg-slate-900/5 rounded-2xl border border-white/20 dark:border-slate-800/20"
                            format="vertical"
                        />
                    </div>
                </div>

                <div className="max-w-5xl w-full">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 mb-10 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-[0.15em]"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white shadow-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        {language === 'en' ? 'Return to Portal' : 'பின் செல்ல'}
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[3rem] p-6 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white dark:border-slate-800 relative overflow-hidden"
                    >
                        {/* Interior glass shine */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-12 mb-16">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-8 flex-wrap">
                                        <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 border border-blue-500">
                                            {item.category}
                                        </span>
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                            {item.sub_category}
                                        </span>
                                    </div>

                                    <h1 className={`${language === 'ta' ? 'text-3xl md:text-6xl' : 'text-4xl md:text-7xl'} font-[1000] text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tighter drop-shadow-sm`}>
                                        {language === 'en' ? item.title_en : item.title_ta}
                                    </h1>

                                    <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-10"></div>

                                    <p className={`text-slate-600 dark:text-slate-300 ${language === 'ta' ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl'} mb-16 leading-relaxed max-w-4xl font-medium opacity-90`}>
                                        {language === 'en' ? item.description_en : item.description_ta}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-8 w-full lg:w-[360px] flex-shrink-0">
                                    {officialLinks.map((link, idx) => (
                                        <div key={idx} className="group/link">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative flex items-center justify-between gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-6 rounded-3xl font-[900] text-lg shadow-2xl overflow-hidden active:scale-95 transition-all group-hover/link:-translate-y-1.5"
                                            >
                                                <span className="relative z-10">{language === 'en' ? (link.label_en || 'Visit Official Website') : (link.label_ta || 'அதிகாரப்பூர்வ தளம்')}</span>
                                                <div className="w-10 h-10 rounded-2xl bg-white/10 dark:bg-slate-900/5 flex items-center justify-center flex-shrink-0 relative z-10 group-hover/link:rotate-12 transition-transform">
                                                    <FaExternalLinkAlt size={16} />
                                                </div>
                                                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover/link:opacity-10 transition-opacity"></div>
                                            </a>
                                        </div>
                                    ))}

                                    <div className="p-1 rounded-3xl bg-slate-100 dark:bg-slate-800/50">
                                        <AdUnit
                                            testLabel="Sidebar Detail Ad"
                                            className="w-full min-h-[300px] shadow-sm rounded-3xl overflow-hidden"
                                            format="rectangle"
                                        />
                                    </div>
                                </div>
                            </div>

                            {youtubeLinks.map((videoUrl, idx) => (
                                <div key={idx} className="mb-20 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 shadow-indigo-500/10">
                                    <iframe
                                        className="w-full aspect-video scale-[1.01]"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                                        title={`YouTube video player ${idx + 1}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ))}

                            <div className="relative">
                                {/* Section Header */}
                                <div className="flex items-center gap-6 mb-16">
                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl shadow-xl shadow-blue-500/20">
                                        <FaInfoCircle />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Methodology</span>
                                        <h3 className="text-3xl md:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter">
                                            {language === 'en' ? 'Application Process' : 'விண்ணப்ப செயல்முறை'}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-8 relative">
                                    {/* Premium vertical timeline line */}
                                    <div className="absolute left-10 top-12 bottom-12 w-1 bg-gradient-to-b from-blue-600/40 via-indigo-600/20 to-transparent hidden md:block"></div>

                                    {item.steps && item.steps.length > 0 ? (
                                        item.steps.map((step, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.15 }}
                                                className="relative flex flex-col md:flex-row gap-8 p-8 md:p-10 rounded-[2.5rem] bg-white/40 dark:bg-slate-800/20 border border-white/50 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:border-blue-300 transition-all group md:ml-10 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5"
                                            >
                                                <div className="flex-shrink-0 w-16 h-16 rounded-[1.25rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-2xl shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all">
                                                    {index + 1}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className={`text-xl md:text-2xl font-[1000] text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors leading-tight ${language === 'ta' ? 'text-lg md:text-2xl' : ''}`}>
                                                        {language === 'en' ? step.title_en : step.title_ta}
                                                    </h4>
                                                    <p className={`text-slate-600 dark:text-slate-400 font-medium leading-relaxed ${language === 'ta' ? 'text-base md:text-xl' : 'text-lg'}`}>
                                                        {language === 'en' ? step.desc_en : step.desc_ta}
                                                    </p>
                                                </div>

                                                {/* Sparkle effect on hover */}
                                                <div className="absolute top-4 right-4 text-blue-500/0 group-hover:text-blue-500/20 transition-all duration-700">
                                                    <FaInfoCircle size={80} className="rotate-12" />
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="p-20 text-center bg-slate-100/50 dark:bg-slate-800/30 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
                                            <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">{language === 'en' ? 'No phases defined yet' : 'படிகள் இன்னும் வரையறுக்கப்படவில்லை'}</h4>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-20">
                                    <AdUnit
                                        testLabel="Footer Detail Ad"
                                        className="w-full min-h-[250px] shadow-2xl rounded-[3rem] overflow-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side Ad */}
                <div className="hidden 2xl:block w-[160px] flex-shrink-0">
                    <div className="sticky top-24">
                        <AdUnit
                            testLabel="Right Side Ad"
                            className="w-[160px] h-[600px] shadow-sm bg-white/5 dark:bg-slate-900/5 rounded-2xl border border-white/20 dark:border-slate-800/20"
                            format="vertical"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail;
