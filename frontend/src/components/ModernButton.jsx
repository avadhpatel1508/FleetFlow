import React from 'react';

const ModernButton = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    Icon,
    isLoading,
    ...props
}) => {
    const baseStyles = 'font-semibold transition-all duration-200 rounded-lg flex items-center gap-2 justify-center';

    const variants = {
        primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95',
        secondary: 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95',
        outline: 'bg-transparent border-2 border-indigo-500 text-indigo-300 hover:bg-indigo-500/10 active:scale-95',
        danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 active:scale-95',
        ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 active:scale-95',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {children}
                </>
            ) : (
                <>
                    {Icon && <Icon className="w-4 h-4" />}
                    {children}
                </>
            )}
        </button>
    );
};

export default ModernButton;
