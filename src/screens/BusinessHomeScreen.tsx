import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeCheck,
  Building2,
  CalendarCheck,
  ChevronRight,
  Coins,
  FileSpreadsheet,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { RoleBadge } from '../components/CommonBadges';
import { AddUserDialog, SwitchBusinessDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { BusinessModule, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const BusinessHomeScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeItems,
    activeSales,
    activeLedgers,
    activeOutlets,
    activeTransfers,
    activeDamagedGoods,
    navigateTo,
    hasModule,
    isOwnerOrAdmin,
    canAccessFinance,
  } = useTgp();

  const [isSwitchBizOpen, setIsSwitchBizOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  if (!activeBusiness) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Silakan pilih unit usaha terlebih dahulu.</p>
        <button
          onClick={() => setIsSwitchBizOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs"
        >
          Pilih Bisnis
        </button>
        <SwitchBusinessDialog isOpen={isSwitchBizOpen} onClose={() => setIsSwitchBizOpen(false)} />
      </div>
    );
  }

  const todayStr = new Date().toDateString();
  const salesToday = activeSales.filter(
    (s) => new Date(s.timestamp).toDateString() === todayStr
  );
  const todayRevenue = salesToday.reduce((acc, s) => acc + s.totalAmount, 0);

  const lowStockItems = activeItems.filter(
    (i) => i.type !== 'SERVICE' && i.stockQuantity <= 5
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/20 shrink-0">
            {activeBusiness.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Unit Operasional
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {activeBusiness.templateType}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 truncate mt-0.5">
              {activeBusiness.name}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Data & kasir terisolasi mandiri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSwitchBizOpen(true)}
            data-testid="btn_home_switch_biz"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Ganti Unit</span>
          </button>
          {isOwnerOrAdmin && (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              data-testid="btn_add_staff_modal"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Petugas</span>
            </button>
          )}
        </div>
      </div>

      {/* Operational Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {canAccessFinance ? (
          <StatCard
            title="Omset Kasir Hari Ini"
            value={formatRupiah(todayRevenue)}
            icon={<Coins className="w-4 h-4" />}
            color="emerald"
            subtitle={`${salesToday.length} transaksi POS`}
          />
        ) : (
          <StatCard
            title="Transaksi Kasir Hari Ini"
            value={`${salesToday.length} Struk`}
            icon={<ShoppingCart className="w-4 h-4" />}
            color="blue"
            subtitle="Penjualan hari ini"
          />
        )}
        <StatCard
          title="Stok Item Terdaftar"
          value={`${activeItems.length} Item`}
          icon={<Package className="w-4 h-4" />}
          color="blue"
          subtitle={lowStockItems.length > 0 ? `${lowStockItems.length} stok menipis` : 'Stok stabil'}
        />
        {hasModule(BusinessModule.STAN_OUTLET) && (
          <StatCard
            title="Stan / Cabang"
            value={`${activeOutlets.length} Stand`}
            icon={<Store className="w-4 h-4" />}
            color="amber"
            subtitle="Outlet terhubung"
          />
        )}
        <StatCard
          title="Transfer Stok Aktif"
          value={`${activeTransfers.length} Transaksi`}
          icon={<ArrowRightLeft className="w-4 h-4" />}
          color="purple"
          subtitle="Gudang & Stand"
        />
      </div>

      {/* Low Stock Notification */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Perhatian Stok:</strong> Ada {lowStockItems.length} item dengan sisa stok &le; 5 unit (segera lakukan restock).
            </span>
          </div>
          <button
            onClick={() => navigateTo('INVENTORY_MODULE')}
            className="font-bold underline hover:text-amber-950 shrink-0"
          >
            Lihat Stok
          </button>
        </div>
      )}

      {/* Module Shortcuts Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Modul Operasional Aktif ({activeBusiness.name})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {hasModule(BusinessModule.POS) && (
            <button
              onClick={() => navigateTo('POS_MODULE')}
              data-testid="shortcut_pos"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Kasir (POS)</p>
                <p className="text-[10px] text-slate-400">Jual barang & cetak struk</p>
              </div>
            </button>
          )}

          {hasModule(BusinessModule.INVENTORY) && (
            <button
              onClick={() => navigateTo('INVENTORY_MODULE')}
              data-testid="shortcut_inventory"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Gudang & Stok</p>
                <p className="text-[10px] text-slate-400">Bahan baku, BOM, & barang</p>
              </div>
            </button>
          )}

          {hasModule(BusinessModule.STAN_OUTLET) && (
            <button
              onClick={() => navigateTo('STAN_OUTLET_MODULE')}
              data-testid="shortcut_stan"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Stan & Cabang</p>
                <p className="text-[10px] text-slate-400">Stok stand & distribusi</p>
              </div>
            </button>
          )}

          {hasModule(BusinessModule.TRANSFER) && (
            <button
              onClick={() => navigateTo('TRANSFER_MODULE')}
              data-testid="shortcut_transfer"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Transfer Stok</p>
                <p className="text-[10px] text-slate-400">Mutasi antar divisi/stand</p>
              </div>
            </button>
          )}

          {hasModule(BusinessModule.DAMAGED_GOODS) && (
            <button
              onClick={() => navigateTo('DAMAGED_GOODS_MODULE')}
              data-testid="shortcut_damaged"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Barang Rusak / Basi</p>
                <p className="text-[10px] text-slate-400">Laporan afkir & write-off</p>
              </div>
            </button>
          )}

          {hasModule(BusinessModule.FINANCE) && canAccessFinance && (
            <button
              onClick={() => navigateTo('FINANCE_MODULE')}
              data-testid="shortcut_finance"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Buku Kas & Jurnal</p>
                <p className="text-[10px] text-slate-400">Pemasukan & pengeluaran</p>
              </div>
            </button>
          )}

          {hasModule(BusinessModule.ATTENDANCE) && (
            <button
              onClick={() => navigateTo('ATTENDANCE_MODULE')}
              data-testid="shortcut_attendance"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Presensi Karyawan</p>
                <p className="text-[10px] text-slate-400">Absen masuk & pulang</p>
              </div>
            </button>
          )}

          {hasModule(BusinessModule.REPORTS) && canAccessFinance && (
            <button
              onClick={() => navigateTo('REPORTS_MODULE')}
              data-testid="shortcut_reports"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Laporan & Audit</p>
                <p className="text-[10px] text-slate-400">Rekap penjualan & laba rugi</p>
              </div>
            </button>
          )}

          {isOwnerOrAdmin && (
            <button
              onClick={() => navigateTo('APPROVAL_MODULE')}
              data-testid="shortcut_approval"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition text-left flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Persetujuan (Approval)</p>
                <p className="text-[10px] text-slate-400">Otorisasi transfer & kerusakan</p>
              </div>
            </button>
          )}
        </div>
      </div>

      <SwitchBusinessDialog
        isOpen={isSwitchBizOpen}
        onClose={() => setIsSwitchBizOpen(false)}
      />
      <AddUserDialog
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        businessId={activeBusiness.businessId}
      />
    </div>
  );
};
