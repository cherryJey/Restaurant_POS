import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Split, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { Order, PaymentMethod, PaymentDetails } from '../types';
import { formatKES, generateMpesaRef } from '../utils/formatters';

interface PaymentModalProps {
  order: Order;
  mpesaTillNumber: string;
  mpesaPaybillNumber: string;
  onClose: () => void;
  onCompletePayment: (paymentDetails: PaymentDetails) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  mpesaTillNumber,
  mpesaPaybillNumber,
  onClose,
  onCompletePayment
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('mpesa');

  // M-PESA state
  const [mpesaPhone, setMpesaPhone] = useState('0712345678');
  const [mpesaRefCode, setMpesaRefCode] = useState('');
  const [stkStatus, setStkStatus] = useState<'idle' | 'sending' | 'prompted' | 'success'>('idle');

  // Cash state
  const [cashTendered, setCashTendered] = useState<number>(order.totalKes);

  // Card state
  const [cardAuthRef, setCardAuthRef] = useState(`PDQ-${Math.floor(100000 + Math.random() * 900000)}`);

  // Split state
  const [splitMpesa, setSplitMpesa] = useState<number>(Math.round(order.totalKes / 2));
  const splitCash = Math.max(0, order.totalKes - splitMpesa);

  // Quick denomination increments
  const cashChange = Math.max(0, cashTendered - order.totalKes);

  const handleSimulateStkPush = () => {
    setStkStatus('sending');
    setTimeout(() => {
      setStkStatus('prompted');
      setTimeout(() => {
        const ref = generateMpesaRef();
        setMpesaRefCode(ref);
        setStkStatus('success');
      }, 1600);
    }, 1200);
  };

