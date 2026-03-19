import React from 'react';

const ModernBadge = ({
    children,
    variant = 'default',
    size = 'md',
    icon: Icon,
    className = '',
    ...props
}) => {
    const baseStyles = 'font-semibold rounded-lg flex items-center gap-2 w-fit';

    const variants = {
        default: 'bg-slate-700/50 text-slate-300 border border-slate-700',
        success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10',
        warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10',
        error: 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg shadow-red-500/10',
        info: 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10',
        primary: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10',
        outline: 'bg-transparent border-2 border-indigo-500 text-indigo-300',
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </span>
    );
};

export default ModernBadge;
