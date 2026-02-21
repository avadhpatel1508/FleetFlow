import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search } from 'lucide-react';

const StatusPill = ({ status }) => {
    const colors = {
        'Available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'On Trip': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'In Shop': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        'Retired': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colors[status] || colors['Retired']}`}>
            {status}
        </span>
    );
};

const Vehicles = () => {
    const queryClient = useQueryClient();
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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Vehicle Registry</h1>
                    <p className="text-slate-400 mt-1">Manage your fleet inventory</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                </button>
            </div>

            <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search model or license plate..."
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
                            {isLoading ? (
                                <tr><td colSpan="8" className="p-6 text-center">Loading vehicles...</td></tr>
                            ) : filteredVehicles.map(v => (
                                <tr key={v._id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{v.model}</td>
                                    <td className="px-6 py-4"><span className="font-mono bg-slate-800 px-2 py-1 rounded">{v.licensePlate}</span></td>
                                    <td className="px-6 py-4">{v.type}</td>
                                    <td className="px-6 py-4">{v.region}</td>
                                    <td className="px-6 py-4">{v.maxCapacity} kg</td>
                                    <td className="px-6 py-4">{v.odometer.toLocaleString()} km</td>
                                    <td className="px-6 py-4"><StatusPill status={v.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleStatusMutation.mutate({
                                                id: v._id,
                                                status: v.status === 'Available' ? 'Retired' : 'Available'
                                            })}
                                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                                        >
                                            {v.status === 'Available' ? 'Retire' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredVehicles.length === 0 && (
                                <tr><td colSpan="8" className="p-6 text-center">No vehicles found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-panel)] border border-slate-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Add New Vehicle</h2>
                                <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Model Name</label>
                                        <input required name="model" type="text" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">License Plate (Unique)</label>
                                        <input required name="licensePlate" type="text" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white font-mono uppercase tracking-wider outline-none focus:ring-2 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Max Capacity (kg)</label>
                                        <input required name="maxCapacity" type="number" min="0" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle Type</label>
                                        <select required name="type" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500">
                                            <option value="Van">Van</option>
                                            <option value="Truck">Truck</option>
                                            <option value="Car">Car</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Region</label>
                                        <input required name="region" type="text" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Acquisition Cost</label>
                                        <input required name="acquisitionCost" type="number" min="0" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Initial Odometer</label>
                                        <input name="odometer" type="number" defaultValue={0} min="0" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">Cancel</button>
                                    <button type="submit" disabled={addMutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">Save Vehicle</button>
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
