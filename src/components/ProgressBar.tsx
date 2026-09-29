import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  showPercent?: boolean;
  color?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose';
  height?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  color = 'cyan',
  height = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const colorStyles = {
    cyan: 'bg-cyan-500 shadow-cyan-500/20',
    emerald: 'bg-emerald-500 shadow-emerald-500/20',
    amber: 'bg-amber-500 shadow-amber-500/20',
    purple: 'bg-purple-500 shadow-purple-500/20',
    rose: 'bg-rose-500 shadow-rose-500/20',
  }[color];

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[height];

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          {label && <span className="font-medium text-slate-300">{label}</span>}
          {showPercent && <span className="font-mono font-medium">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-800 ${heightStyles}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
