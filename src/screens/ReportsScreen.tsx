import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Download,
  FileSpreadsheet,
  Package,
  Printer,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const ReportsScreen: React.FC = () => {
  const {
    activeBusiness,
    activeSales,
    activeLedgers,
    activeBusinessFinance,
    canAccessFinance,
  } = useTgp();

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'THIS_MONTH'>('ALL');

  if (!canAccessFinance) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-rose-600 font-bold">
          Akses Terbatas: Laporan finansial hanya dapat diakses oleh akun yang berwenang.
        </p>
      </div>
    );
  }

  const now = new Date();
  const filteredSales = activeSales.filter((s) => {
    const d = new Date(s.timestamp);
    if (dateFilter === 'TODAY') {
      return d.toDateString() === now.toDateString();
    }
    if (dateFilter === 'THIS_MONTH') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalSalesRevenue = filteredSales.reduce((a, s) => a + s.totalAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Laporan & Analitik Bisnis
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Rekap Penjualan & Keuangan ({activeBusiness?.name})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ikhtisar pendapatan kasir POS, buku besar kas, dan performa transaksi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-slate-500">Periode Data:</span>
        <button
          onClick={() => setDateFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            dateFilter === 'ALL'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Waktu
        </button>
        <button
          onClick={() => setDateFilter('TODAY')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            dateFilter === 'TODAY'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Hari Ini
        </button>
        <button
          onClick={() => setDateFilter('THIS_MONTH')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            dateFilter === 'THIS_MONTH'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Bulan Ini
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Total Penjualan POS Kasir"
          value={formatRupiah(totalSalesRevenue)}
          icon={<Receipt className="w-4 h-4" />}
          color="teal"
          subtitle={`${filteredSales.length} struk transaksi`}
        />
        <StatCard
          title="Pemasukan Kas Tercatat"
          value={formatRupiah(activeBusinessFinance.totalIncome)}
          icon={<TrendingUp className="w-4 h-4" />}
          color="emerald"
          subtitle="Kredit buku kas"
        />
        <StatCard
          title="Saldo Bersih Unit"
          value={formatRupiah(activeBusinessFinance.netBalance)}
          icon={<DollarSign className="w-4 h-4" />}
          color={activeBusinessFinance.netBalance >= 0 ? 'blue' : 'rose'}
          subtitle="Surplus kas berjalan"
        />
      </div>

      {/* Sales Orders List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">Rincian Transaksi Struk POS Kasir</h3>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredSales.length} Struk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">No. Struk / Waktu</th>
                <th className="py-2.5 px-3">Kasir & Pelanggan</th>
                <th className="py-2.5 px-3">Rincian Barang</th>
                <th className="py-2.5 px-3">Metode</th>
                <th className="py-2.5 px-3 text-right">Total Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Tidak ada penjualan pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.saleId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900">{s.receiptNumber}</div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(s.timestamp).toLocaleDateString('id-ID')},{' '}
                        {new Date(s.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{s.cashierName}</div>
                      <span className="text-[10px] text-slate-500">{s.customerName}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {s.itemsSummary}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                        {s.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                      {formatRupiah(s.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
