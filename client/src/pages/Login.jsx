import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (serverError) setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.identifier || !formData.password) {
            setServerError('Please enter both email/username and password');
            return;
        }

        setIsLoading(true);
        setServerError('');

        try {
            const user = await login(formData.identifier, formData.password);
            if (user.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center pt-24 pb-12 px-4 md:py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 tracking-tighter">Welcome Back</h2>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Please sign in to continue</p>
                    </div>

                    <AnimatePresence>
                        {serverError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                            >
                                <FiAlertCircle className="text-lg flex-shrink-0" />
                                {serverError}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username or Email</label>
                            <div className="relative group">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                                <input
                                    name="identifier"
                                    type="text"
                                    placeholder="Enter username or email"
                                    className="w-full pl-11 pr-4 py-3.5 md:py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium text-base"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between ml-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot Password?</button>
                            </div>
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-12 py-3.5 md:py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium text-base"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/30 transform transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${isLoading
                                    ? 'bg-blue-400 opacity-80 cursor-wait'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 md:mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Don't have an account?
                        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline ml-1">Create Account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
