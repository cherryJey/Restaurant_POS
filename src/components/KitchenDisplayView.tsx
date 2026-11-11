import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Volume2, 
  VolumeX, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatTime } from '../utils/formatters';

interface KitchenDisplayViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  onUpdateOrderStatus
}) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'preparing' | 'ready'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Update live elapsed time every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter kitchen-relevant orders (exclude paid/completed or cancelled)
  const kitchenOrders = orders
    .filter(o => o.isKitchenSent && (o.status === 'new' || o.status === 'preparing' || o.status === 'ready'))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const displayedOrders = kitchenOrders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = now - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  const handlePrintKOT = (order: Order) => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Top KDS Control Bar */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Kitchen Display System (KDS)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {kitchenOrders.length} active tickets
          </span>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['all', 'new', 'preparing', 'ready'] as const).map(st => {
            const count = st === 'all' 
              ? kitchenOrders.length 
              : kitchenOrders.filter(o => o.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors flex items-center gap-1.5 ${
                  filter === st
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{st}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Audio Alert Switch */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            soundEnabled
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title="Kitchen audio chime alert"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
        </button>
      </div>

      {/* Orders Board */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {displayedOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <CheckCircle className="w-12 h-12 mb-3 text-emerald-500/80" />
            <p className="text-base font-semibold text-slate-300">All Kitchen Orders Cleared</p>
            <p className="text-xs text-slate-500 mt-1">
              New orders sent from the POS register will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {displayedOrders.map(order => {
              const elapsedMins = getElapsedMinutes(order.createdAt);
              const isUrgent = elapsedMins >= 15;
              const isWarning = elapsedMins >= 10 && elapsedMins < 15;

              return (
                <div
                  key={order.id}
                  className={`flex flex-col justify-between rounded-xl border bg-slate-900 shadow-md overflow-hidden transition-all ${
                    isUrgent
                      ? 'border-red-500 ring-1 ring-red-500/40'
                      : isWarning
                      ? 'border-amber-500/80'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-3 border-b flex items-center justify-between ${
                    isUrgent
                      ? 'bg-red-950/50 border-red-900/60'
                      : isWarning
                      ? 'bg-amber-950/40 border-amber-900/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {order.kotNumber || order.orderNumber}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                          {order.tableName || order.orderType.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Waiter: {order.waiterName || 'Staff'} · Placed at {formatTime(order.createdAt)}
                      </span>
                    </div>

                    {/* Timer Alert */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold ${
                      isUrgent
                        ? 'bg-red-500 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsedMins}m</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-3.5 flex-1 space-y-2.5">
                    {order.items.map(item => (
                      <div key={item.id} className="border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                            <span className="text-amber-400 font-mono mr-1.5 text-sm">{item.quantity}x</span>
                            {item.name}
                          </span>
                        </div>
                        {item.notes && (
                          <div className="mt-1 inline-block bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] px-2 py-0.5 rounded font-medium">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Status Advance Footer */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePrintKOT(order)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="Print KOT Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {order.status === 'new' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                        className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Flame className="w-3.5 h-3.5 text-slate-950" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'served')}
                        className="flex-1 py-2 px-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                        <span>Mark Served</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
