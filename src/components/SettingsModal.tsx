import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Phone, 
  Receipt, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2,
  X
} from 'lucide-react';
import { RestaurantSettings } from '../types';

interface SettingsModalProps {
  settings: RestaurantSettings;
  onSaveSettings: (settings: RestaurantSettings) => void;
  onResetDemoData: () => void;
  onClose?: () => void;
  isInlineView?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
  onClose,
  isInlineView = false
}) => {
  const [formData, setFormData] = useState<RestaurantSettings>(settings);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Notice */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Restaurant Profile & Fiscal Setup</h3>
          <p className="text-xs text-slate-400">
            Configure business information, KRA PIN, M-Pesa details, and tax rates.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Business Details */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Restaurant Identity
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Restaurant Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Tagline / Motto</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Branch Name</label>
            <input
              type="text"
              value={formData.branch}
              onChange={e => setFormData({ ...formData, branch: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-slate-300 block mb-1">Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Tax & Fiscal Settings */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Kenyan Fiscal & Tax Compliance
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="text-xs text-slate-300 block mb-1">KRA PIN Number</label>
            <input
              type="text"
              value={formData.kraPin}
              onChange={e => setFormData({ ...formData, kraPin: e.target.value.toUpperCase() })}
              placeholder="P051839201Z"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">M-PESA Buy Goods Till</label>
            <input
              type="text"
              value={formData.mpesaTillNumber}
              onChange={e => setFormData({ ...formData, mpesaTillNumber: e.target.value })}
              placeholder="894 102"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">M-PESA Paybill (Optional)</label>
            <input
              type="text"
              value={formData.mpesaPaybillNumber}
              onChange={e => setFormData({ ...formData, mpesaPaybillNumber: e.target.value })}
              placeholder="522522"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Kenya VAT Rate (%)</label>
            <input
              type="number"
              value={formData.vatRatePercent}
              onChange={e => setFormData({ ...formData, vatRatePercent: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Catering Levy (%)</label>
            <input
              type="number"
              value={formData.cateringLevyPercent}
              onChange={e => setFormData({ ...formData, cateringLevyPercent: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Service Charge (%)</label>
            <input
              type="number"
              value={formData.serviceChargePercent}
              onChange={e => setFormData({ ...formData, serviceChargePercent: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="text-xs text-slate-300 block mb-1">Thermal Receipt Footer Note</label>
          <input
            type="text"
            value={formData.receiptFooterNote}
            onChange={e => setFormData({ ...formData, receiptFooterNote: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all demo orders, inventory, and tables to factory initial state?')) {
              onResetDemoData();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>
    </form>
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
          <h3 className="font-bold text-white text-base">POS & Restaurant Settings</h3>
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
