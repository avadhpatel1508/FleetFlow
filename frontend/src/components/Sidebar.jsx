import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
    LayoutDashboard, Truck, Map, Wrench, Droplet, Users,
    BarChart3, LogOut, Navigation as NavigationIcon, X,
    ShieldAlert, MessageSquare, UserCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
        { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['Fleet Manager', 'Dispatcher'] },
        { name: 'Dispatch', path: '/dispatch', icon: Map, roles: ['Fleet Manager', 'Dispatcher'] },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Fleet Manager'] },
        { name: 'Fuel & Expenses', path: '/fuel', icon: Droplet, roles: ['Fleet Manager', 'Financial Analyst'] },
        { name: 'Drivers', path: '/drivers', icon: Users, roles: ['Fleet Manager', 'Safety Officer'] },
        { name: 'Incidents', path: '/incidents', icon: ShieldAlert, roles: ['Fleet Manager', 'Safety Officer'] },
        { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['Fleet Manager', 'Financial Analyst'] },
        { name: 'My Jobs', path: '/driver-portal', icon: NavigationIcon, roles: ['Driver'] },
        { name: 'Chat', path: '/chat', icon: MessageSquare, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Driver'] }
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in-up"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-[var(--bg-panel)]/95 glass backdrop-blur-md border-r border-white/10 h-[100dvh] flex flex-col pt-6 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Logo Section */}
                <div className="px-4 mb-8 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="font-bold text-white text-sm">FF</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-sm font-bold text-white truncate">FleetFlow</h1>
                            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hidden">
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-2 mb-3 mt-2">Menu</p>
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                            >
                                {({ isActive }) => (
                                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                                        ? 'bg-indigo-500/20 text-indigo-300 font-medium backdrop-blur-sm'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}>
                                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                                        <span className="flex-1 text-sm">{item.name}</span>
                                        {item.badge > 0 && (
                                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">{item.badge}</span>
                                        )}
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-r-full" />
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-3 border-t border-white/10 mt-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 group text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                        <p className="text-xs text-slate-400">
                            👋 Welcome back, <span className="font-semibold text-slate-200">{user?.name?.split(' ')[0] || 'User'}</span>
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
