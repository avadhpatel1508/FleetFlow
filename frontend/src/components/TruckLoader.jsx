import React from 'react';

const TruckLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 select-none">
            {/* Truck SVG Animation */}
            <div className="relative w-32 h-16">
                <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Road dashes */}
                    <style>{`
                        @keyframes dash {
                            0%   { transform: translateX(0); }
                            100% { transform: translateX(-30px); }
                        }
                        @keyframes truckBounce {
                            0%, 100% { transform: translateY(0px); }
                            50%       { transform: translateY(-2px); }
                        }
                        @keyframes wheelSpin {
                            0%   { transform-origin: center; transform: rotate(0deg); }
                            100% { transform-origin: center; transform: rotate(360deg); }
                        }
                        .road-dash { animation: dash 0.5s linear infinite; }
                        .truck-body { animation: truckBounce 0.5s ease-in-out infinite; }
                        .wheel { animation: wheelSpin 0.5s linear infinite; }
                    `}</style>

                    {/* Road */}
                    <rect x="0" y="50" width="120" height="4" rx="2" fill="#334155" />

                    {/* Animated dashes */}
                    <g className="road-dash">
                        <rect x="5" y="53" width="14" height="2" rx="1" fill="#64748b" />
                        <rect x="35" y="53" width="14" height="2" rx="1" fill="#64748b" />
                        <rect x="65" y="53" width="14" height="2" rx="1" fill="#64748b" />
                        <rect x="95" y="53" width="14" height="2" rx="1" fill="#64748b" />
                    </g>

                    {/* Truck group with bounce */}
                    <g className="truck-body">
                        {/* Cargo container */}
                        <rect x="10" y="20" width="60" height="28" rx="3" fill="#4f46e5" />
                        {/* Door split line */}
                        <line x1="40" y1="20" x2="40" y2="48" stroke="#6366f1" strokeWidth="1" />
                        {/* Cab */}
                        <rect x="70" y="28" width="32" height="20" rx="4" fill="#6366f1" />
                        {/* Windscreen */}
                        <rect x="78" y="31" width="18" height="12" rx="2" fill="#bfdbfe" opacity="0.9" />
                        {/* Headlight */}
                        <circle cx="100" cy="44" r="2.5" fill="#fde68a" />
                        {/* Exhaust pipe */}
                        <rect x="72" y="18" width="3" height="10" rx="1.5" fill="#475569" />
                        {/* Smoke puff */}
                        <circle cx="73" cy="14" r="3" fill="#94a3b8" opacity="0.5" />
                        <circle cx="76" cy="11" r="2" fill="#94a3b8" opacity="0.3" />
                        {/* Rear wheel */}
                        <circle cx="30" cy="50" r="7" fill="#1e293b" stroke="#818cf8" strokeWidth="2.5" className="wheel" />
                        <circle cx="30" cy="50" r="3" fill="#818cf8" />
                        {/* Front wheel */}
                        <circle cx="82" cy="50" r="7" fill="#1e293b" stroke="#818cf8" strokeWidth="2.5" className="wheel" />
                        <circle cx="82" cy="50" r="3" fill="#818cf8" />
                    </g>
                </svg>
            </div>

            {/* Loading text */}
            <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">{message}</p>
        </div>
    );
};

export default TruckLoader;
