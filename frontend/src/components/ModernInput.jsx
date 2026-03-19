import React from 'react';

const ModernInput = React.forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    type = 'text',
    ...props
}, ref) => {
    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-slate-200">{label}</label>}
            <div className="relative">
                {Icon && (
                    <Icon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-[var(--bg-panel)] border border-white/10 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-white/20 ${
                        error ? 'ring-2 ring-red-500 border-red-500' : ''
                    } ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;
