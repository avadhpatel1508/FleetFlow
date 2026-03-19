import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Truck, Lock, Mail, AlertCircle, User, Briefcase, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Dispatcher');
    // Driver-specific fields
    const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
    const [allowedVehicleType, setAllowedVehicleType] = useState([]);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(name, email, password, role, { licenseExpiryDate, allowedVehicleType });
            // Redirect to dashboard after successful registration and auto-login
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-dark)] via-[var(--bg-secondary)] to-[var(--bg-dark)] px-4 py-12 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl shadow-2xl shadow-black/50 p-8 border border-white/10 backdrop-blur-md relative z-10 my-8"
            >
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4 group hover:scale-110 transition-transform">
                        <Truck className="w-8 h-8 text-white group-hover:animate-float" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-sm text-slate-400 mt-1">Join FleetFlow to manage your operations</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-500 hover:border-white/20"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-500 hover:border-white/20"
                                placeholder="john@fleetflow.com"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-2">Role</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white appearance-none hover:border-white/20"
                            >
                                <option value="Dispatcher">Dispatcher</option>
                                <option value="Safety Officer">Safety Officer</option>
                                <option value="Financial Analyst">Financial Analyst</option>
                                <option value="Driver">Driver</option>
                            </select>
                        </div>
                    </div>

                    {/* Driver-specific fields */}
                    {role === 'Driver' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5 border-t border-white/10 pt-5 -mx-8 px-8"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-2">License Expiry Date</label>
                                <input
                                    type="date"
                                    required={role === 'Driver'}
                                    value={licenseExpiryDate}
                                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white hover:border-white/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-3">Vehicle Certifications</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['Car', 'Truck', 'Van'].map((type) => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all">
                                            <input
                                                type="checkbox"
                                                value={type}
                                                checked={allowedVehicleType.includes(type)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setAllowedVehicleType([...allowedVehicleType, type]);
                                                    } else {
                                                        setAllowedVehicleType(allowedVehicleType.filter(t => t !== type));
                                                    }
                                                }}
                                                className="w-5 h-5 text-indigo-500 rounded border-white/20 focus:ring-indigo-500 bg-slate-800 accent-indigo-500"
                                            />
                                            <span className="text-sm text-slate-300 font-medium">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                {role === 'Driver' && allowedVehicleType.length === 0 && (
                                    <p className="text-xs text-red-400 mt-2">Please select at least one certification.</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-500 hover:border-white/20"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-xl hover:shadow-indigo-500/30 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign Up
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-300 hover:text-indigo-200 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
