import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  LogIn,
  LogOut,
  User,
  UserCheck,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';

export const AttendanceScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeAttendances,
    recordAttendance,
  } = useTgp();
  const [note, setNote] = useState('');

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const myAttendancesToday = activeAttendances.filter((a) => {
    const isToday = new Date(a.timestamp).toDateString() === new Date().toDateString();
    return isToday && a.userId === currentSession?.user.userId;
  });

  const hasClockedIn = myAttendancesToday.some((a) => a.type === 'MASUK');
  const hasClockedOut = myAttendancesToday.some((a) => a.type === 'PULANG');

  const handleClockIn = () => {
    recordAttendance('MASUK', note || 'Masuk shift kerja');
    setNote('');
  };

  const handleClockOut = () => {
    recordAttendance('PULANG', note || 'Selesai shift kerja');
    setNote('');
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Presensi Digital
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              Absensi Karyawan ({activeBusiness?.name})
            </h2>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          {todayStr}
        </span>
      </div>

      {/* Clock In / Clock Out Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status Presensi Hari Ini</p>
          <h3 className="text-xl font-extrabold text-slate-900">{currentSession?.user.fullName}</h3>
          <p className="text-xs text-slate-500">Divisi: {activeBusiness?.name}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Kehadiran (Opsional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Shift pagi stand A / Bertukar shift"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleClockIn}
            disabled={hasClockedIn}
            data-testid="btn_clock_in"
            className="py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 shadow-xs transition"
          >
            <LogIn className="w-4 h-4" />
            <span>{hasClockedIn ? 'Sudah Masuk' : 'Absen Masuk'}</span>
          </button>
          <button
            onClick={handleClockOut}
            disabled={!hasClockedIn || hasClockedOut}
            data-testid="btn_clock_out"
            className="py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 shadow-xs transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{hasClockedOut ? 'Sudah Pulang' : 'Absen Pulang'}</span>
          </button>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
            Catatan Kehadiran Divisi
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {activeAttendances.length} Log
          </span>
        </div>
        <div className="space-y-2">
          {activeAttendances.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Belum ada log presensi tercatat di unit bisnis ini.
            </p>
          ) : (
            activeAttendances.slice(0, 15).map((att) => {
              const isMasuk = att.type === 'MASUK';
              return (
                <div
                  key={att.attendanceId}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {isMasuk ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{att.userName}</p>
                      <p className="text-[11px] text-slate-500">
                        {att.note || (isMasuk ? 'Presensi masuk kerja' : 'Presensi pulang kerja')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isMasuk ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {att.type}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(att.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
