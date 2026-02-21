import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Truck, SearchCheck, Clock, Package, Map } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-6 flex items-start justify-between"
    >
        <div>
            <p className="text-slate-400 font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
    </motion.div>
);

const Dashboard = () => {
    const socket = useSocket();
    const { user } = useAuth();

    // Redirect drivers away from the analytics dashboard to their portal
    if (user?.role === 'Driver') {
        return <Navigate to="/driver-portal" replace />;
    }

    const { data: kpis, isLoading, error, refetch } = useQuery({
        queryKey: ['kpis'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/kpi');
            return data;
        },
    });

    useEffect(() => {
        if (!socket) return;

        // Listen for realtime updates from backend
        socket.on('vehicleUpdated', () => refetch());
        socket.on('tripCreated', () => refetch());
        socket.on('tripUpdated', () => refetch());
        socket.on('vehicleCreated', () => refetch());

        return () => {
            socket.off('vehicleUpdated');
            socket.off('tripCreated');
            socket.off('tripUpdated');
            socket.off('vehicleCreated');
        };
    }, [socket, refetch]);

    if (isLoading) return <div className="text-slate-400">Loading Command Center...</div>;
    if (error) return <div className="text-red-400">Error loading KPIs</div>;

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
                <p className="text-slate-400 mt-1">Real-time overview of your fleet logistics</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Active Fleet"
                    value={`${kpis.activeFleet} / ${kpis.totalVehicles}`}
                    icon={Truck}
                    color="bg-emerald-500/10 text-emerald-400"
                    delay={0}
                />
                <DashboardCard
                    title="Maintenance Alerts"
                    value={kpis.maintenanceAlerts}
                    icon={SearchCheck}
                    color="bg-rose-500/10 text-rose-400"
                    delay={0.1}
                />
                <DashboardCard
                    title="Utilization Rate"
                    value={`${kpis.utilizationRate}%`}
                    icon={Clock}
                    color="bg-indigo-500/10 text-indigo-400"
                    delay={0.2}
                />
                <DashboardCard
                    title="Pending Cargo"
                    value={`${kpis.pendingCargo} kg`}
                    icon={Package}
                    color="bg-amber-500/10 text-amber-400"
                    delay={0.3}
                />
            </div>

            {/* Placeholder for more widgets */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-6 h-96">
                    <h3 className="text-lg font-semibold text-white mb-4">Live Dispatch Feed</h3>
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Map className="w-12 h-12 mb-3 opacity-20" />
                        <p>Map Integration Coming Soon</p>
                    </div>
                </div>
                <div className="bg-[var(--bg-panel)] rounded-xl border border-slate-800 p-6 h-96">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
                    <div className="space-y-4">
                        {/* Feed items */}
                        <div className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <p className="text-slate-300">System initialized successfully.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
