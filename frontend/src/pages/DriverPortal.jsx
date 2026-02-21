import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle, Navigation, Map, Download, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatusPill = ({ status }) => {
    const colors = {
        'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        'Dispatched': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Cancelled': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return (
        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${colors[status] || colors['Draft']}`}>
            {status}
        </span>
    );
};

const DriverPortal = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [isCompleteOpen, setIsCompleteOpen] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips'],
        queryFn: async () => {
            const { data } = await api.get('/trips');
            return data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await api.put(`/trips/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['trips']);
            setIsCompleteOpen(null);
            setErrorMsg('');
        },
        onError: (err) => {
            setErrorMsg(err.response?.data?.message || err.message);
        }
    });

    // We only show active trips (Draft are not assigned effectively until Dispatched)
    const activeTrips = trips.filter(t => t.status === 'Dispatched');
    const pastTrips = trips.filter(t => t.status === 'Completed' || t.status === 'Cancelled');

    const handleComplete = (e) => {
        e.preventDefault();
        setErrorMsg('');
        const formData = new FormData(e.target);
        const endOdometer = Number(formData.get('endOdometer'));

        // Revenue is typically not entered by the driver but we provide 0 here
        // as the backend doesn't strictly require revenue from a driver.
        updateStatusMutation.mutate({
            id: isCompleteOpen,
            payload: { status: 'Completed', endOdometer }
        });
    };

    if (isLoading) return <div className="text-slate-400 flex justify-center p-8">Loading your trips...</div>;

    const exportCSV = () => {
        if (!pastTrips.length) return;

        const headers = ['Trip ID', 'Vehicle Model', 'License Plate', 'Status', 'Dispatch Date', 'Distance (km)', 'Revenue ($)'];
        const rows = pastTrips.map(trip => [
            trip._id,
            trip.vehicleId?.model || 'Unknown',
            trip.vehicleId?.licensePlate || 'N/A',
            trip.status,
            new Date(trip.createdAt).toLocaleDateString(),
            trip.endOdometer ? trip.endOdometer - trip.startOdometer : 0,
            trip.revenue || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `driver_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        if (!pastTrips.length) return;

        const doc = new jsPDF();
        doc.text(`Trip History Report - ${user?.name || 'Driver'}`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Trip ID", "Vehicle", "Status", "Date", "Distance (km)", "Revenue"];
        const tableRows = [];

        pastTrips.forEach(trip => {
            const rowData = [
                trip._id.substring(trip._id.length - 6).toUpperCase(),
                `${trip.vehicleId?.model || 'Unknown'} (${trip.vehicleId?.licensePlate || 'N/A'})`,
                trip.status,
                new Date(trip.createdAt).toLocaleDateString(),
                trip.endOdometer ? `${trip.endOdometer - trip.startOdometer} km` : '0 km',
                `$${trip.revenue?.toFixed(2) || '0.00'}`
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] } // Indigo 600
        });

        doc.save(`driver_history_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Driver Portal</h1>
                <p className="text-slate-400 mt-1">Manage your active jobs and view history</p>
            </header>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-indigo-400" /> Current Assignments
                </h2>

                {activeTrips.length === 0 ? (
                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center">
                        <Truck className="w-12 h-12 mb-3 opacity-20" />
                        <p>No active trips assigned. Relax and wait for dispatch.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {activeTrips.map(trip => (
                            <motion.div
                                key={trip._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[var(--bg-panel)] rounded-xl border border-indigo-500/30 p-6 shadow-lg shadow-indigo-500/5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1"><Map className="w-4 h-4 inline mr-1 text-slate-400" /> Trip #{trip._id.substring(trip._id.length - 6).toUpperCase()}</h3>
                                        <div className="text-sm text-slate-400">Assigned Vehicle: <span className="text-white font-medium">{trip.vehicleId?.model} ({trip.vehicleId?.licensePlate})</span></div>
                                    </div>
                                    <StatusPill status={trip.status} />
                                </div>
                                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cargo</p>
                                        <p className="text-white font-medium">{trip.cargoWeight} kg</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Start Odometer</p>
                                        <p className="text-white font-medium">{trip.startOdometer || 0} km</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCompleteOpen(trip._id)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors font-semibold"
                                >
                                    <CheckCircle className="w-5 h-5" /> Complete Trip
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            <section className="pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-white">Trip History</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCSV}
                            disabled={pastTrips.length === 0}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" /> CSV
                        </button>
                        <button
                            onClick={exportPDF}
                            disabled={pastTrips.length === 0}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700 disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>
                <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Distance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastTrips.map(trip => (
                                <tr key={trip._id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{trip._id.substring(trip._id.length - 6).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-white">{trip.vehicleId?.model}</td>
                                    <td className="px-6 py-4"><StatusPill status={trip.status} /></td>
                                    <td className="px-6 py-4">{new Date(trip.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        {trip.endOdometer ? `${trip.endOdometer - trip.startOdometer} km` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {pastTrips.length === 0 && (
                                <tr><td colSpan="5" className="p-6 text-center text-slate-500">No past trips recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <AnimatePresence>
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
                                    <input
                                        required
                                        name="endOdometer"
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:border-emerald-500"
                                        placeholder="e.g. 150400"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Enter the exact reading from the dashboard at checkout.</p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => { setIsCompleteOpen(null); setErrorMsg(''); }} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" disabled={updateStatusMutation.isPending} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                                        {updateStatusMutation.isPending ? 'Saving...' : 'Confirm'}
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

export default DriverPortal;
