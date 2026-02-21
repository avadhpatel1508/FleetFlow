import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, CheckCircle } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import TruckLoader from '../components/TruckLoader';

const StatusPill = ({ status }) => {
    const colors = {
        'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        'Dispatched': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Cancelled': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colors[status] || colors['Draft']}`}>
            {status}
        </span>
    );
};

const Dispatcher = () => {
    const queryClient = useQueryClient();
    usePageTitle('Dispatch');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isCompleteOpen, setIsCompleteOpen] = useState(null); // stores trip id to complete
    const [search, setSearch] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { data: trips = [], isLoading: tripsLoading } = useQuery({
        queryKey: ['trips'],
        queryFn: async () => {
            const { data } = await api.get('/trips');
            return data;
        }
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles', 'Available'],
        queryFn: async () => {
            const { data } = await api.get('/vehicles?status=Available');
            return data;
        }
    });

    const { data: drivers = [] } = useQuery({
        queryKey: ['drivers', 'Off Duty'],
        queryFn: async () => {
            const { data } = await api.get('/drivers?status=Off Duty');
            return data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newTrip) => {
            const { data } = await api.post('/trips', newTrip);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['trips']);
            queryClient.invalidateQueries(['vehicles']);
            queryClient.invalidateQueries(['drivers']);
            setIsAddOpen(false);
            setErrorMsg('');
        },
        onError: (err) => {
            setErrorMsg(err.response?.data?.message || err.message);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await api.put(`/trips/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['trips']);
            queryClient.invalidateQueries(['vehicles']);
            queryClient.invalidateQueries(['drivers']);
            setIsCompleteOpen(null);
            setErrorMsg('');
        },
        onError: (err) => {
            setErrorMsg(err.response?.data?.message || err.message);
        }
    });

    const filteredTrips = trips.filter(t =>
        t.vehicleId?.model.toLowerCase().includes(search.toLowerCase()) ||
        t.driverId?.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.cargoWeight = Number(data.cargoWeight);
        data.status = 'Dispatched'; // Direct dispatch

        createMutation.mutate(data);
    };

    const handleComplete = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const formData = new FormData(e.target);
        const endOdometer = Number(formData.get('endOdometer'));

        updateStatusMutation.mutate({
            id: isCompleteOpen,
            payload: { status: 'Completed', endOdometer }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Trip Dispatcher</h1>
                    <p className="text-slate-400 mt-1">Assign drivers and vehicles to jobs</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Dispatch
                </button>
            </div>

            <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search vehicle or driver..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                            <tr>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Cargo Weight</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tripsLoading ? (
                                <tr><td colSpan="6"><TruckLoader message="Loading trips..." /></td></tr>
                            ) : filteredTrips.map(t => (
                                <tr key={t._id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{t.vehicleId?.model}</div>
                                        <div className="text-xs">{t.vehicleId?.licensePlate}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-300">{t.driverId?.name}</td>
                                    <td className="px-6 py-4">{t.cargoWeight} kg</td>
                                    <td className="px-6 py-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4"><StatusPill status={t.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        {t.status === 'Dispatched' && (
                                            <button
                                                onClick={() => setIsCompleteOpen(t._id)}
                                                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-end w-full gap-1"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Complete
                                            </button>
                                        )}
                                        {t.status === 'Draft' && (
                                            <button
                                                onClick={() => updateStatusMutation.mutate({ id: t._id, payload: { status: 'Dispatched' } })}
                                                className="text-blue-400 hover:text-blue-300 font-medium"
                                            >
                                                Dispatch
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!tripsLoading && filteredTrips.length === 0 && (
                                <tr><td colSpan="6" className="p-6 text-center">No trips found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Trip Modal */}
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
                                <h2 className="text-xl font-bold text-white">Create New Trip</h2>
                                <button onClick={() => { setIsAddOpen(false); setErrorMsg(''); }} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {errorMsg && <div className="mb-4 text-red-400 text-sm bg-red-400/10 p-3 rounded">{errorMsg}</div>}

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Select Available Vehicle</label>
                                    <select required name="vehicleId" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500">
                                        <option value="">-- Select Vehicle --</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.model} ({v.licensePlate}) - Max: {v.maxCapacity}kg</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Select Driver</label>
                                    <select required name="driverId" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500">
                                        <option value="">-- Select Driver --</option>
                                        {drivers.map(d => (
                                            <option key={d._id} value={d._id}>{d.name} (Valid till {new Date(d.licenseExpiryDate).toLocaleDateString()})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Cargo Weight (kg)</label>
                                    <input required name="cargoWeight" type="number" min="1" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">Cancel</button>
                                    <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">Dispatch Trip</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Complete Trip Modal */}
                {isCompleteOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-panel)] border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Complete Trip</h2>

                            {errorMsg && <div className="mb-4 text-red-400 text-sm bg-red-400/10 p-3 rounded">{errorMsg}</div>}

                            <form onSubmit={handleComplete} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Final Odometer Reading</label>
                                    <input required name="endOdometer" type="number" min="0" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-emerald-500" />
                                </div>
                                <div className="text-sm text-slate-400 italic">
                                    Revenue will be auto-calculated upon completion.
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => { setIsCompleteOpen(null); setErrorMsg(''); }} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                                    <button type="submit" disabled={updateStatusMutation.isPending} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50">Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dispatcher;
