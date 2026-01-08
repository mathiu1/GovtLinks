import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        const newErrors = {};

        if (touched.username) {
            if (!formData.username.trim()) newErrors.username = 'Username is required';
            else if (formData.username.length < 3) newErrors.username = 'Min 3 chars required';
        }

        if (touched.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
        }

        if (touched.password) {
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 6) newErrors.password = 'Min 6 chars required';
        }

        if (touched.confirmPassword) {
            if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
    }, [formData, touched]);

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (serverError) setServerError('');
    };

    const isFormValid = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            formData.username.length >= 3 &&
            emailRegex.test(formData.email) &&
            formData.password.length >= 6 &&
            formData.password === formData.confirmPassword
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ username: true, email: true, password: true, confirmPassword: true });

        if (!isFormValid()) return;

        setIsLoading(true);
        setServerError('');

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            navigate('/login');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getInputClass = (field) => {
        const base = "w-full pl-11 pr-4 py-3.5 md:py-4 rounded-xl border outline-none transition-all duration-200 font-medium text-base";
        if (errors[field]) return `${base} border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`;
        if (touched[field] && !errors[field] && formData[field]) return `${base} border-emerald-300 bg-emerald-50 text-emerald-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`;
        return `${base} border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800`;
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center pt-24 pb-12 px-4 md:py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800">
                    <div className="text-center mb-8 md:mb-10">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-blue-500/30 transform -rotate-6">
                            <FiUser className="text-2xl md:text-3xl text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Create Account</h2>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Join our community today</p>
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

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        {/* Username */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${errors.username ? 'text-red-400' : 'text-slate-400'}`} />
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="Username"
                                    className={getInputClass('username')}
                                    value={formData.username}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('username')}
                                />
                                {touched.username && !errors.username && formData.username && (
                                    <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                )}
                            </div>
                            {touched.username && errors.username && (
                                <p className="text-red-500 text-xs pl-4 font-medium">{errors.username}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400'}`} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    className={getInputClass('email')}
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('email')}
                                />
                                {touched.email && !errors.email && formData.email && (
                                    <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                )}
                            </div>
                            {touched.email && errors.email && (
                                <p className="text-red-500 text-xs pl-4 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400'}`} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={getInputClass('password')}
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('password')}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <p className="text-red-500 text-xs pl-4 font-medium">{errors.password}</p>
                            )}
                            {formData.password && (
                                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${formData.password.length < 6 ? 'w-1/3 bg-red-400' :
                                                formData.password.length < 10 ? 'w-2/3 bg-yellow-400' :
                                                    'w-full bg-emerald-400'
                                            }`}
                                    ></div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <FiCheckCircle className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} />
                                <input
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className={getInputClass('confirmPassword')}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('confirmPassword')}
                                />
                            </div>
                            {touched.confirmPassword && errors.confirmPassword && (
                                <p className="text-red-500 text-xs pl-4 font-medium">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/30 transform transition-all duration-200 active:scale-95 ${isLoading
                                    ? 'bg-blue-400 opacity-80 cursor-wait'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 md:mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Already have an account?
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
