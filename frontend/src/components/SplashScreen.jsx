import React, { useState, useEffect } from 'react';
import TruckLoader from './TruckLoader';

const SplashScreen = ({ onDone }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDone, 400); // wait for fade-out before unmounting
        }, 2000);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 transition-opacity duration-400"
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                opacity: visible ? 1 : 0,
            }}
        >
            {/* Logo */}
            <img src="/logo.svg" alt="FleetFlow" className="h-16 w-auto" />

            {/* Truck Loader animation */}
            <TruckLoader message="Getting your fleet ready..." />

            {/* Progress bar */}
            <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    style={{ animation: 'splashProgress 2s ease-in-out forwards' }}
                />
            </div>

            <style>{`
                @keyframes splashProgress {
                    0%   { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
