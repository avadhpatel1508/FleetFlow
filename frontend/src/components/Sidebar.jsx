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

            <aside className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-[var(--bg-panel)] shadow-[10px_0_30px_rgba(0,0,0,0.5)] border-r border-[var(--bg-dark)] h-[100dvh] flex flex-col pt-6 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Logo Section */}
                <div className="px-4 mb-8 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded bg-[var(--bg-dark)] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,241,254,0.3)] border border-[var(--primary)]">
                            <span className="font-bold text-[var(--primary)] text-sm font-mono">FF</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-sm font-bold tracking-widest text-[var(--text-light)] uppercase font-mono truncate">FleetFlow</h1>
                            <p className="text-xs text-[var(--text-dim)] font-mono uppercase truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        className="md:hidden text-[var(--text-muted)] hover:text-[var(--primary)] p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hidden">
                    <p className="text-xs text-[var(--text-dim)] font-mono uppercase tracking-widest px-2 mb-3 mt-2">Sys_Nav</p>
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                            >
                                {({ isActive }) => (
                                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-300 group relative ${isActive
                                        ? 'bg-[var(--bg-hover)] text-[var(--primary)] font-bold'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-light)] hover:bg-[var(--bg-hover)]'
                                    }`}>
                                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(153,247,255,0.6)]' : 'group-hover:scale-105'}`} />
                                        <span className="flex-1 text-sm font-mono uppercase tracking-wider">{item.name}</span>
                                        {item.badge > 0 && (
                                            <span className="bg-[var(--accent-orange)] text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.5)]">{item.badge}</span>
                                        )}
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] shadow-[0_0_10px_rgba(153,247,255,0.8)]" />
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-3 border-t border-[var(--bg-dark)] mt-auto bg-[var(--bg-panel)]">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-dark)] rounded transition-all duration-300 group text-sm font-mono font-bold uppercase tracking-widest"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,113,108,0)] group-hover:drop-shadow-[0_0_8px_rgba(255,113,108,0.6)]" />
                        <span>Sign_Out</span>
                    </button>
                    <div className="mt-3 p-3 bg-[var(--bg-dark)] rounded border border-[var(--bg-hover)]">
                        <p className="text-xs text-[var(--text-secondary)] font-mono uppercase">
                            USR: <span className="font-bold text-[var(--text-light)]">{user?.name?.split(' ')[0] || 'GUEST'}</span>
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
