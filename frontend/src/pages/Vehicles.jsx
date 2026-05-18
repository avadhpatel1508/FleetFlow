import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import TruckLoader from '../components/TruckLoader';

const StatusPill = ({ status }) => {
    const colors = {
        'Available': 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        'On Trip': 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] shadow-[0_0_10px_rgba(0,241,254,0.2)]',
        'In Shop': 'bg-[var(--danger)]/10 text-[var(--danger)] shadow-[0_0_10px_rgba(255,113,108,0.2)]',
        'Retired': 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
    };
    return (
        <span className={`px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase rounded ${colors[status] || colors['Retired']}`}>
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
        if (data.licensePlate) {
            data.licensePlate = data.licensePlate.toUpperCase();
        }
        addMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--primary)] tracking-tight uppercase" style={{ letterSpacing: '-0.02em' }}>Vehicle Registry</h1>
                    <p className="text-[var(--text-secondary)] mt-2 font-mono text-sm uppercase">Manage your fleet inventory and status // SYSTEM_READY</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-black rounded-lg transition-all duration-300 font-bold hover:shadow-[0_0_20px_rgba(153,247,255,0.4)] hover:scale-105 active:scale-95 uppercase tracking-wider text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Vehicle
                </button>
            </div>

            <div className="bg-[var(--bg-panel)] rounded-2xl flex flex-col transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="p-5 flex items-center gap-3 bg-[var(--bg-hover)] rounded-t-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="SEARCH MODEL OR LICENSE PLATE..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-dark)] text-sm text-[var(--text-light)] placeholder-[var(--text-muted)] border-b border-[var(--text-dim)] focus:border-[var(--primary)] outline-none transition-all uppercase font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TruckLoader message="Loading vehicles..." />
                ) : (
                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                            <thead className="text-xs uppercase bg-[var(--bg-hover)] text-[var(--text-muted)] font-mono tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">Model</th>
                                    <th className="px-6 py-4">License Plate</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Region</th>
                                    <th className="px-6 py-4">Capacity</th>
                                    <th className="px-6 py-4">Odometer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-2">
                                {filteredVehicles.map(v => (
                                    <tr key={v._id} className="bg-[var(--bg-dark)] hover:bg-[var(--bg-hover)] transition-colors duration-300">
                                        <td className="px-6 py-4 font-bold text-[var(--text-light)]">{v.model}</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-[var(--bg-panel)] px-3 py-1 rounded border-l-2 border-[var(--primary)] text-[var(--primary-light)]">{v.licensePlate}</span></td>
                                        <td className="px-6 py-4 text-[var(--text-muted)]">{v.type}</td>
                                        <td className="px-6 py-4 text-[var(--text-muted)]">{v.region}</td>
                                        <td className="px-6 py-4 text-[var(--accent-purple)] font-mono">{v.maxCapacity} kg</td>
                                        <td className="px-6 py-4 text-[var(--accent-orange)] font-mono">{v.odometer.toLocaleString()} km</td>
                                        <td className="px-6 py-4"><StatusPill status={v.status} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleStatusMutation.mutate({
                                                    id: v._id,
                                                    status: v.status === 'Available' ? 'Retired' : 'Available'
                                                })}
                                                className="px-4 py-1.5 text-xs font-bold text-[var(--primary)] hover:text-black hover:bg-[var(--primary)] hover:shadow-[0_0_15px_rgba(153,247,255,0.4)] rounded transition-all duration-300 uppercase tracking-widest"
                                            >
                                                {v.status === 'Available' ? 'Retire' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredVehicles.length === 0 && (
                                    <tr><td colSpan="8" className="p-12 text-center text-[var(--text-dim)] font-mono">NO_VEHICLES_FOUND</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--bg-panel)] p-8 w-full max-w-2xl shadow-[0_20px_60px_rgba(0,241,254,0.15)] rounded-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent-purple)]"></div>
                            
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-[var(--text-light)] uppercase tracking-wider">Initialize_Vehicle</h2>
                                <button onClick={() => setIsAddOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-hover)] rounded transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Model_Name</label>
                                        <input required name="model" type="text" className="w-full px-4 py-2 bg-[var(--bg-dark)] border-b border-[var(--text-dim)] text-[var(--text-light)] placeholder-[var(--text-dim)] focus:border-[var(--primary)] outline-none transition-all" placeholder="E.G. VOLVO FH16" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">License_Plate</label>
                                        <input required name="licensePlate" type="text" className="w-full px-4 py-2 bg-[var(--bg-dark)] border-b border-[var(--text-dim)] text-[var(--text-light)] font-mono uppercase tracking-widest placeholder-[var(--text-dim)] focus:border-[var(--primary)] outline-none transition-all" placeholder="ABC-1234" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Max_Capacity_KG</label>
                                        <input required name="maxCapacity" type="number" min="0" className="w-full px-4 py-2 bg-[var(--bg-dark)] border-b border-[var(--text-dim)] text-[var(--accent-purple)] font-mono placeholder-[var(--text-dim)] focus:border-[var(--primary)] outline-none transition-all" placeholder="5000" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Vehicle_Type</label>
                                        <select required name="type" className="w-full px-4 py-2 bg-[var(--bg-dark)] border-b border-[var(--text-dim)] text-[var(--text-light)] focus:border-[var(--primary)] outline-none transition-all">
                                            <option value="">SELECT_TYPE...</option>
                                            <option value="Van">VAN</option>
                                            <option value="Truck">TRUCK</option>
                                            <option value="Car">CAR</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Region</label>
                                        <input required name="region" type="text" className="w-full px-4 py-2 bg-[var(--bg-dark)] border-b border-[var(--text-dim)] text-[var(--text-light)] placeholder-[var(--text-dim)] focus:border-[var(--primary)] outline-none transition-all uppercase" placeholder="NORTH_SECTOR" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Acquisition_Cost_$</label>
                                        <input required name="acquisitionCost" type="number" min="0" className="w-full px-4 py-2 bg-[var(--bg-dark)] border-b border-[var(--text-dim)] text-[var(--accent-green)] font-mono placeholder-[var(--text-dim)] focus:border-[var(--primary)] outline-none transition-all" placeholder="50000" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <label className="block text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Initial_Odometer_KM</label>
                                        <input name="odometer" type="number" defaultValue={0} min="0" className="w-full px-4 py-2 bg-[var(--bg-dark)] border-b border-[var(--text-dim)] text-[var(--accent-orange)] font-mono placeholder-[var(--text-dim)] focus:border-[var(--primary)] outline-none transition-all" placeholder="0" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 pt-8 mt-4 bg-[var(--bg-panel)]">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="px-6 py-2 text-[var(--text-muted)] hover:text-[var(--text-light)] hover:bg-[var(--bg-hover)] rounded uppercase text-sm font-bold tracking-widest transition-all">Abort</button>
                                    <button type="submit" disabled={addMutation.isPending} className="px-6 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-black rounded font-bold tracking-widest uppercase text-sm transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(153,247,255,0.4)]">
                                        {addMutation.isPending ? 'Processing...' : 'Execute_Save'}
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
