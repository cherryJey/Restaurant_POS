import React, { useState } from 'react';
import { 
  Coins, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  User,
  X
} from 'lucide-react';
import { ShiftRegister } from '../types';
import { formatKES, formatDateTime } from '../utils/formatters';

interface ShiftRegisterModalProps {
  shift: ShiftRegister;
  onUpdateShift: (shift: ShiftRegister) => void;
  onClose?: () => void;
  isInlineView?: boolean;
}

export const ShiftRegisterModal: React.FC<ShiftRegisterModalProps> = ({
  shift,
  onUpdateShift,
  onClose,
  isInlineView = false
}) => {
  const [cashDropAmount, setCashDropAmount] = useState('');
  const [cashDropReason, setCashDropReason] = useState('');
  const [actualCashInput, setActualCashInput] = useState('');
  const [isClosingShift, setIsClosingShift] = useState(false);

  // Expected Cash = Opening Float + Cash Sales - Cash Drops
  const expectedCash = shift.openingFloatKes + shift.cashSalesKes - shift.cashDropsKes;
  const actualCash = parseFloat(actualCashInput) || 0;
  const variance = actualCash - expectedCash;

  const handleRecordDrop = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cashDropAmount);
    if (isNaN(amount) || amount <= 0) return;

    onUpdateShift({
      ...shift,
      cashDropsKes: shift.cashDropsKes + amount,
      expectedCashKes: expectedCash - amount,
      notes: shift.notes 
        ? `${shift.notes}\n[Payout ${formatKES(amount)}: ${cashDropReason || 'Expenses'}]`
        : `[Payout ${formatKES(amount)}: ${cashDropReason || 'Expenses'}]`
    });

    setCashDropAmount('');
    setCashDropReason('');
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShift({
      ...shift,
      status: 'closed',
      closedAt: new Date().toISOString(),
      actualCashCountKes: actualCash,
      cashVarianceKes: variance,
    });
    setIsClosingShift(false);
  };

  const handleStartNewShift = () => {
    onUpdateShift({
      id: `shift-${Date.now()}`,
      cashierName: shift.cashierName,
      role: shift.role,
      openedAt: new Date().toISOString(),
      openingFloatKes: 5000,
      cashSalesKes: 0,
      mpesaSalesKes: 0,
      cardSalesKes: 0,
      cashDropsKes: 0,
      expectedCashKes: 5000,
      status: 'open'
    });
  };

  const content = (
    <div className="space-y-5">
      {/* Shift Overview Status Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Active Cash Register Drawer</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                shift.status === 'open' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {shift.status}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Cashier: {shift.cashierName} · Opened at {formatDateTime(shift.openedAt)}
            </span>
          </div>
        </div>

        {shift.status === 'open' ? (
          <button
            onClick={() => setIsClosingShift(true)}
            className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 font-bold text-xs rounded-lg transition-colors"
          >
            Reconcile & Close Shift
          </button>
        ) : (
          <button
            onClick={handleStartNewShift}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            Open New Shift
          </button>
        )}
      </div>

      {/* Cash Reconciliation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Opening Cash Float</span>
          <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
            {formatKES(shift.openingFloatKes)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Start of shift float</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Cash Sales Collected</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            +{formatKES(shift.cashSalesKes)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Physical currency received</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Cash Payouts / Drops</span>
          <div className="text-lg font-bold font-mono text-red-400 mt-1 tabular-nums">
            -{formatKES(shift.cashDropsKes)}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Safe drops & expenses</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/5">
          <span className="text-xs text-amber-300 block font-medium">Expected in Drawer</span>
          <div className="text-xl font-extrabold font-mono text-amber-400 mt-1 tabular-nums">
            {formatKES(expectedCash)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Must balance at close</span>
        </div>
      </div>

      {/* Non-Cash Audits (M-Pesa & Card) */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Digital Collections (Direct to Bank / Merchant Account)
        </h3>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block">Total M-PESA Till Collections</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block tabular-nums">
              {formatKES(shift.mpesaSalesKes)}
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Card PDQ Collections</span>
            <span className="text-base font-bold font-mono text-blue-400 mt-0.5 block tabular-nums">
              {formatKES(shift.cardSalesKes)}
            </span>
          </div>
        </div>
      </div>

      {/* Record Cash Payout / Drop Form */}
      {shift.status === 'open' && (
        <form onSubmit={handleRecordDrop} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Record Cash Payout or Safe Drop
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Amount (KES)</label>
              <input
                type="number"
                value={cashDropAmount}
                onChange={e => setCashDropAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Reason / Supplier Payout</label>
              <input
                type="text"
                value={cashDropReason}
                onChange={e => setCashDropReason(e.target.value)}
                placeholder="e.g. Fresh milk delivery, Cooking gas refill"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!cashDropAmount}
              className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
            >
              Record Cash Payout
            </button>
          </div>
        </form>
      )}

      {/* CLOSE SHIFT RECONCILIATION MODAL */}
      {isClosingShift && (
        <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-white text-sm">Count Physical Cash & Close Shift</h4>
              <span className="text-xs text-slate-400">Expected: {formatKES(expectedCash)}</span>
            </div>
            <button
              onClick={() => setIsClosingShift(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">
              Actual Physical Cash Counted in Drawer (KES)
            </label>
            <input
              type="number"
              value={actualCashInput}
              onChange={e => setActualCashInput(e.target.value)}
              placeholder="e.g. 9680"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white font-mono text-lg font-bold focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>

          {actualCashInput && (
            <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
              variance === 0
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                : variance > 0
                ? 'bg-blue-950/40 border-blue-800 text-blue-400'
                : 'bg-red-950/40 border-red-800 text-red-400'
            }`}>
              <span>Variance:</span>
              <span className="font-bold text-sm">
                {variance === 0
                  ? 'Perfect Match (KES 0)'
                  : variance > 0
                  ? `Over by ${formatKES(variance)}`
                  : `Short by ${formatKES(Math.abs(variance))}`}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsClosingShift(false)}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCloseShift}
              className="flex-1 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950"
            >
              Sign Off & Lock Shift
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isInlineView) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 max-w-4xl mx-auto w-full">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-base">Shift & Cash Drawer Management</h3>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {content}
      </div>
    </div>
  );
};
