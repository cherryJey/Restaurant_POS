import React from 'react';
import { UserCheck, Shield, ChefHat, User, X } from 'lucide-react';
import { ShiftRegister } from '../types';

interface StaffModalProps {
  currentCashier: string;
  currentRole: string;
  onSwitchStaff: (name: string, role: ShiftRegister['role']) => void;
  onClose: () => void;
}

const STAFF_PROFILES: { name: string; role: ShiftRegister['role']; icon: any; pin: string }[] = [
  { name: 'Grace Wanjiku', role: 'Cashier', icon: UserCheck, pin: '101' },
  { name: 'Mercy Otieno', role: 'Supervisor', icon: Shield, pin: '102' },
  { name: 'John Kamau', role: 'Cashier', icon: User, pin: '103' },
  { name: 'Chef Otieno', role: 'Supervisor', icon: ChefHat, pin: '104' },
  { name: 'Brian Bett', role: 'Manager', icon: Shield, pin: '999' },
];

export const StaffModal: React.FC<StaffModalProps> = ({
  currentCashier,
  currentRole,
  onSwitchStaff,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-sm">Switch Active Staff / Operator</h3>
            <span className="text-xs text-slate-400">Current: {currentCashier} ({currentRole})</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {STAFF_PROFILES.map((staff, idx) => {
            const Icon = staff.icon;
            const isCurrent = staff.name === currentCashier;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSwitchStaff(staff.name, staff.role);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCurrent ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">{staff.name}</span>
                    <span className="text-[11px] text-slate-400">{staff.role} · PIN: {staff.pin}</span>
                  </div>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
