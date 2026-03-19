import React from 'react';
import { motion } from 'framer-motion';

const ModernCard = ({
    children,
    title,
    subtitle,
    icon: Icon,
    className = '',
    hover = true,
    delay = 0,
    actionButton,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl border border-white/10 p-6 ${
                hover ? 'hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer' : ''
            } ${className}`}
            {...props}
        >
            {(title || subtitle) && (
                <div className="flex items-start justify-between mb-4">
                    <div>
                        {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
                    </div>
                    {Icon && (
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-3">
                {children}
                {actionButton && (
                    <div className="pt-4 border-t border-white/10">
                        {actionButton}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ModernCard;
