import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShieldAlert, AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import TruckLoader from '../components/TruckLoader';

const SEVERITY_CONFIG = {
    'Low': { color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: Info, dot: 'bg-sky-400' },
    'Medium': { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertTriangle, dot: 'bg-amber-400' },
    'Critical': { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: AlertCircle, dot: 'bg-rose-400' },
};

const SeverityPill = ({ severity }) => {
    const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG['Low'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {severity}
        </span>
    );
};

const Incidents = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    usePageTitle('Safety & Incidents');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formRef, setFormRef] = React.useState(null);

    const closeModal = () => {
        setIsAddOpen(false);
        setErrorMsg('');
        if (formRef) formRef.reset();
    };

    const { data: incidents = [], isLoading } = useQuery({
        queryKey: ['incidents'],
        queryFn: async () => {
            const { data } = await api.get('/incidents');
            return data;
        }
    });

    const { data: drivers = [] } = useQuery({
        queryKey: ['drivers'],
        queryFn: async () => {
            const { data } = await api.get('/drivers');
            return data;
        }
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const { data } = await api.get('/vehicles');
            return data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post('/incidents', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['incidents']);
            queryClient.invalidateQueries(['drivers']);
            closeModal();
        },
        onError: (err) => setErrorMsg(err.response?.data?.message || err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/incidents/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['incidents']);
            queryClient.invalidateQueries(['drivers']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        // Strip empty vehicleId — empty string fails Mongoose ObjectId validation
        if (!data.vehicleId || data.vehicleId === '') delete data.vehicleId;
        if (!data.driverId || data.driverId === '') {
            setErrorMsg('Please select a driver.');
            return;
        }
        createMutation.mutate(data);
    };

    // Summary cards data
    const criticalCount = incidents.filter(i => i.severity === 'Critical').length;
    const mediumCount = incidents.filter(i => i.severity === 'Medium').length;
    const totalDriversAffected = new Set(incidents.map(i => i.driverId?._id)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <ShieldAlert className="w-7 h-7 text-rose-400" />
                        Safety & Incident Log
                    </h1>
                    <p className="text-slate-400 mt-1">Track compliance incidents, violations, and safety events</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Log Incident
                </button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-rose-500/10">
                        <AlertCircle className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Critical Incidents</p>
                        <p className="text-3xl font-bold text-white">{criticalCount}</p>
                    </div>
                </div>
                <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/10">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Medium Incidents</p>
                        <p className="text-3xl font-bold text-white">{mediumCount}</p>
                    </div>
                </div>
                <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-indigo-500/10">
                        <ShieldAlert className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Drivers Affected</p>
                        <p className="text-3xl font-bold text-white">{totalDriversAffected}</p>
                    </div>
                </div>
            </div>

            {/* Incidents Table */}
            <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Penalty</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Reported By</th>
                                {user?.role === 'Fleet Manager' && <th className="px-6 py-4" />}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="8"><TruckLoader message="Loading incidents..." /></td></tr>
                            ) : incidents.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center">
                                        <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p>No incidents recorded. Keep up the safe driving!</p>
                                    </td>
                                </tr>
                            ) : incidents.map(inc => (
                                <tr key={inc._id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(inc.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                        {inc.driverId?.name || 'Unknown'}
                                        <span className="block text-xs text-slate-500 font-normal">
                                            Safety Score: {inc.driverId?.safetyScore ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{inc.type}</td>
                                    <td className="px-6 py-4"><SeverityPill severity={inc.severity} /></td>
                                    <td className="px-6 py-4">
                                        <span className="text-rose-400 font-mono font-medium">
                                            -{inc.penaltyApplied} pts
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-slate-300">{inc.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{inc.reportedBy?.name || '—'}</td>
                                    {user?.role === 'Fleet Manager' && (
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteMutation.mutate(inc._id)}
                                                className="text-slate-600 hover:text-rose-400 transition-colors"
                                                title="Delete & Reverse Penalty"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Incident Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-panel)] border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                                        Log Safety Incident
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1">Penalties are automatically applied to the driver's safety score.</p>
                                </div>
                                <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {errorMsg && <div className="mb-4 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{errorMsg}</div>}

                            <form ref={setFormRef} onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Driver *</label>
                                    <select required name="driverId" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-rose-500">
                                        <option value="">-- Select Driver --</option>
                                        {drivers.map(d => (
                                            <option key={d._id} value={d._id}>{d.name} (Score: {d.safetyScore})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle Involved (optional)</label>
                                    <select name="vehicleId" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-rose-500">
                                        <option value="">-- No vehicle / Unknown --</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.model} ({v.licensePlate})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Incident Type *</label>
                                        <select required name="type" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-rose-500">
                                            <option value="">-- Select Type --</option>
                                            <option>Accident</option>
                                            <option>Traffic Violation</option>
                                            <option>Cargo Damage</option>
                                            <option>Safety Complaint</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Severity *</label>
                                        <select required name="severity" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-rose-500">
                                            <option value="">-- Select Severity --</option>
                                            <option value="Low">Low (-5 pts)</option>
                                            <option value="Medium">Medium (-15 pts)</option>
                                            <option value="Critical">Critical (-30 pts)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Incident Date *</label>
                                    <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-rose-500" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                                    <textarea required name="description" rows={3} placeholder="Describe what happened in detail..."
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
                                </div>

                                {/* Penalty Preview */}
                                <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 text-sm text-rose-300">
                                    <p className="font-medium mb-0.5">⚠️ Penalty Preview</p>
                                    <p className="text-rose-400/70 text-xs">Low = -5 pts · Medium = -15 pts · Critical = -30 pts from driver's safety score.</p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-300 hover:text-white font-medium">Cancel</button>
                                    <button type="submit" disabled={createMutation.isPending}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                                        {createMutation.isPending ? 'Saving...' : 'File Report'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Incidents;
