import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { ReportDamagedGoodsDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const DamagedGoodsScreen: React.FC = () => {
  const {
    activeBusiness,
    activeDamagedGoods,
    currentSession,
  } = useTgp();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const pendingItems = activeDamagedGoods.filter((d) => d.status === 'PENDING');
  const approvedItems = activeDamagedGoods.filter((d) => d.status === 'APPROVED');
  const totalLoss = approvedItems.reduce((acc, d) => acc + (d.lossValue || 0), 0);

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Pengawasan Kualitas & Kerugian
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Barang Rusak & Kadaluarsa ({activeBusiness?.name})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pencatatan afkir, kadaluarsa bahan makanan, dan penyesuaian nilai buku kas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          data-testid="btn_open_report_damaged"
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Laporkan Barang Rusak</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Menunggu Persetujuan Owner"
          value={`${pendingItems.length} Laporan`}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
          subtitle="Verifikasi write-off stok"
        />
        <StatCard
          title="Disetujui / Diwrite-off"
          value={`${approvedItems.length} Kasus`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="rose"
          subtitle="Stok telah dipotong dari gudang"
        />
        <StatCard
          title="Total Estimasi Kerugian"
          value={formatRupiah(totalLoss)}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="rose"
          subtitle="Tercatat sebagai beban afkir"
        />
      </div>

      {/* Damaged Goods Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">Riwayat Laporan Barang Rusak</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {activeDamagedGoods.length} Rekod
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Waktu & Lokasi</th>
                <th className="py-2.5 px-3">Item & Jumlah</th>
                <th className="py-2.5 px-3">Penyebab Kerusakan</th>
                <th className="py-2.5 px-3">Pelapor</th>
                <th className="py-2.5 px-3 text-right">Nilai Kerugian</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {activeDamagedGoods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ada laporan barang rusak untuk unit bisnis ini.
                  </td>
                </tr>
              ) : (
                activeDamagedGoods.map((dmg) => (
                  <tr key={dmg.reportId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {new Date(dmg.timestamp).toLocaleDateString('id-ID')}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {dmg.location}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{dmg.itemName}</div>
                      <span className="text-[11px] text-rose-600 font-extrabold">
                        {dmg.quantity} pcs
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {dmg.reason}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {dmg.reportedBy}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-rose-700">
                      {formatRupiah(dmg.lossValue)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          dmg.status === 'APPROVED'
                            ? 'bg-rose-100 text-rose-800'
                            : dmg.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dmg.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReportDamagedGoodsDialog
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
