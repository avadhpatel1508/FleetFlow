import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, AlertCircle, History, Map, CheckCircle, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatusPill = ({ status }) => {
    const colors = {
        'On Duty': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Off Duty': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        'Suspended': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colors[status] || colors['Off Duty']}`}>
            {status}
        </span>
    );
};

const Drivers = () => {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [historyDriver, setHistoryDriver] = useState(null);
    const [search, setSearch] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { data: drivers = [], isLoading } = useQuery({
        queryKey: ['drivers'],
        queryFn: async () => {
            const { data } = await api.get('/drivers');
            return data;
        }
    });

    const addMutation = useMutation({
        mutationFn: async (newDriver) => {
            const { data } = await api.post('/drivers', newDriver);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['drivers']);
            setIsAddOpen(false);
            setErrorMsg('');
        },
        onError: (err) => {
            setErrorMsg(err.response?.data?.message || err.message);
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await api.put(`/drivers/${id}`, { status });
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries(['drivers'])
    });

    // We fetch history dynamically when the modal opens based on the `historyDriver` state
    const { data: driverTrips = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['trips', historyDriver?._id],
        queryFn: async () => {
            if (!historyDriver?._id) return [];
            const { data } = await api.get(`/trips?driverId=${historyDriver._id}`);
            return data;
        },
        enabled: !!historyDriver?._id
    });

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    const exportCSV = () => {
        if (!drivers.length) return;

        const headers = ['Name', 'Valid Types', 'License Expiry', 'Safety Score', 'Completion Rate (%)', 'Status'];
        const rows = drivers.map(d => [
            d.name,
            d.allowedVehicleType.join('; '),
            new Date(d.licenseExpiryDate).toLocaleDateString(),
            d.safetyScore,
            d.completionRate,
            d.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `driver_registry_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        if (!drivers.length) return;

        const doc = new jsPDF();
        doc.text("FleetFlow Driver Registry Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Name", "Valid Types", "License Expiry", "Safety Score", "Completion (%)", "Status"];
        const tableRows = [];

        drivers.forEach(d => {
            const rowData = [
                d.name,
                d.allowedVehicleType.join(', '),
                new Date(d.licenseExpiryDate).toLocaleDateString(),
                d.safetyScore,
                d.completionRate,
                d.status
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`driver_registry_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const formData = new FormData(e.target);

        const data = {
            name: formData.get('name'),
            licenseExpiryDate: formData.get('licenseExpiryDate'),
            allowedVehicleType: formData.getAll('allowedVehicleType')
        };

        if (data.allowedVehicleType.length === 0) {
            setErrorMsg('Select at least one allowed vehicle type.');
            return;
        }

        addMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Driver Registry</h1>
                    <p className="text-slate-400 mt-1">Manage personnel, safety scores, and compliance</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={exportCSV}
                        disabled={isLoading || drivers.length === 0}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> CSV
                    </button>
                    <button
                        onClick={exportPDF}
                        disabled={isLoading || drivers.length === 0}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700 disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4" /> PDF
                    </button>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Register Driver
                    </button>
                </div>
            </div>

            <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search driver name..."
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
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Valid Types</th>
                                <th className="px-6 py-4">License Expiry</th>
                                <th className="px-6 py-4">Safety Score</th>
                                <th className="px-6 py-4">Completion %</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="7" className="p-6 text-center">Loading drivers...</td></tr>
                            ) : filteredDrivers.map(d => {
                                const isExpired = new Date(d.licenseExpiryDate) < new Date();
                                return (
                                    <tr key={d._id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                            {d.name}
                                            {isExpired && <AlertCircle className="w-4 h-4 text-rose-500" title="License Expired" />}
                                        </td>
                                        <td className="px-6 py-4">{d.allowedVehicleType.join(', ')}</td>
                                        <td className={`px-6 py-4 ${isExpired ? 'text-rose-400 font-medium' : ''}`}>
                                            {new Date(d.licenseExpiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-slate-700 rounded-full h-2 max-w-[4rem]">
                                                    <div className={`h-2 rounded-full ${d.safetyScore >= 90 ? 'bg-emerald-400' : d.safetyScore >= 70 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${d.safetyScore}%` }}></div>
                                                </div>
                                                <span>{d.safetyScore}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{d.completionRate}%</td>
                                        <td className="px-6 py-4"><StatusPill status={d.status} /></td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setHistoryDriver(d)}
                                                className="text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-1 transition-colors"
                                                title="View History"
                                            >
                                                <History className="w-4 h-4" /> <span className="hidden sm:inline">History</span>
                                            </button>

                                            {d.status !== 'On Duty' && (
                                                <button
                                                    onClick={() => toggleStatusMutation.mutate({
                                                        id: d._id,
                                                        status: d.status === 'Suspended' ? 'Off Duty' : 'Suspended'
                                                    })}
                                                    className={`${d.status === 'Suspended' ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'} font-medium`}
                                                >
                                                    {d.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {!isLoading && filteredDrivers.length === 0 && (
                                <tr><td colSpan="7" className="p-6 text-center">No drivers found.</td></tr>
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
                                <h2 className="text-xl font-bold text-white">Register Driver</h2>
                                <button onClick={() => { setIsAddOpen(false); setErrorMsg(''); }} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {errorMsg && <div className="mb-4 text-red-400 text-sm bg-red-400/10 p-3 rounded">{errorMsg}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                                    <input required name="name" type="text" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">License Expiry Date</label>
                                    <input required name="licenseExpiryDate" type="date" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Allowed Vehicle Types</label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 text-slate-300">
                                            <input type="checkbox" name="allowedVehicleType" value="Van" className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500" />
                                            Van
                                        </label>
                                        <label className="flex items-center gap-2 text-slate-300">
                                            <input type="checkbox" name="allowedVehicleType" value="Truck" className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500" />
                                            Truck
                                        </label>
                                        <label className="flex items-center gap-2 text-slate-300">
                                            <input type="checkbox" name="allowedVehicleType" value="Car" className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500" />
                                            Car
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">Cancel</button>
                                    <button type="submit" disabled={addMutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">Save Driver</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {historyDriver && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-panel)] border border-slate-700 rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[80vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <History className="w-5 h-5 text-indigo-400" /> Trip History
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">Driving record for <span className="text-white font-medium">{historyDriver.name}</span></p>
                                </div>
                                <button onClick={() => setHistoryDriver(null)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                                {isHistoryLoading ? (
                                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>
                                ) : driverTrips.length === 0 ? (
                                    <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center">
                                        <Map className="w-10 h-10 mb-3 opacity-20" />
                                        <p>No trips recorded for this driver yet.</p>
                                    </div>
                                ) : (
                                    driverTrips.map(trip => (
                                        <div key={trip._id} className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs text-slate-500 uppercase">#{trip._id.substring(trip._id.length - 6)}</span>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : trip.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                        {trip.status}
                                                    </span>
                                                </div>
                                                <h4 className="text-white font-medium">{trip.vehicleId?.model || 'Unknown Vehicle'} ({trip.vehicleId?.licensePlate || 'N/A'})</h4>
                                                <p className="text-xs text-slate-400 mt-1">Dispatched: {new Date(trip.createdAt).toLocaleString()}</p>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="text-right">
                                                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">Distance</p>
                                                    <p className="text-slate-300 font-medium">
                                                        {trip.endOdometer ? `${trip.endOdometer - trip.startOdometer} km` : 'Active'}
                                                    </p>
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">Revenue</p>
                                                    <p className="text-emerald-400 font-medium">
                                                        {trip.revenue ? `$${trip.revenue.toFixed(2)}` : 'Pending'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Drivers;
