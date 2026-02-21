import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Analytics = () => {
    const { data: metrics = [], isLoading } = useQuery({
        queryKey: ['analytics-metrics'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/metrics');
            return data;
        }
    });

    const exportCSV = () => {
        if (!metrics.length) return;

        const headers = ['Vehicle Model', 'License Plate', 'ROI (%)', 'Fuel Efficiency (km/L)', 'Total Revenue ($)', 'Total Maintenance ($)', 'Total Fuel ($)'];

        const rows = metrics.map(m => [
            m.vehicle.model,
            m.vehicle.licensePlate,
            m.roi,
            m.fuelEfficiency,
            m.totalRevenue,
            m.totalMaintenance,
            m.totalFuel
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `fleet_metrics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        if (!metrics.length) return;

        const doc = new jsPDF();
        doc.text("FleetFlow ROI & Efficiency Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Model", "Plate", "ROI (%)", "Efficiency (km/L)", "Revenue", "Maintenance", "Fuel Cost"];
        const tableRows = [];

        metrics.forEach(m => {
            const rowData = [
                m.vehicle.model,
                m.vehicle.licensePlate,
                `${m.roi}%`,
                `${m.fuelEfficiency} km/L`,
                `$${m.totalRevenue.toFixed(2)}`,
                `$${m.totalMaintenance.toFixed(2)}`,
                `$${m.totalFuel.toFixed(2)}`
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

        doc.save(`fleet_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const formatDataForChart = () => {
        return metrics.map(m => ({
            name: m.vehicle.licensePlate,
            ROI: Number(m.roi),
            FuelEfficiency: Number(m.fuelEfficiency)
        }));
    };

    const chartData = formatDataForChart();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Reports</h1>
                    <p className="text-slate-400 mt-1">Financial and operational performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCSV}
                        disabled={isLoading || metrics.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium border border-slate-700 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        CSV Export
                    </button>
                    <button
                        onClick={exportPDF}
                        disabled={isLoading || metrics.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4" />
                        PDF Report
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-slate-400">Loading metrics...</div>
            ) : metrics.length === 0 ? (
                <div className="text-slate-400">No data available for reporting.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-6">Vehicle ROI (%)</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#818cf8' }}
                                    />
                                    <Bar dataKey="ROI" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-6">Fuel Efficiency Trend (km/L)</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#34d399' }}
                                    />
                                    <Line type="monotone" dataKey="FuelEfficiency" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            )}

            {!isLoading && metrics.length > 0 && (
                <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-800">
                        <h3 className="text-lg font-semibold text-white">Aggregated Financials</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                                <tr>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4 text-right">Revenue</th>
                                    <th className="px-6 py-4 text-right">Maintenance Cost</th>
                                    <th className="px-6 py-4 text-right">Fuel Cost</th>
                                    <th className="px-6 py-4 text-right">Net Return</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map(m => {
                                    const net = m.totalRevenue - m.totalMaintenance - m.totalFuel;
                                    return (
                                        <tr key={m.vehicle.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{m.vehicle.model} <span className="text-slate-500 font-normal">({m.vehicle.licensePlate})</span></td>
                                            <td className="px-6 py-4 text-right text-emerald-400">${m.totalRevenue.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-rose-400">${m.totalMaintenance.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-rose-400">${m.totalFuel.toFixed(2)}</td>
                                            <td className={`px-6 py-4 text-right font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
