import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const ModernModal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'w-full sm:w-96',
        md: 'w-full sm:w-[500px]',
        lg: 'w-full sm:w-[700px]',
        xl: 'w-full sm:w-[900px]',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative ${sizeClasses[size]} bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-hover)] rounded-2xl border border-white/10 shadow-2xl shadow-black/50`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center gap-3 justify-end px-6 py-4 border-t border-white/10">
                        {footer}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ModernModal;
