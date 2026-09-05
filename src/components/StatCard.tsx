import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string | null;
  icon: React.ReactNode;
  accentBg: string;
  accentColor: string;
  onClick?: () => void;
  className?: string;
  testTag?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentBg,
  accentColor,
  onClick,
  className = '',
  testTag = '',
}) => {
  return (
    <div
      onClick={onClick}
      data-testid={testTag}
      className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
      } ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${accentBg}`}
      >
        <div className={accentColor}>{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
        <p className="text-lg font-extrabold text-slate-900 tracking-tight truncate mt-0.5">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
