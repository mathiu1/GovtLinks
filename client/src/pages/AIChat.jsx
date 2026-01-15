import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaLightbulb, FaExchangeAlt, FaRedo, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Typewriter Component for AI Responses ---
const TypewriterText = ({ text, speed = 15 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[index]);
                setIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, text, speed]);

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayedText}
            </ReactMarkdown>
        </div>
    );
};

const AIChat = () => {
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.mode || 'chat'); // 'chat' or 'study'
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [studyQuestion, setStudyQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [studyFeedback, setStudyFeedback] = useState('');
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (mode === 'study' && !studyQuestion) {
            startStudy();
        }
    }, [mode]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, studyFeedback]);

    // Re-fetch study question when language changes
    useEffect(() => {
        if (mode === 'study') {
            startStudy();
        }
    }, [language]);

    // --- Chat Logic ---
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.slice(-6); // Only send last few messages for context
            const { data } = await API.post('/ai/chat', {
                message: input,
                history,
                language
            });

            const aiMsg = { role: 'model', parts: [{ text: data.text }] };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again." }] };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Study Mode Logic ---
    const startStudy = async () => {
        setIsLoading(true);
        setStudyFeedback('');
        setStudyQuestion(null);
        setSelectedAnswer(null);
        try {
            const { data } = await API.post('/ai/study', {
                action: 'ask',
                topic: 'Random',
                language
            });
            setStudyQuestion(data);
        } catch (error) {
            console.error('Study error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAnswer = async (answer) => {
        if (selectedAnswer || isLoading) return;
        setSelectedAnswer(answer);
        setIsLoading(true);
        try {
            const { data } = await API.post('/ai/study', {
                action: 'verify',
                userAnswer: answer,
                currentQuestion: studyQuestion.question,
                language
            });
            setStudyFeedback(data.feedback);
        } catch (error) {
            console.error('Verify error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 md:pt-24 pb-8 md:pb-12 px-4 md:px-8 max-w-5xl mx-auto lg:pl-72 lg:max-w-none">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4 md:mt-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <FaArrowLeft className="text-sm" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-[1000] text-slate-900 dark:text-white tracking-tight leading-none">
                            {language === 'en' ? 'AI Assistant' : 'AI உதவியாளர்'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-[1000] uppercase tracking-widest text-[9px] mt-1">
                            {language === 'en' ? 'Advanced Multi-language Assistant' : 'மேம்பட்ட பலமொழி உதவியாளர்'}
                        </p>
                    </div>
                </div>

                {/* Mode Toggle - Modern Glassmorphic Look */}
                <div className="flex bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-[1.25rem] border border-white dark:border-slate-700/50 w-full md:w-auto self-center">
                    <button
                        onClick={() => setMode('chat')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${mode === 'chat' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xl shadow-blue-500/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <FaRobot size={14} className={mode === 'chat' ? 'animate-pulse' : ''} />
                        {language === 'en' ? 'Chat' : 'சாட்'}
                    </button>
                    <button
                        onClick={() => { setMode('study'); if (!studyQuestion) startStudy(); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${mode === 'study' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <FaLightbulb size={14} className={mode === 'study' ? 'animate-pulse' : ''} />
                        {language === 'en' ? 'Study' : 'பயிற்சி'}
                    </button>
                </div>
            </div>

            {/* Chat Interface */}
            {mode === 'chat' ? (
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-3xl md:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-[65vh] md:h-[70vh]">
                    <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-8">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-3xl md:text-4xl mb-6 animate-bounce">
                                    <FaRobot />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                    {language === 'en' ? 'Hello! How can I help you today?' : 'வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?'}
                                </h2>
                                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-sm font-medium">
                                    {language === 'en' ? 'Ask me about government exams, services, or any general study questions.' : 'அரசு தேர்வுகள், சேவைகள் அல்லது ஏதேனும் பொதுவான ஆய்வு கேள்விகளைப் பற்றி என்னிடம் கேளுங்கள்.'}
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-blue-600 border border-slate-100 dark:border-slate-700'}`}>
                                        {msg.role === 'user' ? <FaUser className="text-[10px] md:text-sm" /> : <FaRobot className="text-[10px] md:text-sm" />}
                                    </div>
                                    <div className={`p-3.5 md:p-7 rounded-[1.25rem] md:rounded-[2.2rem] text-sm md:text-[1.05rem] leading-relaxed font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)] ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-tr-none' : 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100/50 dark:border-slate-700/50'}`}>
                                        {msg.role === 'model' && idx === messages.length - 1 ? (
                                            <TypewriterText text={msg.parts[0].text} speed={10} />
                                        ) : (
                                            <div className={`prose prose-sm md:prose-base max-w-none break-words overflow-hidden ${msg.role === 'user' ? 'prose-invert text-[0.85rem] md:text-[1.05rem]' : 'prose-slate dark:prose-invert text-[0.85rem] md:text-[1.05rem]'}`}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.parts[0].text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 md:p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50">
                        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={language === 'en' ? 'Ask anything...' : 'ஏதாவது கேட்கவும்...'}
                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl md:rounded-3xl px-5 md:px-8 py-3.5 md:py-5 text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:ring-[6px] md:focus:ring-[12px] focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm text-sm md:text-lg"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="w-11 h-11 md:w-auto md:px-6 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                            >
                                <FaPaperPlane className="text-xs md:text-lg" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Study Mode Interface */
                <div className="space-y-4 md:space-y-6">
                    <AnimatePresence mode="wait">
                        {isLoading && !studyQuestion ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 text-center"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">
                                    {language === 'en' ? 'AI is thinking of a question...' : 'AI ஒரு கேள்வியைப் பற்றி சிந்திக்கிறது...'}
                                </h3>
                            </motion.div>
                        ) : studyQuestion && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative"
                            >
                                <div className="mb-6 md:mb-8">
                                    <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-600 text-[9px] md:text-xs font-[1000] uppercase tracking-widest border border-indigo-600/20">
                                            {language === 'en' ? 'Study Challenge' : 'கல்வி சவால்'}
                                        </span>
                                        {studyQuestion.subject && (
                                            <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[9px] md:text-xs font-[1000] uppercase tracking-widest border border-blue-600/20">
                                                {studyQuestion.subject}
                                            </span>
                                        )}
                                        {studyQuestion.difficulty && (
                                            <span className={`px-3 py-1 rounded-full text-[9px] md:text-xs font-[1000] uppercase tracking-widest border ${studyQuestion.difficulty.toLowerCase().includes('hard') || studyQuestion.difficulty.includes('கடினம்')
                                                ? 'bg-rose-600/10 text-rose-600 border-rose-600/20'
                                                : 'bg-green-600/10 text-green-600 border-green-600/20'
                                                }`}>
                                                {studyQuestion.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                        {studyQuestion.question}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                                    {studyQuestion.options.map((opt, i) => {
                                        const isCorrect = opt === studyQuestion.correctAnswer;
                                        const isSelected = opt === selectedAnswer;
                                        const showResult = selectedAnswer !== null;

                                        let buttonClass = "p-4 md:p-5 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 border-2 text-left font-bold transition-all active:scale-[0.98] flex items-center";

                                        if (!showResult) {
                                            buttonClass += " border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10";
                                        } else {
                                            if (isCorrect) {
                                                buttonClass += " border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                                            } else if (isSelected) {
                                                buttonClass += " border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                                            } else {
                                                buttonClass += " border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50";
                                            }
                                        }

                                        return (
                                            <button
                                                key={i}
                                                disabled={showResult || isLoading}
                                                onClick={() => verifyAnswer(opt)}
                                                className={`${buttonClass} text-[0.85rem] md:text-base`}
                                            >
                                                <span className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center mr-3 text-[10px] md:text-xs flex-shrink-0 font-black ${showResult && isCorrect ? 'bg-green-500 text-white' : showResult && isSelected ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                    {showResult && isCorrect ? <FaCheckCircle /> : showResult && isSelected ? <FaTimesCircle /> : String.fromCharCode(64 + (i + 1))}
                                                </span>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {studyFeedback && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-indigo-600/5 border border-indigo-600/20 mb-6 md:mb-8">
                                        <div className="flex items-start gap-3 md:gap-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                                                <FaLightbulb className="text-xs md:text-base" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic prose prose-sm md:prose-base prose-indigo dark:prose-invert max-w-none break-words">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {studyFeedback}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={startStudy}
                                        disabled={isLoading}
                                        className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-2xl font-[1000] text-sm md:text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                                    >
                                        <FaRedo className={isLoading ? 'animate-spin text-xs' : 'text-xs'} />
                                        {isLoading ? (language === 'en' ? 'Thinking...' : 'சிந்திக்கிறது...') : (language === 'en' ? 'Next Question' : 'அடுத்த கேள்வி')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AIChat;
