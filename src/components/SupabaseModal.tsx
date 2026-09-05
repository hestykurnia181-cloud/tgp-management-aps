import React, { useState } from 'react';
import {
  Check,
  Copy,
  Database,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useTgp } from '../context/TgpContext';
import { SUPABASE_SCHEMA_SQL } from '../lib/supabaseSchema';
import { isSupabaseConfigured, supabaseUrl } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { supabaseStatus, supabaseStatusMessage, syncAllWithSupabase, isSupabaseActive } = useTgp();
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllWithSupabase();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Integrasi Supabase & Realtime Transaksi
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sinkronisasi database live multi-pengguna & multi-cabang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 transition ${
              isSupabaseActive
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : supabaseStatus === 'CONNECTING'
                ? 'bg-blue-50 border-blue-200 text-blue-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSupabaseActive ? (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
              ) : supabaseStatus === 'CONNECTING' ? (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <WifiOff className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border shadow-2xs">
                  {isSupabaseActive
                    ? 'REALTIME TERHUBUNG'
                    : supabaseStatus === 'CONNECTING'
                    ? 'MENGHUBUNGKAN'
                    : 'MODE LOKAL OFFLINE'}
                </span>
                {isSupabaseConfigured && supabaseUrl && (
                  <span className="text-xs text-slate-500 truncate font-mono">
                    {new URL(supabaseUrl).hostname}
                  </span>
                )}
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                {supabaseStatusMessage}
              </p>
            </div>

            {isSupabaseActive && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shrink-0 flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sinkron...' : 'Sync'}</span>
              </button>
            )}
          </div>

          {/* Real-time sync coverage information */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Cakupan Transaksi Real-time TGP</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { name: 'Kasir POS & Struk', table: 'sales', desc: 'Penjualan kasir live' },
                { name: 'Buku Kas & Jurnal', table: 'ledgers', desc: 'Pemasukan & pengeluaran' },
                { name: 'Gudang & Stok', table: 'items', desc: 'Bahan baku & barang jadi' },
                { name: 'Transfer Stok', table: 'transfers', desc: 'Permintaan & persetujuan' },
                { name: 'Barang Rusak', table: 'damaged_goods', desc: 'Laporan afkir & kadaluarsa' },
                { name: 'Stand & Cabang', table: 'outlets & outlet_stocks', desc: 'Stok stand terdistribusi' },
                { name: 'Mutasi Stok', table: 'stock_mutations', desc: 'Log pergerakan barang' },
                { name: 'Presensi Karyawan', table: 'attendances', desc: 'Absensi masuk & pulang' },
                { name: 'Keamanan & Audit', table: 'audit_logs', desc: 'Jejak aktivitas pengguna' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">{item.table}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Setup SQL Script for User's Supabase Project */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-slate-900">Skrip SQL Supabase (DDL & Realtime)</h4>
                <p className="text-xs text-slate-500">
                  Jalankan skrip ini satu kali di <b>Supabase Dashboard &gt; SQL Editor</b> Anda untuk membuat semua tabel & mengaktifkan Realtime.
                </p>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 text-slate-200 p-3 rounded-2xl font-mono text-[11px] max-h-48 overflow-y-auto border border-slate-800">
              <pre className="whitespace-pre-wrap">{SUPABASE_SCHEMA_SQL}</pre>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Environment Variables: <code className="text-slate-800 font-semibold">VITE_SUPABASE_URL</code> dan <code className="text-slate-800 font-semibold">VITE_SUPABASE_ANON_KEY</code></span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                Buka Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
