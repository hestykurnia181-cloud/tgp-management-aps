import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Printer,
  Receipt,
  Share2,
  Store,
  X,
} from 'lucide-react';
import { SaleOrderEntity } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleOrderEntity | null;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sale) return null;

  const receiptDate = new Date(sale.timestamp || Date.now());
  const dateFormatted = receiptDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = receiptDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const paidAmount = sale.paidAmount !== undefined ? sale.paidAmount : sale.totalAmount;
  const changeAmount = sale.changeAmount !== undefined ? sale.changeAmount : Math.max(0, paidAmount - sale.totalAmount);

  // Generate plain text receipt for copying / sharing via WhatsApp
  const generateReceiptText = (): string => {
    let text = `================================\n`;
    text += `       ${sale.businessName || 'TGP ENTERPRISE'}\n`;
    if (sale.outletName) {
      text += `       Stand / Outlet: ${sale.outletName}\n`;
    }
    text += `================================\n`;
    text += `No. Struk : ${sale.receiptNumber}\n`;
    text += `Tanggal   : ${dateFormatted} ${timeFormatted}\n`;
    text += `Kasir     : ${sale.cashierName}\n`;
    text += `Metode    : ${sale.paymentMethod}\n`;
    text += `--------------------------------\n`;

    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item) => {
        text += `${item.name}\n`;
        text += `  ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.subtotal)}\n`;
      });
    } else {
      text += `${sale.itemsSummary}\n`;
    }

    text += `--------------------------------\n`;
    text += `TOTAL TAGIHAN : ${formatRupiah(sale.totalAmount)}\n`;
    text += `BAYAR (DITERIMA): ${formatRupiah(paidAmount)}\n`;
    text += `KEMBALIAN     : ${formatRupiah(changeAmount)}\n`;
    text += `================================\n`;
    text += ` Terima kasih telah berbelanja!\n`;
    text += ` Barang yang sudah dibeli tidak\n`;
    text += `     dapat ditukar/dikembalikan.\n`;
    text += `================================\n`;
    return text;
  };

  const handleCopy = () => {
    const text = generateReceiptText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      {/* Hidden print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pos-receipt-print-area, #pos-receipt-print-area * {
            visibility: visible;
          }
          #pos-receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">Struk Pembayaran</h3>
              <p className="text-[10px] text-slate-400">Bukti transaksi sah kasir POS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="btn_close_receipt"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Body (Printable Thermal Paper Area) */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-100/60">
          <div
            id="pos-receipt-print-area"
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 text-slate-800 font-sans text-xs space-y-3"
          >
            {/* Header Brand */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs mx-auto mb-1">
                TGP
              </div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                {sale.businessName || 'TGP Business'}
              </h2>
              {sale.outletName ? (
                <p className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block border border-amber-200">
                  Stan: {sale.outletName}
                </p>
              ) : (
                <p className="text-[10px] text-slate-500 font-medium">Gudang Produksi & Kasir Pusat</p>
              )}
            </div>

            {/* Meta Transaction Details */}
            <div className="text-[11px] space-y-1 text-slate-600 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Struk:</span>
                <span className="font-mono font-bold text-slate-900">{sale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span className="font-medium text-slate-800">
                  {dateFormatted}, {timeFormatted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span className="font-semibold text-slate-800">{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">
                  {sale.paymentMethod}
                </span>
              </div>
            </div>

            {/* Items Purchased List */}
            <div className="space-y-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Rincian Pesanan:
              </span>
              {sale.items && sale.items.length > 0 ? (
                <div className="space-y-1.5 divide-y divide-slate-100">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate leading-snug">{item.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {item.quantity} {item.unit || 'pcs'} x {formatRupiah(item.price)}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 text-right shrink-0">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-700 italic">{sale.itemsSummary}</p>
              )}
            </div>

            {/* Total, Paid, & Uang Kembalian (High Contrast) */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-600">Total Tagihan:</span>
                <span className="text-sm font-black text-slate-900">{formatRupiah(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Nominal Diterima:</span>
                <span className="font-bold text-slate-800">{formatRupiah(paidAmount)}</span>
              </div>
              {/* Highlight Uang Kembalian */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between mt-1">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                    UANG KEMBALIAN
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">
                    {changeAmount === 0 ? 'Uang Pas (Tidak Ada Kembalian)' : 'Kembalikan ke Pelanggan'}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    data-testid="receipt_change_amount"
                    className="text-base font-black text-emerald-700 block tracking-tight"
                  >
                    {formatRupiah(changeAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Footer Message */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-1">
              <p className="text-[10px] font-bold text-slate-700">*** TERIMA KASIH ***</p>
              <p className="text-[9px] text-slate-500 leading-tight">
                Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan tanpa persetujuan.
              </p>
              <p className="text-[8px] text-slate-400 font-mono mt-1">
                TGP-POS System &bull; {sale.saleId}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            data-testid="btn_print_receipt"
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
          <button
            onClick={handleCopy}
            data-testid="btn_copy_receipt"
            className="py-2.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            title="Salin teks struk untuk dikirim via chat"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Salin</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            data-testid="btn_finish_receipt"
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