  const handleSubmitPayment = () => {
    const timestamp = new Date().toISOString();
    let details: PaymentDetails;

    if (activeMethod === 'mpesa') {
      const ref = mpesaRefCode || generateMpesaRef();
      details = {
        method: 'mpesa',
        timestamp,
        mpesaRef: ref,
        mpesaPhone
      };
    } else if (activeMethod === 'cash') {
      details = {
        method: 'cash',
        timestamp,
        cashTenderedKes: cashTendered,
        changeKes: cashChange
      };
    } else if (activeMethod === 'card') {
      details = {
        method: 'card',
        timestamp,
        cardRef: cardAuthRef
      };
    } else {
      // Split
      details = {
        method: 'split',
        timestamp,
        splitDetails: {
          mpesaKes: splitMpesa,
          cashKes: splitCash,
        },
        mpesaRef: generateMpesaRef()
      };
    }

    onCompletePayment(details);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 font-mono font-medium">Checkout · {order.orderNumber}</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {formatKES(order.totalKes)}
              </span>
              <span className="text-xs text-slate-400">Total in KES</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="p-3 bg-slate-900 border-b border-slate-800">
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMethod('mpesa')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-colors ${
                activeMethod === 'mpesa'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>M-PESA</span>
            </button>

            <button
              onClick={() => setActiveMethod('cash')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-colors ${
                activeMethod === 'cash'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4 shrink-0" />
              <span>Cash</span>
            </button>

            <button
              onClick={() => setActiveMethod('card')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-colors ${
                activeMethod === 'card'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Card</span>
            </button>

            <button
              onClick={() => setActiveMethod('split')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-colors ${
                activeMethod === 'split'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Split className="w-4 h-4 shrink-0" />
              <span>Split</span>
            </button>
          </div>
        </div>

        {/* Method Specific Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* M-PESA TAB */}
          {activeMethod === 'mpesa' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider block">
                    Buy Goods Till
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-200">
                    {mpesaTillNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider block">
                    Paybill Option
                  </span>
                  <span className="text-sm font-semibold font-mono text-emerald-300">
                    {mpesaPaybillNumber}
                  </span>
                </div>
              </div>

              {/* STK Push simulator */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-medium text-slate-300 block">
                  Customer Safaricom Mobile Number for STK Prompt
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +254
                    </span>
                    <input
                      type="text"
                      value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className="w-full pl-14 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleSimulateStkPush}
                    disabled={stkStatus === 'sending' || stkStatus === 'prompted'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {stkStatus === 'sending' || stkStatus === 'prompted' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Prompting...</span>
                      </>
                    ) : stkStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Re-send STK</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>STK Push</span>
                      </>
                    )}
                  </button>
                </div>

                {/* STK Status Feedback */}
                {stkStatus === 'sending' && (
                  <div className="text-xs text-amber-400 flex items-center gap-2 pt-1 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Initiating Safaricom Daraja STK Push to {mpesaPhone}...</span>
                  </div>
                )}

                {stkStatus === 'prompted' && (
                  <div className="text-xs text-blue-400 flex items-center gap-2 pt-1 font-mono">
                    <PhoneCall className="w-3 h-3 animate-pulse" />
                    <span>STK PIN Prompt displayed on customer phone. Waiting for PIN...</span>
                  </div>
                )}

                {stkStatus === 'success' && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Payment Confirmed by Safaricom M-PESA</span>
                    </div>
                    <div className="text-[11px] text-emerald-200 font-mono">
                      Ref: <span className="font-bold text-white">{mpesaRefCode}</span> · Amount: {formatKES(order.totalKes)}
                    </div>
                  </div>
                )}
              </div>

              {/* Manual code entry */}
              <div className="pt-2">
                <label className="text-xs text-slate-400 block mb-1">
                  Or Enter M-Pesa Receipt Code Manually (if already paid to Till)
                </label>
                <input
                  type="text"
                  value={mpesaRefCode}
                  onChange={e => setMpesaRefCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SK9281HG72"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* CASH TAB */}
          {activeMethod === 'cash' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-medium text-slate-300 block">
                  Cash Amount Tendered (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                    KES
                  </span>
                  <input
                    type="number"
                    value={cashTendered || ''}
                    onChange={e => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="w-full pl-14 pr-3 py-3 bg-slate-900 border border-slate-800 rounded-lg text-xl font-bold font-mono text-white focus:outline-none focus:border-amber-500 tabular-nums"
                  />
                </div>

                {/* Quick note buttons */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 pt-1">
                  {[100, 200, 500, 1000, 2000].map(val => (
                    <button
                      key={val}
                      onClick={() => setCashTendered(prev => (prev || 0) + val)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs font-semibold"
                    >
                      +{val}
                    </button>
                  ))}
                  <button
                    onClick={() => setCashTendered(order.totalKes)}
                    className="py-1.5 px-2 bg-amber-500 text-slate-950 rounded font-mono text-xs font-bold"
                  >
                    Exact
                  </button>
                </div>
              </div>

              {/* Change Calculation Box */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                cashTendered >= order.totalKes
                  ? 'bg-emerald-950/30 border-emerald-800/60'
                  : 'bg-red-950/20 border-red-800/40'
              }`}>
                <div>
                  <span className="text-xs text-slate-400 block">
                    {cashTendered >= order.totalKes ? 'Change to Return' : 'Shortage'}
                  </span>
                  <span className={`text-2xl font-extrabold font-mono tabular-nums ${
                    cashTendered >= order.totalKes ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {cashTendered >= order.totalKes
                      ? formatKES(cashChange)
                      : formatKES(order.totalKes - cashTendered)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono">
                  <span>Bill: {formatKES(order.totalKes)}</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD TAB */}
          {activeMethod === 'card' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>Card POS Terminal (Visa / Mastercard / KCB / Equity PDQ)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    PDQ Approval Code / Reference
                  </label>
                  <input
                    type="text"
                    value={cardAuthRef}
                    onChange={e => setCardAuthRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SPLIT TAB */}
          {activeMethod === 'split' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs text-slate-300 font-medium block">
                  Distribute Payment between M-PESA & Cash
                </span>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400 font-semibold">M-PESA Portion</span>
                    <span className="font-mono text-white font-bold">{formatKES(splitMpesa)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={order.totalKes}
                    step="50"
                    value={splitMpesa}
                    onChange={e => setSplitMpesa(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <span className="text-amber-400 font-semibold">Cash Portion</span>
                  <span className="font-mono text-white font-bold">{formatKES(splitCash)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Primary Checkout Action */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmitPayment}
            disabled={activeMethod === 'cash' && cashTendered < order.totalKes}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Complete Payment ({formatKES(order.totalKes)})</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
