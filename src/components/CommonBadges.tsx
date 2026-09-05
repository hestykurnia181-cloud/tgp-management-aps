import React from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Clock,
  Coins,
  FileSpreadsheet,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
} from 'lucide-react';
import { BusinessModule, BusinessModuleInfo, UserRole } from '../types';

export const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({ role, className = '' }) => {
  const config = {
    [UserRole.MASTER]: {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
      label: 'MASTER',
    },
    [UserRole.OWNER]: {
      bg: 'bg-purple-100 text-purple-800 border-purple-300',
      dot: 'bg-purple-500',
      label: 'OWNER',
    },
    [UserRole.ADMIN_OWNER]: {
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      dot: 'bg-blue-500',
      label: 'ADMIN OWNER',
    },
    [UserRole.ADMIN_DIVISI]: {
      bg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      dot: 'bg-cyan-500',
      label: 'ADMIN DIVISI',
    },
    [UserRole.MANAGER]: {
      bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      dot: 'bg-indigo-500',
      label: 'MANAGER',
    },
    [UserRole.KASIR]: {
      bg: 'bg-pink-100 text-pink-800 border-pink-300',
      dot: 'bg-pink-500',
      label: 'KASIR',
    },
    [UserRole.WAREHOUSE]: {
      bg: 'bg-orange-100 text-orange-800 border-orange-300',
      dot: 'bg-orange-500',
      label: 'WAREHOUSE',
    },
    [UserRole.STAFF]: {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-500',
      label: 'STAFF',
    },
  }[role] || {
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-500',
    label: role,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-xs ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const norm = status.toUpperCase();
  let bg = 'bg-amber-50 text-amber-800 border-amber-200';
  let dot = 'bg-amber-500';

  if (norm === 'APPROVED' || norm === 'SUCCESS' || norm === 'MASUK') {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dot = 'bg-emerald-500';
  } else if (norm === 'REJECTED' || norm === 'FAILED' || norm === 'PULANG') {
    bg = 'bg-rose-50 text-rose-800 border-rose-200';
    dot = 'bg-rose-500';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {norm}
    </span>
  );
};

export const TransferStatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  return <StatusBadge status={status} className={className} />;
};

export const DamagedStatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  return <StatusBadge status={status} className={className} />;
};

export const ModulePill: React.FC<{ module: BusinessModule; className?: string }> = ({ module, className = '' }) => {
  const info = BusinessModuleInfo[module] || { id: module, title: module, description: '' };
  const iconMap: Record<BusinessModule, React.ReactNode> = {
    [BusinessModule.POS]: <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />,
    [BusinessModule.STAN_OUTLET]: <Store className="w-3.5 h-3.5 text-amber-600" />,
    [BusinessModule.INVENTORY]: <Package className="w-3.5 h-3.5 text-teal-600" />,
    [BusinessModule.TRANSFER]: <Building2 className="w-3.5 h-3.5 text-purple-600" />,
    [BusinessModule.DAMAGED_GOODS]: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
    [BusinessModule.FINANCE]: <Coins className="w-3.5 h-3.5 text-emerald-600" />,
    [BusinessModule.ATTENDANCE]: <CalendarCheck className="w-3.5 h-3.5 text-orange-600" />,
    [BusinessModule.REPORTS]: <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap ${className}`}
    >
      {iconMap[module] || <Package className="w-3.5 h-3.5" />}
      <span>{info.title}</span>
    </span>
  );
};
