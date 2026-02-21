import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Truck, Lock, Mail, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // If account is not verified, redirect to OTP page
            if (err.response?.data?.needsVerification) {
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
                return;
            }
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-[var(--bg-panel)] rounded-2xl shadow-2xl p-8 border border-slate-700"
            >
                <div className="flex flex-col items-center mb-8">
                    <img src="/logo.svg" alt="FleetFlow" className="h-12 w-auto mb-3" />
                    <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your command center</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center text-red-400 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-500"
                                placeholder="admin@fleetflow.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
