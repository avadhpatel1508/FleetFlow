import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { login: setUser } = useAuth();

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
            return () => clearTimeout(t);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }
        setError(''); setIsLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp: code });
            // Auto-login after verification
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setError(''); setSuccess('');
        try {
            await api.post('/auth/resend-otp', { email });
            setSuccess('New OTP sent! Check your inbox.');
            setResendTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
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
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
                    <p className="text-sm text-slate-400 mt-2 text-center">
                        We sent a 6-digit code to <span className="text-indigo-400 font-medium">{email}</span>
                    </p>
                </div>

                {error && <div className="mb-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">{error}</div>}
                {success && <div className="mb-4 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-lg text-center">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleResend}
                        disabled={!canResend}
                        className="flex items-center gap-2 mx-auto text-sm text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                    </button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Wrong email? <Link to="/signup" className="text-indigo-400 hover:underline">Go back</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;
