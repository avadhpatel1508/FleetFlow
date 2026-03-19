import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, Settings } from 'lucide-react';

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
        <div className="flex bg-gradient-to-br from-[var(--bg-dark)] to-[var(--bg-secondary)] min-h-[100dvh]">
            <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
            <main className="flex-1 flex flex-col w-full h-[100dvh] overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between px-4 py-4 bg-[var(--bg-panel)]/80 glass backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="font-bold text-white text-sm">FF</span>
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight text-white">FleetFlow</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[var(--bg-dark)] via-[var(--bg-secondary)] to-[var(--bg-dark)]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
