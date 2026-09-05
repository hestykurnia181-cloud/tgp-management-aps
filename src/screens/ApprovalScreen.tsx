import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Package,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const ApprovalScreen: React.FC = () => {
  const {
    businesses,
    pendingTransfersForOwner,
    pendingDamagedForOwner,
    approveStockTransfer,
    rejectStockTransfer,
    approveDamagedGoods,
    rejectDamagedGoods,
    currentSession,
  } = useTgp();

  const [activeTab, setActiveTab] = useState<'TRANSFERS' | 'DAMAGED'>('TRANSFERS');

  const totalPending = pendingTransfersForOwner.length + pendingDamagedForOwner.length;

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Otorisasi Keamanan Data
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Pusat Persetujuan (Approval)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Audit dan otorisasi transfer stok & write-off barang rusak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs">
            {totalPending} Menunggu Otorisasi
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Permintaan Transfer Stok"
          value={`${pendingTransfersForOwner.length} Menunggu`}
          icon={<ArrowRightLeft className="w-4 h-4" />}
          color="purple"
          subtitle="Mutasi antar unit bisnis"
        />
        <StatCard
          title="Laporan Kerusakan / Basi"
          value={`${pendingDamagedForOwner.length} Menunggu`}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="rose"
          subtitle="Penyesuaian nilai inventaris"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('TRANSFERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'TRANSFERS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Stok ({pendingTransfersForOwner.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('DAMAGED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'DAMAGED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Barang Rusak ({pendingDamagedForOwner.length})</span>
          </button>
        </div>

        {/* Transfers Tab */}
        {activeTab === 'TRANSFERS' && (
          <div className="space-y-3">
            {pendingTransfersForOwner.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700">Semua Permintaan Telah Selesai</p>
                <p>Tidak ada permohonan transfer stok yang menunggu otorisasi.</p>
              </div>
            ) : (
              pendingTransfersForOwner.map((tx) => (
                <div
                  key={tx.transferId}
                  className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{tx.transferId.slice(0, 8)}</span>
                      <span className="text-[10px] text-slate-500">
                        Diajukan oleh: <strong>{tx.requestedBy}</strong> ({new Date(tx.createdAt).toLocaleDateString('id-ID')})
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {tx.sourceBusinessName} &rarr; {tx.destBusinessName}
                    </p>
                    <p className="text-slate-700">
                      Barang: <strong>{tx.itemName}</strong> sebanyak{' '}
                      <span className="font-bold text-purple-700">{tx.quantity} pcs</span>
                    </p>
                    {tx.notes && <p className="text-slate-500 italic">"{tx.notes}"</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => rejectStockTransfer(tx.transferId, 'Ditolak oleh Owner')}
                      className="px-3.5 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-xl flex items-center gap-1 transition shadow-2xs"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                    <button
                      onClick={() => approveStockTransfer(tx.transferId)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui Transfer</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Damaged Goods Tab */}
        {activeTab === 'DAMAGED' && (
          <div className="space-y-3">
            {pendingDamagedForOwner.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700">Semua Laporan Telah Diaudit</p>
                <p>Tidak ada laporan barang rusak yang menunggu persetujuan write-off.</p>
              </div>
            ) : (
              pendingDamagedForOwner.map((dmg) => {
                const bizName = businesses.find((b) => b.businessId === dmg.businessId)?.name || 'Bisnis';
                return (
                  <div
                    key={dmg.reportId}
                    className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{bizName}</span>
                        <span className="text-[10px] text-slate-500">
                          Dilaporkan oleh: <strong>{dmg.reportedBy}</strong>
                        </span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900">
                        {dmg.itemName} &bull;{' '}
                        <span className="text-rose-700">{dmg.quantity} pcs</span> di {dmg.location}
                      </p>
                      <p className="text-slate-700">
                        Alasan: <strong>{dmg.reason}</strong> &bull; Estimasi Kerugian:{' '}
                        <span className="font-bold text-rose-700">{formatRupiah(dmg.lossValue)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => rejectDamagedGoods(dmg.reportId, 'Ditolak oleh Owner')}
                        className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-xl flex items-center gap-1 transition shadow-2xs"
                      >
                        <X className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                      <button
                        onClick={() => approveDamagedGoods(dmg.reportId)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Setujui Write-off</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
