import React, { useState } from 'react';
import {
  BadgeCheck,
  Building2,
  Calendar,
  ChevronRight,
  Coins,
  FileSpreadsheet,
  Package,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { RoleBadge } from '../components/CommonBadges';
import { AddUserDialog, CreateBusinessDialog, EditBusinessDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { BusinessEntity, BusinessModule, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const OwnerDashboardScreen: React.FC = () => {
  const {
    currentSession,
    authorizedBusinesses,
    activeBusinessId,
    setActiveBusiness,
    navigateTo,
    ownerFinanceSummary,
    pendingTransfersForOwner,
    pendingDamagedForOwner,
  } = useTgp();

  const [isCreateBizOpen, setIsCreateBizOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<BusinessEntity | null>(null);

  const totalPending = pendingTransfersForOwner.length + pendingDamagedForOwner.length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white border border-blue-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Holding Console
              </span>
              <RoleBadge role={UserRole.OWNER} />
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              Konsol Manajemen Bisnis (OWNER)
            </h2>
            <p className="text-xs text-slate-300">
              Pantau seluruh cabang, neraca gabungan, dan persetujuan transfer/kerusakan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddAdminOpen(true)}
            data-testid="btn_add_admin_owner_modal"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>+ Admin Owner</span>
          </button>
          <button
            onClick={() => setIsCreateBizOpen(true)}
            data-testid="btn_create_business_modal"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Unit Bisnis</span>
          </button>
        </div>
      </div>

      {/* Approval Alert if Pending Items Exist */}
      {totalPending > 0 && (
        <div
          onClick={() => navigateTo('APPROVAL_MODULE')}
          className="p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-between cursor-pointer hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <BadgeCheck className="w-5 h-5" />
            <div>
              <span className="text-sm">
                Ada {totalPending} Permintaan Menunggu Persetujuan Anda!
              </span>
              <p className="text-xs text-slate-900/80 font-medium">
                {pendingTransfersForOwner.length} Transfer Stok &bull; {pendingDamagedForOwner.length} Laporan Rusak
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs uppercase tracking-wider bg-slate-950 text-white px-3 py-1.5 rounded-xl font-extrabold">
            <span>Buka Approval</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* High Level Consolidated Financial Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Pemasukan Gabungan"
          value={formatRupiah(ownerFinanceSummary.totalIncome)}
          icon={<TrendingUp className="w-4 h-4" />}
          color="emerald"
          subtitle="Seluruh unit usaha"
        />
        <StatCard
          title="Pengeluaran Gabungan"
          value={formatRupiah(ownerFinanceSummary.totalExpense)}
          icon={<TrendingDown className="w-4 h-4" />}
          color="rose"
          subtitle="Bahan baku & operasional"
        />
        <StatCard
          title="Laba Bersih Konsolidasian"
          value={formatRupiah(ownerFinanceSummary.netBalance)}
          icon={<Coins className="w-4 h-4" />}
          color={ownerFinanceSummary.netBalance >= 0 ? 'blue' : 'rose'}
          subtitle="Surplus / Defisit"
        />
        <StatCard
          title="Unit Bisnis Terdaftar"
          value={`${authorizedBusinesses.length} Unit`}
          icon={<Store className="w-4 h-4" />}
          color="purple"
          subtitle="Data & stok terisolasi"
        />
      </div>

      {/* Authorized Businesses List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Unit Usaha Anda</h3>
            <p className="text-xs text-slate-500">
              Pilih salah satu unit untuk masuk ke lingkungan operasional & kasir
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {authorizedBusinesses.length} Bisnis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {authorizedBusinesses.map((biz) => {
            const isCurrent = biz.businessId === activeBusinessId;
            return (
              <div
                key={biz.businessId}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                        {biz.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                          {biz.name}
                        </h4>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          {biz.templateType}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingBiz(biz)}
                      title="Kelola modul bisnis"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {biz.activeModules.map((m) => (
                      <span
                        key={m}
                        className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {biz.activeModules.length} Modul Aktif
                  </span>
                  <button
                    onClick={() => {
                      setActiveBusiness(biz.businessId);
                      navigateTo('BUSINESS_HOME');
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-2xs"
                  >
                    Masuk Operasional &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateBusinessDialog
        isOpen={isCreateBizOpen}
        onClose={() => setIsCreateBizOpen(false)}
      />
      <AddUserDialog
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
        targetRole={UserRole.ADMIN_OWNER}
      />
      {editingBiz && (
        <EditBusinessDialog
          isOpen={true}
          onClose={() => setEditingBiz(null)}
          business={editingBiz}
        />
      )}
    </div>
  );
};
