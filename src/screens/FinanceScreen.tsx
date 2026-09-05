import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Coins,
  FileSpreadsheet,
  Filter,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { AddLedgerDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { LedgerType } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const FinanceScreen: React.FC = () => {
  const {
    activeBusiness,
    activeLedgers,
    activeBusinessFinance,
    canAccessFinance,
  } = useTgp();

  const [filterType, setFilterType] = useState<'ALL' | LedgerType>('ALL');
  const [isAddLedgerOpen, setIsAddLedgerOpen] = useState(false);

  if (!canAccessFinance) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-rose-600 font-bold">
          Akses Terbatas: Anda tidak memiliki hak akses finansial pada unit bisnis ini.
        </p>
      </div>
    );
  }

  const filteredLedgers = activeLedgers.filter((l) => {
    return filterType === 'ALL' || l.type === filterType;
  });

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Buku Kas & Akuntansi Terisolasi
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Keuangan & Jurnal Kas ({activeBusiness?.name})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Buku kas mandiri, pencatatan otomatis dari POS Kasir & biaya operasional
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddLedgerOpen(true)}
          data-testid="btn_open_add_ledger"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Transaksi Kas Manual</span>
        </button>
      </div>

      {/* Financial Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Total Pemasukan (Kredit)"
          value={formatRupiah(activeBusinessFinance.totalIncome)}
          icon={<TrendingUp className="w-4 h-4" />}
          color="emerald"
          subtitle="Penjualan kasir & pendapatan lain"
        />
        <StatCard
          title="Total Pengeluaran (Debit)"
          value={formatRupiah(activeBusinessFinance.totalExpense)}
          icon={<TrendingDown className="w-4 h-4" />}
          color="rose"
          subtitle="Bahan baku, operasional, & beban"
        />
        <StatCard
          title="Saldo Kas Bersih"
          value={formatRupiah(activeBusinessFinance.netBalance)}
          icon={<Wallet className="w-4 h-4" />}
          color={activeBusinessFinance.netBalance >= 0 ? 'blue' : 'rose'}
          subtitle="Surplus kas aktif"
        />
      </div>

      {/* Ledger Entries Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Jurnal Mutasi Kas</h3>
            <p className="text-xs text-slate-500">Seluruh alur uang masuk dan keluar secara kronologis</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({activeLedgers.length})
            </button>
            <button
              onClick={() => setFilterType(LedgerType.PEMASUKAN)}
              className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 ${
                filterType === LedgerType.PEMASUKAN
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Pemasukan</span>
            </button>
            <button
              onClick={() => setFilterType(LedgerType.PENGELUARAN)}
              className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 ${
                filterType === LedgerType.PENGELUARAN
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Kategori & Keterangan</th>
                <th className="py-2.5 px-3">Petugas</th>
                <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                    Belum ada transaksi kas yang dicatat.
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((l) => {
                  const isIncome = l.type === LedgerType.PEMASUKAN;
                  return (
                    <tr key={l.ledgerId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {new Date(l.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(l.date).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {l.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600 block mt-0.5 font-normal">
                          {l.description}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {l.createdBy}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-sm">
                        <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                          {isIncome ? '+' : '-'} {formatRupiah(l.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddLedgerDialog
        isOpen={isAddLedgerOpen}
        onClose={() => setIsAddLedgerOpen(false)}
      />
    </div>
  );
};
