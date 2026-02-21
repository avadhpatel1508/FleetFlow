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
        className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-5 flex items-start justify-between hover:border-slate-600 transition-colors"
    >
        <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
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
        Dispatched: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
        Completed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        Draft: 'bg-slate-700 text-slate-400 border border-slate-600',
        Cancelled: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || map.Draft}`}>
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
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-slate-400 mt-1 text-sm">Real-time overview of your fleet logistics</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                </div>
            </header>

            {/* KPI Grid - 6 cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <DashboardCard title="Vehicles On Trip" value={`${kpis.activeFleet} / ${kpis.totalVehicles}`} icon={Truck} color="bg-emerald-500/10 text-emerald-400" sub="Out of total vehicles" delay={0} />
                <DashboardCard title="Needs Maintenance" value={kpis.maintenanceAlerts} icon={SearchCheck} color="bg-rose-500/10 text-rose-400" sub="Vehicles currently in shop" delay={0.05} />
                <DashboardCard title="Fleet Utilization" value={`${kpis.utilizationRate}%`} icon={Clock} color="bg-indigo-500/10 text-indigo-400" sub="% of fleet on active trips" delay={0.1} />
                <DashboardCard title="Cargo In Transit" value={`${kpis.pendingCargo} kg`} icon={Package} color="bg-amber-500/10 text-amber-400" sub="Across all dispatched trips" delay={0.15} />
                <DashboardCard title="Registered Drivers" value={kpis.activeDrivers ?? '—'} icon={Users} color="bg-sky-500/10 text-sky-400" sub="Drivers in the system" delay={0.2} />
                <DashboardCard title="Total Revenue Earned" value={kpis.totalRevenue != null ? `$${kpis.totalRevenue.toLocaleString()}` : '—'} icon={DollarSign} color="bg-violet-500/10 text-violet-400" sub="From completed trips" delay={0.25} />
            </div>

            {/* Row 2: Dispatch table + Activity feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Live Dispatch Table */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" /> Live Dispatch Feed
                        </h3>
                        <span className="text-xs text-slate-500">Last 8 trips</span>
                    </div>

                    {recentTrips.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                            <Truck className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">No trips yet. Dispatch your first vehicle!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                                        <th className="text-left pb-2 font-medium">Vehicle</th>
                                        <th className="text-left pb-2 font-medium">Driver</th>
                                        <th className="text-left pb-2 font-medium">Route</th>
                                        <th className="text-left pb-2 font-medium">Cargo</th>
                                        <th className="text-left pb-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {recentTrips.map(trip => (
                                        <tr key={trip._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-2.5 text-slate-200 font-medium">
                                                {trip.vehicleId?.licensePlate || '—'}
                                            </td>
                                            <td className="py-2.5 text-slate-400">
                                                {trip.driverId?.name || 'Unassigned'}
                                            </td>
                                            <td className="py-2.5 text-slate-400 max-w-[140px] truncate">
                                                {trip.origin} → {trip.destination}
                                            </td>
                                            <td className="py-2.5 text-slate-400">{trip.cargoWeight} kg</td>
                                            <td className="py-2.5"><StatusBadge status={trip.status} /></td>
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
                    className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-5"
                >
                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" /> Recent Activity
                    </h3>
                    <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
                        {activity.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center pt-8">No recent activity.</p>
                        ) : activity.map((event, i) => {
                            const Icon = EVENT_ICON[event.type] || Activity;
                            const colorClass = COLOR_MAP[event.color] || COLOR_MAP.slate;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className={`mt-0.5 p-1.5 rounded-lg border ${colorClass} flex-shrink-0`}>
                                        <Icon className="w-3 h-3" />
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
                className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-5"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white">Weekly Trip Activity</h3>
                    <span className="text-xs text-slate-500">Based on recent trips</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={weeklyData} barSize={28}>
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                        <Bar dataKey="trips" radius={[6, 6, 0, 0]}>
                            {weeklyData.map((entry, index) => (
                                <Cell key={index}
                                    fill={entry.trips > 0 ? 'url(#bar-gradient)' : '#1e293b'}
                                />
                            ))}
                        </Bar>
                        <defs>
                            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
};

export default Dashboard;
