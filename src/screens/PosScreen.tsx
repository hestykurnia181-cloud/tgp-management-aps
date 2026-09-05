import React, { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  QrCode,
  Receipt,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { PosReceiptModal } from '../components/PosReceiptModal';
import { useTgp } from '../context/TgpContext';
import { BusinessModule, ItemEntity, PaymentMethod, SaleOrderEntity } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const PosScreen: React.FC = () => {
  const {
    activeBusiness,
    activeItems,
    activeOutlets,
    activeOutletStocks,
    cart,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    checkout,
    currentSession,
  } = useTgp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | 'TRANSFER'>('TUNAI');
  const [nominalReceived, setNominalReceived] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleOrderEntity | null>(null);

  // If user is assigned to a specific stan
  const userAssignedOutletId = currentSession?.user.outletId;
  const [selectedOutletId, setSelectedOutletId] = useState<string>(
    userAssignedOutletId || (activeOutlets[0] ? activeOutlets[0].outletId : '')
  );

  const hasStanModule = activeBusiness?.activeModules.includes(BusinessModule.STAN_OUTLET);

  // Available items for sell (PRODUCT, MENU_DISH, SERVICE). RAW_MATERIAL is not directly sold on POS.
  const sellableItems = activeItems.filter(
    (i) => i.type !== 'RAW_MATERIAL'
  );

  const categories = Array.from(new Set(sellableItems.map((i) => i.category)));

  const filteredItems = sellableItems.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || i.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const getItemEffectiveStock = (item: ItemEntity): number => {
    if (item.type === 'SERVICE') return 9999;
    if (hasStanModule && selectedOutletId) {
      const stanStock = activeOutletStocks.find(
        (s) => s.outletId === selectedOutletId && s.itemId === item.itemId
      );
      return stanStock ? stanStock.stockQuantity : 0;
    }
    return item.stockQuantity;
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const paid = paymentMethod === 'TUNAI' ? parseFloat(nominalReceived) || cartTotal : cartTotal;
    const pm = paymentMethod === 'TUNAI' ? PaymentMethod.CASH : (paymentMethod as PaymentMethod);

    const sale = checkout(
      pm,
      hasStanModule && selectedOutletId ? selectedOutletId : undefined,
      paid
    );

    if (sale) {
      setIsCheckoutOpen(false);
      setCustomerName('');
      setNominalReceived('');
      setCompletedSale(sale);
    }
  };

  const numericPaid = parseFloat(nominalReceived) || 0;
  const changeDue = Math.max(0, numericPaid - cartTotal);

  return (
    <div className="pb-20 space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Kasir POS ({activeBusiness?.name})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Penjualan langsung & pemotongan stok otomatis
            </p>
          </div>
        </div>

        {/* Stan / Outlet Switcher if Multi-Stan is active */}
        {hasStanModule && activeOutlets.length > 0 && (
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-600 shrink-0" />
            <select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              disabled={!!userAssignedOutletId}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/60 text-xs font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {activeOutlets.map((o) => (
                <option key={o.outletId} value={o.outletId}>
                  Stand: {o.name} ({o.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Middle: Catalog Items List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama produk / SKU..."
                data-testid="input_pos_search"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Category Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedCategory === 'ALL'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({sellableItems.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                Tidak ada produk yang cocok dengan pencarian.
              </div>
            ) : (
              filteredItems.map((item) => {
                const stock = getItemEffectiveStock(item);
                const isOutOfStock = item.type !== 'SERVICE' && stock <= 0;
                const inCart = cart.find((c) => c.item.itemId === item.itemId);

                return (
                  <div
                    key={item.itemId}
                    onClick={() => {
                      if (!isOutOfStock) addToCart(item);
                    }}
                    data-testid={`pos_item_${item.name.replace(/\s+/g, '_')}`}
                    className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : inCart
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                          {item.category}
                        </span>
                        {inCart && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                            {inCart.quantity}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1 leading-snug">
                        {item.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-blue-600 block">
                          {formatRupiah(item.sellingPrice)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            stock <= 3 && item.type !== 'SERVICE'
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.type === 'SERVICE' ? 'Layanan' : `Stok: ${stock} ${item.unit}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Cart & Checkout (5 cols on lg) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full min-h-[420px]">
            <div>
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Keranjang Transaksi</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Kosongkan</span>
                  </button>
                )}
              </div>

              {/* Cart Item Rows */}
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2 pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold">Keranjang Masih Kosong</p>
                    <p className="text-[11px]">Klik produk di katalog untuk menambahkan.</p>
                  </div>
                ) : (
                  cart.map(({ item, quantity }) => (
                    <div key={item.itemId} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate leading-tight">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatRupiah(item.sellingPrice)} &times; {quantity} ={' '}
                          <span className="font-bold text-slate-800">
                            {formatRupiah(item.sellingPrice * quantity)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateCartItemQuantity(item.itemId, quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{quantity}</span>
                        <button
                          onClick={() => {
                            const eff = getItemEffectiveStock(item);
                            if (item.type === 'SERVICE' || quantity < eff) {
                              updateCartItemQuantity(item.itemId, quantity + 1);
                            }
                          }}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.itemId)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Summary & Checkout Trigger */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Total Item:</span>
                <span className="font-bold text-slate-800">
                  {cart.reduce((a, c) => a + c.quantity, 0)} barang
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Total Pembayaran:</span>
                <span
                  data-testid="cart_total_amount"
                  className="text-lg font-black text-blue-600 tracking-tight"
                >
                  {formatRupiah(cartTotal)}
                </span>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={cart.length === 0}
                data-testid="btn_open_checkout"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-[0.99]"
              >
                <Banknote className="w-4 h-4" />
                <span>Bayar Sekarang ({formatRupiah(cartTotal)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Pembayaran Kasir</h3>
                <p className="text-xs text-slate-500">Pilih metode & catat uang pembayaran</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-4 text-xs">
              {/* Payment Methods */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'TUNAI', label: 'Tunai (Cash)', icon: Banknote },
                    { id: 'QRIS', label: 'QRIS', icon: QrCode },
                    { id: 'TRANSFER', label: 'Transfer Bank', icon: Receipt },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id as any)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                        paymentMethod === id
                          ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-extrabold ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pembeli (Opsional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Meja 4 / Pak Budi"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Cash Input & Change Due Calculation */}
              {paymentMethod === 'TUNAI' && (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Uang Diterima dari Pembeli</label>
                    <input
                      type="number"
                      value={nominalReceived}
                      onChange={(e) => setNominalReceived(e.target.value)}
                      placeholder={cartTotal.toString()}
                      autoFocus
                      data-testid="input_nominal_paid"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-extrabold text-sm text-slate-900 bg-white"
                    />
                  </div>

                  {/* Quick Preset Cash Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[cartTotal, 50000, 100000, 200000].map((amt) => {
                      if (amt < cartTotal && amt !== cartTotal) return null;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setNominalReceived(amt.toString())}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-100"
                        >
                          {formatRupiah(amt)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Change Preview */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-600">Uang Kembalian:</span>
                    <span
                      data-testid="text_change_preview"
                      className={`text-sm font-black ${
                        numericPaid >= cartTotal ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {formatRupiah(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  data-testid="btn_confirm_checkout"
                  disabled={paymentMethod === 'TUNAI' && numericPaid > 0 && numericPaid < cartTotal}
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  Selesaikan & Cetak Struk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Printable Modal */}
      <PosReceiptModal
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
      />
    </div>
  );
};
