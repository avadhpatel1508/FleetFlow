import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setError(''); setIsLoading(true);
        try {
            await api.put(`/auth/reset-password/${token}`, { password });
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
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
                    <div className={`w-16 h-16 rounded-full ${done ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} flex items-center justify-center mb-4`}>
                        {done ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <Lock className="w-8 h-8 text-indigo-400" />}
                    </div>
                    <h1 className="text-2xl font-bold text-white">{done ? 'Password Updated!' : 'Set New Password'}</h1>
                    <p className="text-sm text-slate-400 mt-2 text-center">
                        {done ? 'Redirecting you to login in a few seconds...' : 'Choose a strong password for your account.'}
                    </p>
                </div>

                {!done && (
                    <>
                        {error && <div className="mb-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                        {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        required
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Re-enter password"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}

                {done && (
                    <Link to="/login" className="block text-center mt-4 text-indigo-400 hover:underline text-sm">
                        Go to Login now
                    </Link>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
