import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ModernStatCard = ({
    title,
    value,
    change,
    changeType = 'up',
    icon: Icon,
    color = 'indigo',
    subtitle,
    children,
}) => {
    const colorMap = {
        indigo: 'from-indigo-500/20 to-purple-500/10 text-indigo-300',
        emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-300',
        red: 'from-red-500/20 to-pink-500/10 text-red-300',
        amber: 'from-amber-500/20 to-orange-500/10 text-amber-300',
        blue: 'from-blue-500/20 to-cyan-500/10 text-blue-300',
        purple: 'from-purple-500/20 to-pink-500/10 text-purple-300',
    };

    const TrendIcon = changeType === 'up' ? TrendingUp : TrendingDown;
    const trendColor = changeType === 'up' ? 'text-emerald-400' : 'text-red-400';

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl border border-white/10 p-6 backdrop-blur-sm`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {Icon && (
                    <div className="p-3 bg-white/5 rounded-lg">
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>

            {change && (
                <div className="flex items-center gap-2 text-sm">
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className={trendColor}>{Math.abs(change)}%</span>
                    <span className="text-slate-500">vs last period</span>
                </div>
            )}

            {children && <div className="mt-4 pt-4 border-t border-white/10">{children}</div>}
        </div>
    );
};

export default ModernStatCard;
