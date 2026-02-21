import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            // Navigate directly to reset page with email as query param
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                    <img src="/logo.svg" alt="FleetFlow" className="h-12 w-auto mb-4" />
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-rose-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                    <p className="text-sm text-slate-400 mt-2 text-center">Enter your email and we'll send you a reset code.</p>
                </div>

                {error && <div className="mb-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Sending Code...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
