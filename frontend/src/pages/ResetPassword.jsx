import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const navigate = useNavigate();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => { inputRefs.current[0]?.focus(); }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
            return () => clearTimeout(t);
        } else { setCanResend(true); }
    }, [resendTimer]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) { setOtp(paste.split('')); inputRefs.current[5]?.focus(); }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setResendTimer(60); setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setError(''); setIsLoading(true);
        try {
            await api.put('/auth/reset-password', { email, otp: code, password });
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    if (done) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[var(--bg-panel)] rounded-2xl shadow-2xl p-8 border border-slate-700 text-center">
                <img src="/logo.svg" alt="FleetFlow" className="h-12 w-auto mx-auto mb-6" />
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Password Updated!</h1>
                <p className="text-slate-400 text-sm">Redirecting you to login in a few seconds...</p>
                <Link to="/login" className="block text-center mt-4 text-indigo-400 hover:underline text-sm">Go now →</Link>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-[var(--bg-panel)] rounded-2xl shadow-2xl p-8 border border-slate-700"
            >
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.svg" alt="FleetFlow" className="h-12 w-auto mb-4" />
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
                        <Lock className="w-8 h-8 text-rose-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                    <p className="text-sm text-slate-400 mt-1 text-center">
                        Enter the code sent to <span className="text-rose-400 font-medium">{email}</span>
                    </p>
                </div>

                {error && <div className="mb-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* OTP Boxes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3 text-center">6-Digit Reset Code</label>
                        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                                />
                            ))}
                        </div>
                        <div className="text-center mt-2">
                            <button type="button" onClick={handleResend} disabled={!canResend}
                                className="flex items-center gap-1.5 mx-auto text-xs text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                <RefreshCw className="w-3 h-3" />
                                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input type={showPw ? 'text' : 'password'} required value={password}
                                onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                                className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
                            <button type="button" onClick={() => setShowPw(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input type={showPw ? 'text' : 'password'} required value={confirm}
                                onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password"
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
                        {isLoading ? 'Updating...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-5 text-center">
                    <Link to="/login" className="text-sm text-slate-400 hover:text-rose-400 transition-colors">← Back to Login</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
