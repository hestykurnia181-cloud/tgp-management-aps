import React, { useState } from 'react';
import {
  Building2,
  Crown,
  Database,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Store,
  UserCheck,
  Users,
} from 'lucide-react';
import { RoleBadge } from '../components/CommonBadges';
import { AddUserDialog, CreateBusinessDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { UserRole } from '../types';

export const MasterDashboardScreen: React.FC = () => {
  const {
    currentSession,
    platformStats,
    businesses,
    users,
    navigateTo,
    setActiveBusiness,
    resetToFactoryData,
    syncAllWithSupabase,
    supabaseStatus,
  } = useTgp();

  const [isCreateBizOpen, setIsCreateBizOpen] = useState(false);
  const [isAddOwnerOpen, setIsAddOwnerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'BUSINESSES' | 'USERS'>('BUSINESSES');

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.templateType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 text-white border border-indigo-900/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Platform Console
              </span>
              <RoleBadge role={UserRole.MASTER} />
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              Portal Kendali MASTER TGP
            </h2>
            <p className="text-xs text-slate-300">
              Pengawasan multi-tenant, otorisasi akun OWNER, dan arsitektur database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => syncAllWithSupabase()}
            title="Sinkronkan database ke Supabase"
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync Cloud</span>
          </button>
          <button
            onClick={() => setIsAddOwnerOpen(true)}
            data-testid="btn_add_owner_modal"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Akun OWNER</span>
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

      {/* Platform Level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Bisnis Tenant"
          value={platformStats.totalBusinesses}
          icon={<Building2 className="w-4 h-4" />}
          color="blue"
          subtitle="Terisolasi penuh"
        />
        <StatCard
          title="Total Akun Pengguna"
          value={platformStats.totalUsers}
          icon={<Users className="w-4 h-4" />}
          color="purple"
          subtitle="Hierarki RBAC aktif"
        />
        <StatCard
          title="Total Kasir Sales"
          value={platformStats.totalSalesCount}
          icon={<Store className="w-4 h-4" />}
          color="emerald"
          subtitle="Transaksi terpusat"
        />
        <StatCard
          title="Total Audit Log"
          value={platformStats.totalAuditLogs}
          icon={<ShieldAlert className="w-4 h-4" />}
          color="amber"
          subtitle="Jejak keamanan data"
        />
      </div>

      {/* Management Navigation Tabs */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('BUSINESSES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'BUSINESSES'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Daftar Unit Bisnis ({businesses.length})
            </button>
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'USERS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Daftar Akun Pengguna ({users.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari bisnis atau user..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>
        </div>

        {/* Tab Content: Businesses */}
        {activeTab === 'BUSINESSES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBusinesses.map((b) => (
              <div
                key={b.businessId}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 transition bg-slate-50/50 hover:bg-white flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                        {b.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{b.name}</h4>
                        <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                          {b.templateType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {b.activeModules.map((m) => (
                      <span
                        key={m}
                        className="text-[9px] font-semibold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {b.businessId.slice(0, 8)}...</span>
                  <button
                    onClick={() => {
                      setActiveBusiness(b.businessId);
                      navigateTo('BUSINESS_HOME');
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Buka Unit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'USERS' && (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <div
                key={u.userId}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    {u.fullName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{u.fullName}</span>
                      <RoleBadge role={u.role} />
                    </div>
                    <p className="text-slate-400 text-[11px] font-mono">@{u.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">
                    {u.assignedBusinessIds?.length
                      ? `${u.assignedBusinessIds.length} Bisnis Ditugaskan`
                      : u.businessId
                      ? '1 Bisnis Terikat'
                      : 'Akses Platform'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="bg-rose-50/60 rounded-3xl p-5 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-rose-950">Inisialisasi Ulang Data (Factory Reset)</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            Reset database kembali ke kondisi awal akun demo dan benih data standar.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data ke data awal pabrik?')) {
              resetToFactoryData();
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition"
        >
          Reset Data Pabrik
        </button>
      </div>

      <CreateBusinessDialog
        isOpen={isCreateBizOpen}
        onClose={() => setIsCreateBizOpen(false)}
      />
      <AddUserDialog
        isOpen={isAddOwnerOpen}
        onClose={() => setIsAddOwnerOpen(false)}
        targetRole={UserRole.OWNER}
      />
    </div>
  );
};
