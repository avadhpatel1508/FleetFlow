import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import TruckLoader from '../components/TruckLoader';

const Maintenance = () => {
    const queryClient = useQueryClient();
    usePageTitle('Maintenance');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['maintenance'],
        queryFn: async () => {
            const { data } = await api.get('/maintenance');
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
        mutationFn: async (newLog) => {
            const { data } = await api.post('/maintenance', newLog);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['maintenance']);
            queryClient.invalidateQueries(['vehicles']); // Since vehicle goes to In Shop
            setIsAddOpen(false);
            setErrorMsg('');
        },
        onError: (err) => {
            setErrorMsg(err.response?.data?.message || err.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.cost = Number(data.cost);
        createMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance Log</h1>
                    <p className="text-slate-400 mt-1">Track fleet services and expenses</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Log Service
                </button>
            </div>

            <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                            <tr>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Service Type</th>
                                <th className="px-6 py-4">Cost</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5"><TruckLoader message="Loading maintenance logs..." /></td></tr>
                            ) : logs.map(l => (
                                <tr key={l._id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-white">{l.vehicleId?.model}</span>
                                        <span className="text-xs block text-slate-500">{l.vehicleId?.licensePlate}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{l.serviceType}</td>
                                    <td className="px-6 py-4 font-mono text-white">${l.cost.toFixed(2)}</td>
                                    <td className="px-6 py-4">{new Date(l.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{l.notes}</td>
                                </tr>
                            ))}
                            {!isLoading && logs.length === 0 && (
                                <tr><td colSpan="5" className="p-6 text-center">No maintenance logs found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-panel)] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Log Maintenance</h2>
                                <button onClick={() => { setIsAddOpen(false); setErrorMsg(''); }} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {errorMsg && <div className="mb-4 text-red-400 text-sm bg-red-400/10 p-3 rounded">{errorMsg}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle</label>
                                    <select required name="vehicleId" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500">
                                        <option value="">-- Select Vehicle --</option>
                                        {vehicles.filter(v => v.status !== 'On Trip').map(v => (
                                            <option key={v._id} value={v._id}>{v.model} ({v.licensePlate})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Vehicle will automatically be marked 'In Shop'</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Service Type</label>
                                    <input required name="serviceType" type="text" placeholder="e.g., Oil Change, Brake Pad Replacement" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Cost ($)</label>
                                    <input required name="cost" type="number" step="0.01" min="0" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                                    <textarea name="notes" rows={3} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">Cancel</button>
                                    <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">Save Record</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Maintenance;
