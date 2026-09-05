import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  Plus,
  Send,
  Store,
  Trash2,
} from 'lucide-react';
import { CreateOutletDialog, SupplyStanStockDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { OutletEntity } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const StanOutletScreen: React.FC = () => {
  const {
    activeBusiness,
    activeOutlets,
    activeOutletStocks,
    activeItems,
    deleteOutlet,
  } = useTgp();

  const [isCreateOutletOpen, setIsCreateOutletOpen] = useState(false);
  const [supplyOutlet, setSupplyOutlet] = useState<OutletEntity | null>(null);
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('ALL');

  const filteredStocks = activeOutletStocks.filter((s) => {
    return selectedOutletFilter === 'ALL' || s.outletId === selectedOutletFilter;
  });

  const totalDistributedQuantity = activeOutletStocks.reduce((a, s) => a + s.stockQuantity, 0);

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Jaringan Stan Penjualan
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              STAN & Cabang Outlet ({activeBusiness?.name})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Manajemen titik stan cabang dan alokasi stok dari Gudang Bahan Jadi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSupplyOutlet(activeOutlets[0] || null)}
            disabled={activeOutlets.length === 0}
            data-testid="btn_open_supply_stan"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" />
            <span>Pasok Stok ke STAN</span>
          </button>
          <button
            onClick={() => setIsCreateOutletOpen(true)}
            data-testid="btn_open_create_stan"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ STAN Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          title="Total Stan Aktif"
          value={`${activeOutlets.length} Stand`}
          icon={<Store className="w-4 h-4" />}
          color="amber"
          subtitle="Titik cabang penjualan"
        />
        <StatCard
          title="Stok Terdistribusi di Stan"
          value={`${totalDistributedQuantity} Pcs`}
          icon={<Package className="w-4 h-4" />}
          color="blue"
          subtitle="Tersedia di semua stan"
        />
        <StatCard
          title="Ragam Item di Stan"
          value={`${new Set(activeOutletStocks.map((s) => s.itemId)).size} Ragam`}
          icon={<ArrowRightLeft className="w-4 h-4" />}
          color="emerald"
          subtitle="Item aktif dijual"
        />
      </div>

      {/* Outlet Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Daftar STAN / Cabang ({activeOutlets.length})
        </h3>
        {activeOutlets.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Belum ada STAN terdaftar. Klik "+ STAN Baru" untuk mendaftarkan stand cabang.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeOutlets.map((outlet) => {
              const outletStocks = activeOutletStocks.filter((s) => s.outletId === outlet.outletId);
              const totalItemsCount = outletStocks.reduce((a, s) => a + s.stockQuantity, 0);

              return (
                <div
                  key={outlet.outletId}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center">
                          {outlet.code.slice(0, 3)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{outlet.name}</h4>
                          <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Kode: {outlet.code}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus STAN "${outlet.name}"?`)) {
                            deleteOutlet(outlet.outletId);
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{outlet.location}</span>
                      </div>
                      {outlet.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{outlet.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Stok di Stan: <strong className="text-blue-600">{totalItemsCount} pcs</strong>
                    </span>
                    <button
                      onClick={() => setSupplyOutlet(outlet)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Pasok Stok</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Distributed Stock Breakdown Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Rincian Stok di Stan</h3>
            <p className="text-xs text-slate-500">Inventaris barang yang aktif dialokasikan di setiap cabang</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Filter Stan:</span>
            <select
              value={selectedOutletFilter}
              onChange={(e) => setSelectedOutletFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Semua Stan Cabang</option>
              {activeOutlets.map((o) => (
                <option key={o.outletId} value={o.outletId}>
                  {o.name} ({o.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Nama STAN</th>
                <th className="py-2.5 px-3">Produk / Menu</th>
                <th className="py-2.5 px-3 text-right">Stok di Stan</th>
                <th className="py-2.5 px-3 text-right">Harga Jual</th>
                <th className="py-2.5 px-3 text-right">Nilai Barang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Belum ada stok barang yang dialokasikan ke STAN.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const outlet = activeOutlets.find((o) => o.outletId === stock.outletId);
                  const item = activeItems.find((i) => i.itemId === stock.itemId);
                  const price = item ? item.sellingPrice : 0;
                  const totalValue = price * stock.stockQuantity;

                  return (
                    <tr key={stock.stockId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {outlet ? outlet.name : 'Stan'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{stock.itemName}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-black text-sm ${
                            stock.stockQuantity <= 5 ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {stock.stockQuantity} pcs
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {formatRupiah(price)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatRupiah(totalValue)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOutletDialog
        isOpen={isCreateOutletOpen}
        onClose={() => setIsCreateOutletOpen(false)}
      />
      {supplyOutlet && (
        <SupplyStanStockDialog
          isOpen={true}
          onClose={() => setSupplyOutlet(null)}
          outlet={supplyOutlet}
        />
      )}
    </div>
  );
};
