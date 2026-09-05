import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Database,
  LogOut,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useTgp } from '../context/TgpContext';
import { UserRole } from '../types';
import { RoleBadge } from './CommonBadges';
import { SupabaseModal } from './SupabaseModal';

interface TgpTopBarProps {
  onOpenSwitchBiz?: () => void;
  title?: string | null;
}

export const TgpTopBar: React.FC<TgpTopBarProps> = ({ onOpenSwitchBiz, title }) => {
  const { currentSession, activeBusiness, activeScreen, navigateTo, logout, supabaseStatus, isSupabaseActive } = useTgp();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const showBackButton =
    activeScreen !== 'BUSINESS_HOME' &&
    activeScreen !== 'OWNER_DASHBOARD' &&
    activeScreen !== 'MASTER_DASHBOARD' &&
    activeScreen !== 'LOGIN' &&
    activeScreen !== 'SETUP_MASTER';

  const handleBack = () => {
    if (!currentSession) {
      navigateTo('LOGIN');
      return;
    }
    if (currentSession.user.role === UserRole.MASTER) {
      navigateTo('MASTER_DASHBOARD');
    } else if (currentSession.user.role === UserRole.OWNER) {
      navigateTo('OWNER_DASHBOARD');
    } else {
      navigateTo('BUSINESS_HOME');
    }
  };

  const handleSwitchBiz = () => {
    if (onOpenSwitchBiz) {
      onOpenSwitchBiz();
    } else if (currentSession?.user.role === UserRole.OWNER) {
      navigateTo('OWNER_DASHBOARD');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left Section: Back, Logo, Title & User */}
          <div className="flex items-center gap-3 min-w-0">
            {showBackButton && (
              <button
                onClick={handleBack}
                data-testid="btn_top_back"
                aria-label="Kembali"
                className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-700 flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-sm shrink-0 border border-blue-400/30">
              TGP
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
                {title || (activeBusiness ? activeBusiness.name : 'TGP Management')}
              </h1>
              {currentSession && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[120px] sm:max-w-[200px]">
                    {currentSession.user.fullName}
                  </span>
                  <RoleBadge role={currentSession.user.role} />
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Supabase Realtime, Business Switcher & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Supabase Realtime Indicator */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              data-testid="btn_supabase_status"
              title={`Supabase Realtime: ${supabaseStatus} - Klik untuk status & skrip SQL`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition shadow-2xs ${
                isSupabaseActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="flex h-2 w-2 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSupabaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isSupabaseActive ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="hidden sm:inline">
                {isSupabaseActive ? 'Realtime' : 'Supabase'}
              </span>
            </button>

            {currentSession && currentSession.user.role !== UserRole.MASTER && (
              <button
                onClick={handleSwitchBiz}
                data-testid="btn_switch_business"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition shadow-2xs ${
                  activeBusiness
                    ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="max-w-[90px] sm:max-w-[130px] truncate">
                  {activeBusiness ? activeBusiness.name : 'Pilih Bisnis'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            )}

            {currentSession && (
              <button
                onClick={logout}
                data-testid="btn_logout"
                title="Keluar (Logout)"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Supabase Schema & Realtime Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </>
  );
};
