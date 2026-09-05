import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ChefHat,
  Factory,
  Layers,
  Package,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Store,
  Tag,
  Trash2,
} from 'lucide-react';
import {
  AddItemDialog,
  ConfigureRecipeBomDialog,
  ProduceGoodsDialog,
  RestockRawMaterialDialog,
} from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { ItemEntity, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const InventoryScreen: React.FC = () => {
  const {
    activeBusiness,
    activeItems,
    currentSession,
    deleteItem,
    canAccessCostPrice,
  } = useTgp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'RAW_MATERIAL' | 'PRODUCT' | 'MENU_DISH' | 'SERVICE'>('ALL');
  const [filterLocation, setFilterLocation] = useState<'ALL' | 'GUDANG_BAKU' | 'GUDANG_STOK'>('ALL');

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isProduceOpen, setIsProduceOpen] = useState(false);
  const [isRestockRawOpen, setIsRestockRawOpen] = useState(false);
  const [recipeConfigItem, setRecipeConfigItem] = useState<ItemEntity | null>(null);

  const isOwner = currentSession?.user.role === UserRole.OWNER;
  const isMaster = currentSession?.user.role === UserRole.MASTER;
  const isWarehouse = currentSession?.user.role === UserRole.WAREHOUSE;
  const isManager = currentSession?.user.role === UserRole.MANAGER;
  const canProduce = isOwner || isMaster || isWarehouse || isManager;

  const filteredItems = activeItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === 'ALL' || item.type === filterType;

    const matchLoc =
      filterLocation === 'ALL'
        ? true
        : filterLocation === 'GUDANG_BAKU'
        ? item.location.toLowerCase().includes('baku') || item.type === 'RAW_MATERIAL'
        : !item.location.toLowerCase().includes('baku') && item.type !== 'RAW_MATERIAL';

    return matchSearch && matchType && matchLoc;
  });

  const rawMaterials = activeItems.filter((i) => i.type === 'RAW_MATERIAL');
  const finishedGoods = activeItems.filter((i) => i.type !== 'RAW_MATERIAL' && i.type !== 'SERVICE');
  const lowStock = activeItems.filter((i) => i.type !== 'SERVICE' && i.stockQuantity <= 5);

  return (
    <div className="space-y-5 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Manajemen Logistik & Stok
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Gudang & Inventaris ({activeBusiness?.name})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pemisahan Gudang Bahan Baku, Gudang Stok Bahan Jadi, dan Formula BOM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canProduce && (
            <button
              onClick={() => setIsProduceOpen(true)}
              data-testid="btn_produce_modal"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
            >
              <Factory className="w-4 h-4" />
              <span>Produksi Bahan Jadi</span>
            </button>
          )}

          <button
            onClick={() => setIsRestockRawOpen(true)}
            data-testid="btn_restock_raw_modal"
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>+ Bahan Mentah</span>
          </button>

          <button
            onClick={() => setIsAddItemOpen(true)}
            data-testid="btn_add_item_modal"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Bahan Baku Mentah"
          value={`${rawMaterials.length} Jenis`}
          icon={<Layers className="w-4 h-4" />}
          color="amber"
          subtitle="Gudang Bahan Baku"
        />
        <StatCard
          title="Produk Jadi & Menu"
          value={`${finishedGoods.length} Item`}
          icon={<Package className="w-4 h-4" />}
          color="blue"
          subtitle="Gudang Stok Siap Jual"
        />
        <StatCard
          title="Stok Menipis (<= 5)"
          value={`${lowStock.length} Item`}
          icon={<AlertTriangle className="w-4 h-4" />}
          color={lowStock.length > 0 ? 'rose' : 'emerald'}
          subtitle={lowStock.length > 0 ? 'Perlu Restock Segera' : 'Stok Aman'}
        />
        <StatCard
          title="Total Ragam Item"
          value={`${activeItems.length} SKU`}
          icon={<Tag className="w-4 h-4" />}
          color="purple"
          subtitle="Katalog Terdaftar"
        />
      </div>

      {/* Warehouse Filter & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Location Warehouse Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterLocation('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                filterLocation === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Lokasi
            </button>
            <button
              onClick={() => setFilterLocation('GUDANG_BAKU')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filterLocation === 'GUDANG_BAKU'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Gudang Bahan Baku ({rawMaterials.length})</span>
            </button>
            <button
              onClick={() => setFilterLocation('GUDANG_STOK')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filterLocation === 'GUDANG_STOK'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Gudang Stok Siap Jual ({finishedGoods.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari item, SKU, kategori..."
              data-testid="input_inventory_search"
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>
        </div>

        {/* Item Cards / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Item & Kategori</th>
                <th className="py-2.5 px-3">Tipe / Lokasi</th>
                <th className="py-2.5 px-3 text-right">Stok Gudang</th>
                {canAccessCostPrice && <th className="py-2.5 px-3 text-right">Harga Beli (HPP)</th>}
                <th className="py-2.5 px-3 text-right">Harga Jual</th>
                <th className="py-2.5 px-3 text-center">Aksi / Resep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data barang yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isRaw = item.type === 'RAW_MATERIAL';
                  const isBOM = item.type === 'MENU_DISH' || (item.bomIngredients && item.bomIngredients.length > 0);

                  return (
                    <tr key={item.itemId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.sku} &bull; {item.category}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isRaw
                                ? 'bg-amber-100 text-amber-800'
                                : item.type === 'SERVICE'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isRaw ? 'BAHAN MENTAH' : item.type === 'SERVICE' ? 'JASA' : 'PRODUK JADI'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                          {item.location}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-black text-sm ${
                            item.type !== 'SERVICE' && item.stockQuantity <= 5
                              ? 'text-rose-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.type === 'SERVICE' ? 'Layanan' : `${item.stockQuantity} ${item.unit}`}
                        </span>
                      </td>

                      {canAccessCostPrice && (
                        <td className="py-3 px-3 text-right text-slate-600 font-semibold">
                          {formatRupiah(item.costPrice)}
                        </td>
                      )}

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {isRaw ? '-' : formatRupiah(item.sellingPrice)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isRaw && item.type !== 'SERVICE' && (
                            <button
                              onClick={() => setRecipeConfigItem(item)}
                              title="Atur Resep / Bill of Materials (BOM)"
                              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                isBOM
                                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">BOM</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus item "${item.name}"?`)) {
                                deleteItem(item.itemId);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <AddItemDialog
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
      />
      <ProduceGoodsDialog
        isOpen={isProduceOpen}
        onClose={() => setIsProduceOpen(false)}
      />
      <RestockRawMaterialDialog
        isOpen={isRestockRawOpen}
        onClose={() => setIsRestockRawOpen(false)}
      />
      {recipeConfigItem && (
        <ConfigureRecipeBomDialog
          isOpen={true}
          onClose={() => setRecipeConfigItem(null)}
          item={recipeConfigItem}
        />
      )}
    </div>
  );
};
