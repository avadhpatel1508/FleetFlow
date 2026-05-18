import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, Settings } from 'lucide-react';

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
        <div className="flex bg-[var(--bg-dark)] min-h-[100dvh]">
            <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
            <main className="flex-1 flex flex-col w-full h-[100dvh] overflow-hidden relative">
                {/* Cyber Scanner overlay for subtle atmospheric texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(153,247,255,0.2)_1px,transparent_1px)] bg-[length:100%_4px] z-0"></div>
                
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between px-4 py-4 bg-[var(--bg-panel)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-[var(--bg-dark)] sticky top-0 z-30 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[var(--bg-dark)] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,241,254,0.3)] border border-[var(--primary)]">
                            <span className="font-bold text-[var(--primary)] text-sm font-mono">FF</span>
                        </div>
                        <h2 className="text-lg font-bold tracking-widest text-[var(--text-light)] uppercase font-mono">FleetFlow</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-hover)] rounded transition-colors duration-200">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-hover)] rounded transition-colors duration-200"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--bg-dark)] relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
