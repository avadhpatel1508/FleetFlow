import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Truck, SearchCheck, Clock, Package,
    Users, DollarSign, Activity, ShieldAlert, Wrench, TrendingUp
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import TruckLoader from '../components/TruckLoader';

// ------- KPI Card -------
const DashboardCard = ({ title, value, icon: Icon, color, sub, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="group bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl border border-white/10 p-6 flex items-start justify-between hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
    >
        <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-primary mb-2 break-words">{value}</h3>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`p-4 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
    </motion.div>
);

// ------- Activity Color Map -------
const COLOR_MAP = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    sky: 'bg-sky-500/20 text-sky-400 border-sky-500/20',
    slate: 'bg-slate-700/50 text-slate-400 border-slate-700',
};

const EVENT_ICON = { trip: Truck, incident: ShieldAlert, maintenance: Wrench };

const formatRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// ------- Live Dispatch Table -------
const StatusBadge = ({ status }) => {
    const map = {
        Dispatched: 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10',
        Completed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10',
        Draft: 'bg-slate-700/40 text-slate-300 border border-slate-700/60',
        Cancelled: 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg shadow-red-500/10',
    };
    return (
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${map[status] || map.Draft}`}>
            {status}
        </span>
    );
};

// ------- Custom Recharts Tooltip -------
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
            <p className="text-slate-300 font-semibold">{label}</p>
            <p className="text-indigo-400">{payload[0].value} trips</p>
        </div>
    );
};

// ------- Main Dashboard -------
const Dashboard = () => {
    const socket = useSocket();
    const { user } = useAuth();

    if (user?.role === 'Driver') return <Navigate to="/driver-portal" replace />;

    usePageTitle('Command Center');

    const { data: kpis, isLoading, error, refetch } = useQuery({
        queryKey: ['kpis'],
        queryFn: async () => { const { data } = await api.get('/analytics/kpi'); return data; },
    });

    const { data: activity = [] } = useQuery({
        queryKey: ['activity'],
        queryFn: async () => { const { data } = await api.get('/analytics/activity'); return data; },
        refetchInterval: 30000,
    });

    const { data: recentTrips = [] } = useQuery({
        queryKey: ['recent-trips'],
        queryFn: async () => {
            const { data } = await api.get('/trips?limit=8');
            return Array.isArray(data) ? data.slice(0, 8) : (data.trips || []).slice(0, 8);
        },
        refetchInterval: 15000,
    });

    // Build weekly trip chart data (last 7 days)
    const weeklyData = (() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const counts = Array(7).fill(0);
        recentTrips.forEach(t => {
            const d = new Date(t.createdAt);
            if (!isNaN(d)) counts[d.getDay()]++;
        });
        return days.map((name, i) => ({ name, trips: counts[i] }));
    })();

    useEffect(() => {
        if (!socket) return;
        const refetchAll = () => { refetch(); };
        ['vehicleUpdated', 'tripCreated', 'tripUpdated', 'vehicleCreated'].forEach(e => socket.on(e, refetchAll));
        return () => ['vehicleUpdated', 'tripCreated', 'tripUpdated', 'vehicleCreated'].forEach(e => socket.off(e, refetchAll));
    }, [socket, refetch]);

    if (isLoading) return <TruckLoader message="Loading Command Center..." />;
    if (error) return <div className="text-red-400 p-8 text-center">Error loading KPIs</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-slate-400 mt-2 text-sm">Real-time overview of your fleet logistics</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-emerald-300 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 rounded-full px-4 py-2 shadow-lg shadow-emerald-500/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">Live System</span>
                </div>
            </header>

            {/* KPI Grid - 6 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                <DashboardCard title="Vehicles On Trip" value={`${kpis.activeFleet} / ${kpis.totalVehicles}`} icon={Truck} color="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-300" sub="Out of total vehicles" delay={0} />
                <DashboardCard title="Needs Maintenance" value={kpis.maintenanceAlerts} icon={SearchCheck} color="bg-gradient-to-br from-red-500/20 to-pink-500/10 text-red-300" sub="Vehicles currently in shop" delay={0.05} />
                <DashboardCard title="Fleet Utilization" value={`${kpis.utilizationRate}%`} icon={Clock} color="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-300" sub="% of fleet on active trips" delay={0.1} />
                <DashboardCard title="Cargo In Transit" value={`${kpis.pendingCargo} kg`} icon={Package} color="bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-300" sub="Across all dispatched trips" delay={0.15} />
                <DashboardCard title="Registered Drivers" value={kpis.activeDrivers ?? '—'} icon={Users} color="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-300" sub="Drivers in the system" delay={0.2} />
                <DashboardCard title="Total Revenue Earned" value={kpis.totalRevenue != null ? `$${kpis.totalRevenue.toLocaleString()}` : '—'} icon={DollarSign} color="bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-300" sub="From completed trips" delay={0.25} />
            </div>

            {/* Row 2: Dispatch table + Activity feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Live Dispatch Table */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-300" />
                            </div>
                            Live Dispatch Feed
                        </h3>
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">Last 8 trips</span>
                    </div>

                    {recentTrips.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                            <Truck className="w-12 h-12 mb-2 opacity-30" />
                            <p className="text-sm">No trips yet. Dispatch your first vehicle!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 text-xs uppercase font-semibold border-b border-white/10 bg-white/5">
                                        <th className="text-left px-4 py-3">Vehicle</th>
                                        <th className="text-left px-4 py-3">Driver</th>
                                        <th className="text-left px-4 py-3">Route</th>
                                        <th className="text-left px-4 py-3">Cargo</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentTrips.map(trip => (
                                        <tr key={trip._id} className="hover:bg-white/5 transition-colors duration-200">
                                            <td className="px-4 py-3 text-slate-200 font-medium">
                                                {trip.vehicleId?.licensePlate || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {trip.driverId?.name || 'Unassigned'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate">
                                                {trip.origin} → {trip.destination}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{trip.cargoWeight} kg</td>
                                            <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-300" />
                        </div>
                        Recent Activity
                    </h3>
                    <div className="space-y-3 overflow-y-auto max-h-72 pr-2">
                        {activity.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-8">No recent activity.</p>
                        ) : activity.map((event, i) => {
                            const Icon = EVENT_ICON[event.type] || Activity;
                            const colorClass = COLOR_MAP[event.color] || COLOR_MAP.slate;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div className={`mt-0.5 p-2 rounded-lg border ${colorClass} flex-shrink-0`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200 font-medium truncate">{event.title}</p>
                                        <p className="text-xs text-slate-500 truncate">{event.detail}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-600 flex-shrink-0 mt-1">{formatRelativeTime(event.time)}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Row 3: Weekly Trips Chart */}
            <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-white">Weekly Trip Activity</h3>
                        <p className="text-xs text-slate-500 mt-2">Based on recent trips</p>
                    </div>
                    <div className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-slate-500">📊 Last 7 days</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyData} barSize={32} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.15)' }} />
                        <Bar dataKey="trips" radius={[8, 8, 0, 0]}>
                            {weeklyData.map((entry, index) => (
                                <Cell key={index}
                                    fill={entry.trips > 0 ? 'url(#bar-gradient)' : 'rgba(148, 163, 184, 0.1)'}
                                />
                            ))}
                        </Bar>
                        <defs>
                            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};

export default Dashboard;
