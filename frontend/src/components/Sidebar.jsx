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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-[#1e293b] border-r border-slate-800 h-[100dvh] flex flex-col pt-6 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="px-4 mb-8 flex items-center justify-between">
                    <img src="/logo.svg" alt="FleetFlow" className="h-9 w-auto" />
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 truncate max-w-[100px]">{user?.role}</span>
                    </div>
                    <button
                        className="md:hidden text-slate-400 hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                        ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="flex-1">{item.name}</span>
                                {item.badge > 0 && (
                                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 mt-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
