import React from 'react';
import { Printer, X, Check, Download, Share2 } from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatKES, formatDateTime } from '../utils/formatters';

interface ReceiptModalProps {
  order: Order;
  settings: RestaurantSettings;
  onClose: () => void;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  settings,
  onClose,
  onNewOrder
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Header toolbar */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Payment Completed
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Thermal Receipt Paper Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-950/60">
          <div 
            id="thermal-receipt"
            className="bg-white text-slate-950 p-6 rounded-lg shadow-xl font-mono text-[12px] leading-relaxed w-full max-w-[340px] border border-slate-200 select-all print-only"
          >
            {/* Header / Logo */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-extrabold text-base tracking-tight text-black uppercase">
                {settings.name}
              </h2>
              <p className="text-[11px] text-slate-600">{settings.branch}</p>
              <p className="text-[11px] text-slate-600">{settings.address}</p>
              <p className="text-[11px] text-slate-600">Tel: {settings.phone}</p>
              <div className="pt-1 text-[11px] font-semibold text-slate-800">
                <span>KRA PIN: {settings.kraPin}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-800">
                <span>M-PESA TILL: {settings.mpesaTillNumber}</span>
              </div>
            </div>

            {/* Order Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>RECEIPT: <strong className="text-black">{order.orderNumber}</strong></span>
                <span>{order.tableName || 'Takeaway'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>DATE: {formatDateTime(order.completedAt || order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SERVER: {order.waiterName || order.cashierName}</span>
                <span>TYPE: {order.orderType.toUpperCase()}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold pb-1 text-[11px] border-b border-slate-200">
                <span>QTY / ITEM</span>
                <span className="text-right">AMOUNT</span>
              </div>
              <div className="space-y-1.5 pt-2">
                {order.items.map(it => (
                  <div key={it.id} className="text-[11px]">
                    <div className="flex justify-between">
                      <span className="font-bold">{it.quantity}x {it.name}</span>
                      <span className="font-semibold text-right">{formatKES(it.totalKes)}</span>
                    </div>
                    {it.notes && (
                      <div className="text-[10px] text-slate-500 italic pl-3">
                        * {it.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-700">
                <span>SUBTOTAL:</span>
                <span>{formatKES(order.subtotalKes)}</span>
              </div>

              {order.discountKes > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>DISCOUNT:</span>
                  <span>-{formatKES(order.discountKes)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>VAT (16% inclusive):</span>
                <span>{formatKES(order.vatAmountKes)}</span>
              </div>

              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>Catering Levy (2% incl.):</span>
                <span>{formatKES(order.cateringLevyAmountKes)}</span>
              </div>

              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-200 text-black">
                <span>TOTAL:</span>
                <span>{formatKES(order.totalKes)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>PAID VIA:</span>
                <span className="uppercase text-black">
                  {order.paymentDetails?.method || 'CASH'}
                </span>
              </div>

              {order.paymentDetails?.mpesaRef && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>M-PESA REF:</span>
                  <span>{order.paymentDetails.mpesaRef}</span>
                </div>
              )}

              {order.paymentDetails?.cashTenderedKes !== undefined && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CASH TENDERED:</span>
                    <span>{formatKES(order.paymentDetails.cashTenderedKes)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CHANGE:</span>
                    <span>{formatKES(order.paymentDetails.changeKes || 0)}</span>
                  </div>
                </>
              )}

              {order.paymentDetails?.cardRef && (
                <div className="flex justify-between text-slate-600">
                  <span>CARD AUTH:</span>
                  <span>{order.paymentDetails.cardRef}</span>
                </div>
              )}
            </div>

            {/* Thermal Barcode Graphic & Footer */}
            <div className="pt-3 text-center space-y-2">
              <div className="flex justify-center py-1">
                <div className="w-48 h-8 flex items-center justify-between bg-black/5 p-1 rounded">
                  {/* Simulated thermal barcode bars */}
                  {[3, 1, 4, 1, 2, 1, 5, 2, 1, 3, 2, 4, 1, 2, 1, 3, 1, 2].map((w, idx) => (
                    <div 
                      key={idx} 
                      className="bg-black h-6 inline-block" 
                      style={{ width: `${w * 1.5}px` }} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {order.orderNumber} · VERIFIED FISCAL RECEIPT
              </p>
              <p className="text-[10.5px] italic text-slate-700 font-semibold pt-1">
                "{settings.receiptFooterNote}"
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onNewOrder}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
