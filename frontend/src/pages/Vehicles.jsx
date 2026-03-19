import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import TruckLoader from '../components/TruckLoader';

const StatusPill = ({ status }) => {
    const colors = {
        'Available': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10',
        'On Trip': 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-500/10',
        'In Shop': 'bg-red-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-500/10',
        'Retired': 'bg-slate-700/50 text-slate-300 border-slate-700'
    };
    return (
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${colors[status] || colors['Retired']}`}>
            {status}
        </span>
    );
};

const Vehicles = () => {
    const queryClient = useQueryClient();
    usePageTitle('Vehicles');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [search, setSearch] = useState('');

    const { data: vehicles = [], isLoading } = useQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const { data } = await api.get('/vehicles');
            return data;
        }
    });

    const addMutation = useMutation({
        mutationFn: async (newVehicle) => {
            const { data } = await api.post('/vehicles', newVehicle);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vehicles']);
            setIsAddOpen(false);
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await api.put(`/vehicles/${id}`, { status });
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries(['vehicles'])
    });

    const filteredVehicles = vehicles.filter(v =>
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.maxCapacity = Number(data.maxCapacity);
        data.odometer = Number(data.odometer);
        data.acquisitionCost = Number(data.acquisitionCost);
        addMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Vehicle Registry</h1>
                    <p className="text-slate-400 mt-2">Manage your fleet inventory and status</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white rounded-lg transition-all duration-200 font-semibold hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Vehicle
                </button>
            </div>

            <div className="bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl border border-white/10 flex flex-col hover:border-white/20 transition-all duration-300">
                <div className="p-5 border-b border-white/10 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search model or license plate..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TruckLoader message="Loading vehicles..." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-xs uppercase bg-white/5 text-slate-300 font-semibold">
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4">Model</th>
                                    <th className="px-6 py-4">License Plate</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Region</th>
                                    <th className="px-6 py-4">Capacity</th>
                                    <th className="px-6 py-4">Odometer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map(v => (
                                    <tr key={v._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                                        <td className="px-6 py-4 font-semibold text-white">{v.model}</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-slate-800/50 px-3 py-1 rounded-lg border border-white/10 text-slate-300">{v.licensePlate}</span></td>
                                        <td className="px-6 py-4 text-slate-300">{v.type}</td>
                                        <td className="px-6 py-4 text-slate-300">{v.region}</td>
                                        <td className="px-6 py-4 text-slate-300">{v.maxCapacity} kg</td>
                                        <td className="px-6 py-4 text-slate-300">{v.odometer.toLocaleString()} km</td>
                                        <td className="px-6 py-4"><StatusPill status={v.status} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleStatusMutation.mutate({
                                                    id: v._id,
                                                    status: v.status === 'Available' ? 'Retired' : 'Available'
                                                })}
                                                className="px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/30 transition-all duration-200"
                                            >
                                                {v.status === 'Available' ? 'Retire' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredVehicles.length === 0 && (
                                    <tr><td colSpan="8" className="p-12 text-center text-slate-500">No vehicles found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl shadow-black/50"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Add New Vehicle</h2>
                                <button onClick={() => setIsAddOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Model Name</label>
                                        <input required name="model" type="text" className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20" placeholder="e.g., Volvo FH16" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">License Plate</label>
                                        <input required name="licensePlate" type="text" className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white font-mono uppercase tracking-wider placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20" placeholder="ABC-1234" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Max Capacity (kg)</label>
                                        <input required name="maxCapacity" type="number" min="0" className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20" placeholder="5000" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Vehicle Type</label>
                                        <select required name="type" className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20">
                                            <option value="">Select type...</option>
                                            <option value="Van">Van</option>
                                            <option value="Truck">Truck</option>
                                            <option value="Car">Car</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Region</label>
                                        <input required name="region" type="text" className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20" placeholder="e.g., North" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Acquisition Cost ($)</label>
                                        <input required name="acquisitionCost" type="number" min="0" className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20" placeholder="50000" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Initial Odometer (km)</label>
                                        <input name="odometer" type="number" defaultValue={0} min="0" className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-white/20" placeholder="0" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all font-semibold">Cancel</button>
                                    <button type="submit" disabled={addMutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white rounded-lg font-semibold transition-all disabled:opacity-50 hover:scale-105 active:scale-95">
                                        {addMutation.isPending ? 'Saving...' : 'Save Vehicle'}
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

export default Vehicles;
