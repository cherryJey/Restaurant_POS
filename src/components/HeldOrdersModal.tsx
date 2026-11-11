import React from 'react';
import { Layers, ArrowRight, Trash2, Clock, X } from 'lucide-react';
import { Order } from '../types';
import { formatKES, formatTime } from '../utils/formatters';

interface HeldOrdersModalProps {
  heldOrders: Order[];
  onResumeOrder: (order: Order) => void;
  onDeleteHeldOrder: (orderId: string) => void;
  onClose: () => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({
  heldOrders,
  onResumeOrder,
  onDeleteHeldOrder,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Parked / Held Orders</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
          {heldOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No parked orders at the moment.
            </div>
          ) : (
            heldOrders.map(order => (
              <div
                key={order.id}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold font-mono text-white text-xs block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-amber-400">
                      {order.tableName || order.orderType.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatKES(order.totalKes)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Held at {formatTime(order.updatedAt || order.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteHeldOrder(order.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                      title="Discard Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onResumeOrder(order);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-3 h-3 text-slate-950" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
