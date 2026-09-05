import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useTgp } from '../context/TgpContext';

export const AuditLogViewerScreen: React.FC = () => {
  const { auditLogs } = useTgp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.role && l.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Sistem Keamanan & Kepatuhan
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Audit Trail & Log Aktivitas
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Catatan permanen jejak perubahan data, otorisasi, dan transaksi sistem TGP
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari aksi, user, entitas..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">Kronologi Aktivitas</h3>
          <span className="text-xs text-slate-400 font-semibold font-mono">
            {filteredLogs.length} Rekam Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Petugas (Actor)</th>
                <th className="py-2.5 px-3">Tindakan (Action)</th>
                <th className="py-2.5 px-3">Entitas</th>
                <th className="py-2.5 px-3">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Tidak ada log audit yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {log.username}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {log.role}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-md truncate">
                      {log.details}
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
