import React from 'react';
import { 
  UtensilsCrossed, 
  LayoutGrid, 
  ChefHat, 
  Package, 
  BarChart3, 
  Coins, 
  Settings, 
  Clock, 
  UserCheck, 
  Layers,
  AlertTriangle
} from 'lucide-react';
import { ShiftRegister } from '../types';

interface HeaderProps {
  currentTab: 'pos' | 'tables' | 'kitchen' | 'inventory' | 'reports' | 'shift' | 'settings';
  setCurrentTab: (tab: 'pos' | 'tables' | 'kitchen' | 'inventory' | 'reports' | 'shift' | 'settings') => void;
  activeKitchenOrdersCount: number;
  lowStockCount: number;
  activeShift: ShiftRegister;
  heldOrdersCount: number;
  onOpenHeldOrders: () => void;
  onOpenStaffModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeKitchenOrdersCount,
  lowStockCount,
  activeShift,
  heldOrdersCount,
  onOpenHeldOrders,
  onOpenStaffModal
}) => {
  const [currentTime, setCurrentTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'pos' as const, label: 'POS Register', icon: UtensilsCrossed },
    { id: 'tables' as const, label: 'Tables', icon: LayoutGrid },
    { 
      id: 'kitchen' as const, 
      label: 'Kitchen KDS', 
      icon: ChefHat, 
      badge: activeKitchenOrdersCount > 0 ? activeKitchenOrdersCount : undefined 
    },
    { 
      id: 'inventory' as const, 
      label: 'Inventory', 
      icon: Package, 
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500 text-black'
    },
    { id: 'reports' as const, label: 'Sales & Z-Report', icon: BarChart3 },
    { id: 'shift' as const, label: 'Shift Drawer', icon: Coins },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-6 shadow-sm">
      {/* Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
          S
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
            SimbaPOS
          </span>
          <span className="text-[11px] text-amber-400 font-medium tracking-wide">
            KES Currency
          </span>
        </div>
      </div>

      {/* Navigation Zone */}
      <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap relative ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4.5 text-center ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-slate-950 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls Zone */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Held Orders quick recall */}
        {heldOrdersCount > 0 && (
          <button
            onClick={onOpenHeldOrders}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            title="Recall Parked Orders"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{heldOrdersCount} Held</span>
          </button>
        )}

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono tabular-nums">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Staff Switch button */}
        <button
          onClick={onOpenStaffModal}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-semibold text-white">{activeShift.cashierName}</span>
          <span className="text-[11px] text-slate-400">({activeShift.role})</span>
        </button>
      </div>
    </header>
  );
};
