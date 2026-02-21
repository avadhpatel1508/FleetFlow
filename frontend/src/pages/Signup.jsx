import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Truck, Lock, Mail, AlertCircle, User, Briefcase } from 'lucide-react';

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
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-[var(--bg-panel)] rounded-2xl shadow-2xl p-8 border border-slate-700 mt-8 mb-8"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4">
                        <Truck className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-2">Join FleetFlow to manage your operations</p>
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-500"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

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
                                placeholder="john@fleetflow.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-slate-500" />
                            </div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white appearance-none"
                            >
                                <option value="Dispatcher">Dispatcher</option>
                                <option value="Safety Officer">Safety Officer</option>
                                <option value="Financial Analyst">Financial Analyst</option>
                                <option value="Driver">Driver</option>
                            </select>
                        </div>
                    </div>

                    {role === 'Driver' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5 border-t border-slate-700/50 pt-5 mt-2"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">License Expiry Date</label>
                                <input
                                    type="date"
                                    required={role === 'Driver'}
                                    value={licenseExpiryDate}
                                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Vehicle Certifications</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['Car', 'Truck', 'Van'].map((type) => (
                                        <label key={type} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800/30 transition-colors">
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
                                                className="w-4 h-4 text-indigo-500 rounded border-slate-600 focus:ring-indigo-500 bg-slate-800"
                                            />
                                            <span className="text-sm text-slate-300">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                {role === 'Driver' && allowedVehicleType.length === 0 && (
                                    <p className="text-xs text-red-400 mt-2">Please select at least one certification.</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                required
                                minLength="6"
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
                            'Sign Up'
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
