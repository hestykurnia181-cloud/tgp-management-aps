import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  Send,
  XCircle,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { TransferEntity } from '../types';

export const TransferScreen: React.FC = () => {
  const {
    activeBusiness,
    activeItems,
    activeTransfers,
    businesses,
    requestStockTransfer,
  } = useTgp();

  const [toBizId, setToBizId] = useState(
    businesses.find((b) => b.businessId !== activeBusiness?.businessId)?.businessId || ''
  );
  const [itemId, setItemId] = useState(activeItems[0]?.itemId || '');
  const [quantity, setQuantity] = useState('10');
  const [notes, setNotes] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const transferrableItems = activeItems.filter((i) => i.type !== 'SERVICE');
  const selectedItem = transferrableItems.find((i) => i.itemId === itemId);

  const otherBusinesses = businesses.filter(
    (b) => b.businessId !== activeBusiness?.businessId
  );

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toBizId || !itemId) return;
    const num = parseFloat(quantity);
    if (isNaN(num) || num <= 0) return;

    const ok = requestStockTransfer(toBizId, itemId, num, notes);
    if (ok) {
      setNotes('');
      setIsRequestModalOpen(false);
    }
  };

  const pendingCount = activeTransfers.filter((t) => t.status === 'PENDING').length;
  const approvedCount = activeTransfers.filter((t) => t.status === 'APPROVED').length;

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Mutasi Antar Unit Usaha
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Transfer Stok Barang ({activeBusiness?.name})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Mutasi atomik dengan proteksi persetujuan dua arah oleh OWNER
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          disabled={otherBusinesses.length === 0 || transferrableItems.length === 0}
          data-testid="btn_open_request_transfer"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajukan Transfer Stok</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          title="Menunggu Persetujuan"
          value={`${pendingCount} Transaksi`}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
          subtitle="Proses audit approval"
        />
        <StatCard
          title="Transfer Disetujui"
          value={`${approvedCount} Transaksi`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="emerald"
          subtitle="Stok telah termutasi"
        />
        <StatCard
          title="Total Riwayat Transfer"
          value={`${activeTransfers.length} Rekod`}
          icon={<ArrowRightLeft className="w-4 h-4" />}
          color="purple"
          subtitle="Log pengiriman barang"
        />
      </div>

      {/* Transfer History Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">Riwayat Mutasi Transfer Stok</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {activeTransfers.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Waktu & Kode</th>
                <th className="py-2.5 px-3">Rute Transfer</th>
                <th className="py-2.5 px-3">Barang & Jumlah</th>
                <th className="py-2.5 px-3">Pengaju</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {activeTransfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Belum ada riwayat transfer stok untuk unit bisnis ini.
                  </td>
                </tr>
              ) : (
                activeTransfers.map((tx) => {
                  const isPending = tx.status === 'PENDING';
                  const isApproved = tx.status === 'APPROVED';

                  return (
                    <tr key={tx.transferId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {tx.transferId.slice(0, 8)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 text-xs">
                          {tx.sourceBusinessName} &rarr; {tx.destBusinessName}
                        </div>
                        {tx.notes && (
                          <span className="text-[10px] text-slate-500 italic block truncate max-w-xs">
                            "{tx.notes}"
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">{tx.itemName}</div>
                        <span className="text-[11px] text-purple-700 font-extrabold">
                          {tx.quantity} pcs
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {tx.requestedBy}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status}
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

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Ajukan Transfer Stok</h3>
                <p className="text-xs text-slate-500">Mutasi barang ke unit bisnis cabang lain</p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Bisnis Tujuan</label>
                <select
                  value={toBizId}
                  onChange={(e) => setToBizId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                >
                  {otherBusinesses.map((b) => (
                    <option key={b.businessId} value={b.businessId}>
                      {b.name} ({b.templateType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Barang yang Ditransfer</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                >
                  {transferrableItems.map((item) => (
                    <option key={item.itemId} value={item.itemId}>
                      {item.name} (Tersedia: {item.stockQuantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Transfer</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem ? selectedItem.stockQuantity : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Alasan Transfer</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pemenuhan stok mendesak untuk event weekend"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedItem || selectedItem.stockQuantity <= 0}
                  className="px-5 py-2.5 font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
