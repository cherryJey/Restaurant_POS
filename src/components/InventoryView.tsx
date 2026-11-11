import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  RotateCcw, 
  History, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileText,
  DollarSign,
  UtensilsCrossed,
  X,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { InventoryItem, InventoryLog, MenuItem } from '../types';
import { formatKES, formatKESDecimal, formatDateTime } from '../utils/formatters';

interface InventoryViewProps {
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  menu: MenuItem[];
  onRestock: (itemId: string, quantityAdded: number, costKes: number, reason: string) => void;
  onRecordWastage: (itemId: string, quantityLost: number, reason: string) => void;
  onAddNewItem: (item: InventoryItem) => void;
  onUpdateItem: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  inventoryLogs,
  menu,
  onRestock,
  onRecordWastage,
  onAddNewItem,
  onUpdateItem
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'logs'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // Modal states
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockCost, setRestockCost] = useState('');
  const [restockNotes, setRestockNotes] = useState('');

  const [wastageItem, setWastageItem] = useState<InventoryItem | null>(null);
  const [wastageQty, setWastageQty] = useState('');
  const [wastageReason, setWastageReason] = useState('Expired / Damaged');

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('Produce & Veg');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemThreshold, setNewItemThreshold] = useState('');
  const [newItemUnit, setNewItemUnit] = useState<InventoryItem['unit']>('kg');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemSupplier, setNewItemSupplier] = useState('');

  // Calculations
  const totalValuationKes = inventory.reduce(
    (sum, item) => sum + item.currentStock * item.unitCostKes,
    0
  );
  const lowStockItems = inventory.filter(i => i.currentStock > 0 && i.currentStock <= i.minThreshold);
  const outOfStockItems = inventory.filter(i => i.currentStock <= 0);

  const categories = ['All', 'Meats & Poultry', 'Produce & Veg', 'Dry Goods & Flour', 'Beverages', 'Dairy & Fats', 'Spices & Sauces'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesLowStock = !showOnlyLowStock || (item.currentStock <= item.minThreshold);
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    const qty = parseFloat(restockQty);
    const cost = parseFloat(restockCost) || (qty * restockItem.unitCostKes);
    if (isNaN(qty) || qty <= 0) return;

    onRestock(restockItem.id, qty, cost, restockNotes || `Restock delivery`);
    setRestockItem(null);
    setRestockQty('');
    setRestockCost('');
    setRestockNotes('');
  };

  const handleConfirmWastage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wastageItem) return;
    const qty = parseFloat(wastageQty);
    if (isNaN(qty) || qty <= 0) return;

    onRecordWastage(wastageItem.id, qty, wastageReason);
    setWastageItem(null);
    setWastageQty('');
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      currentStock: parseFloat(newItemStock) || 0,
      minThreshold: parseFloat(newItemThreshold) || 5,
      unit: newItemUnit,
      unitCostKes: parseFloat(newItemCost) || 100,
      supplier: newItemSupplier.trim() || 'Local Merchant',
      lastRestockedAt: new Date().toISOString()
    };

    onAddNewItem(item);
    setIsAddItemOpen(false);
    setNewItemName('');
    setNewItemStock('');
    setNewItemThreshold('');
    setNewItemCost('');
    setNewItemSupplier('');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header & Sub-Navigation */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Restaurant Stock & Inventory
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            KES Valuation & Recipe Linkage
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'stock'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stock Levels ({inventory.length})
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'recipes'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recipe Cost & Margins
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs ({inventoryLogs.length})
          </button>
        </div>

        <button
          onClick={() => setIsAddItemOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>New Ingredient / Stock</span>
        </button>
      </div>

      {/* KPI Banners */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 sm:p-4 bg-slate-900/60 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Total Stock Valuation</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatKES(totalValuationKes)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across {inventory.length} active ingredients
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Low Stock Alerts</span>
          <div className="text-xl font-bold font-mono text-amber-500 mt-1 tabular-nums">
            {lowStockItems.length} items
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Approaching reorder threshold
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Out of Stock</span>
          <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${outOfStockItems.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {outOfStockItems.length} items
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {outOfStockItems.length > 0 ? 'Affects POS dishes' : 'All items in stock'}
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Stock Auto-Deduction</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ACTIVE
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Linked to paid restaurant tickets
          </span>
        </div>
      </div>

      {/* MAIN VIEW CONTENTS */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {/* TAB 1: STOCK LEVELS */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search ingredient or supplier..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    showOnlyLowStock
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Low Stock Only
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-3 px-4">Ingredient / Stock Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Reorder Alert</th>
                      <th className="py-3 px-4 text-right">Unit Cost (KES)</th>
                      <th className="py-3 px-4 text-right">Total Value (KES)</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredInventory.map(item => {
                      const isLow = item.currentStock > 0 && item.currentStock <= item.minThreshold;
                      const isOut = item.currentStock <= 0;
                      const stockValuation = item.currentStock * item.unitCostKes;

                      return (
                        <tr key={item.id} className="hover:bg-slate-850/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {isOut ? (
                                <span className="bg-red-950/80 text-red-400 border border-red-800 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                  OUT OF STOCK
                                </span>
                              ) : isLow ? (
                                <span className="bg-amber-950/80 text-amber-400 border border-amber-800 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                  LOW STOCK
                                </span>
                              ) : null}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-400">
                            {item.category}
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <span className={`text-sm font-bold tabular-nums ${
                              isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {item.currentStock.toFixed(item.unit === 'bottles' || item.unit === 'pieces' ? 0 : 1)} {item.unit}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-400 font-mono tabular-nums">
                            {item.minThreshold} {item.unit}
                          </td>

                          <td className="py-3.5 px-4 text-right text-slate-300 font-mono tabular-nums font-semibold">
                            {formatKES(item.unitCostKes)} / {item.unit}
                          </td>

                          <td className="py-3.5 px-4 text-right text-amber-400 font-mono tabular-nums font-bold">
                            {formatKES(stockValuation)}
                          </td>

                          <td className="py-3.5 px-4 text-slate-400">
                            {item.supplier}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setRestockItem(item);
                                  setRestockQty('10');
                                  setRestockCost((10 * item.unitCostKes).toString());
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-[11px] font-semibold transition-colors"
                              >
                                Restock
                              </button>

                              <button
                                onClick={() => {
                                  setWastageItem(item);
                                  setWastageQty('1');
                                }}
                                className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-[11px] font-medium transition-colors"
                              >
                                Waste
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECIPE & MARGIN ANALYSIS */}
        {activeTab === 'recipes' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-white">Menu Item Recipe & Cost Margins</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Each menu item links to real inventory ingredients. When orders are paid, the ingredients are deducted and food cost margins are tracked in KES.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.map(dish => {
                // Calculate theoretical food cost from recipes
                let calculatedCost = 0;
                dish.recipe?.forEach(ing => {
                  const inv = inventory.find(i => i.id === ing.inventoryItemId);
                  if (inv) {
                    calculatedCost += ing.quantityNeeded * inv.unitCostKes;
                  }
                });
                const effectiveCost = calculatedCost > 0 ? calculatedCost : dish.costKes;
                const grossProfitKes = dish.priceKes - effectiveCost;
                const marginPercent = Math.round((grossProfitKes / dish.priceKes) * 100);

                return (
                  <div key={dish.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{dish.name}</h4>
                        <span className="text-[11px] text-slate-400">{dish.category}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                        {formatKES(dish.priceKes)}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Ingredient Food Cost:</span>
                        <span className="font-mono text-slate-200">{formatKES(effectiveCost)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Gross Profit per plate:</span>
                        <span className="font-mono text-emerald-400 font-bold">{formatKES(grossProfitKes)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                        <span>Gross Margin:</span>
                        <span className="font-mono text-amber-400 font-bold">{marginPercent}%</span>
                      </div>
                    </div>

                    {dish.recipe && dish.recipe.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Linked Ingredients:
                        </span>
                        <div className="space-y-1">
                          {dish.recipe.map((rcp, idx) => {
                            const invObj = inventory.find(i => i.id === rcp.inventoryItemId);
                            return (
                              <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                                <span>· {invObj?.name || 'Item'}</span>
                                <span className="font-mono text-slate-400">{rcp.quantityNeeded} {rcp.unit}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL / LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Change</th>
                    <th className="py-3 px-4 text-right">New Stock</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {inventoryLogs.map(log => {
                    const isPositive = log.quantityChange > 0;
                    return (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {log.itemName}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.type === 'restock'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : log.type === 'wastage'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}>
                            {log.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300 tabular-nums">
                          {log.newStock}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {log.reason || '--'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {log.recordedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RESTOCK MODAL */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRestock}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">Restock Inventory</h3>
                <span className="text-xs text-amber-400 font-mono">{restockItem.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Quantity to Add ({restockItem.unit})
              </label>
              <input
                type="number"
                step="any"
                value={restockQty}
                onChange={e => {
                  setRestockQty(e.target.value);
                  const q = parseFloat(e.target.value) || 0;
                  setRestockCost((q * restockItem.unitCostKes).toString());
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Total Delivery Cost (KES)</label>
              <input
                type="number"
                value={restockCost}
                onChange={e => setRestockCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Invoice / Delivery Notes</label>
              <input
                type="text"
                value={restockNotes}
                onChange={e => setRestockNotes(e.target.value)}
                placeholder="e.g. Weekly delivery, Invoice #884"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950"
              >
                Confirm Restock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WASTAGE MODAL */}
      {wastageItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmWastage}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">Log Stock Wastage / Loss</h3>
                <span className="text-xs text-red-400 font-mono">{wastageItem.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setWastageItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Quantity Lost / Damaged ({wastageItem.unit})
              </label>
              <input
                type="number"
                step="any"
                value={wastageQty}
                onChange={e => setWastageQty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Reason for Loss</label>
              <select
                value={wastageReason}
                onChange={e => setWastageReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none"
              >
                <option value="Expired / Spoiled">Expired / Spoiled</option>
                <option value="Accidental Spillage / Drop">Accidental Spillage / Drop</option>
                <option value="Bruised / Bad Quality on Delivery">Bruised / Bad Quality on Delivery</option>
                <option value="Kitchen Overcooking / Burnt">Kitchen Overcooking / Burnt</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWastageItem(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-red-600 text-white"
              >
                Confirm Deduction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateItem}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-3.5 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Add New Ingredient / Stock Item</h3>
              <button
                type="button"
                onClick={() => setIsAddItemOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Item Name</label>
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="e.g. Fresh Sukuma Wiki, Tusker Cider"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value as InventoryItem['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                >
                  <option value="Meats & Poultry">Meats & Poultry</option>
                  <option value="Produce & Veg">Produce & Veg</option>
                  <option value="Dry Goods & Flour">Dry Goods & Flour</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Dairy & Fats">Dairy & Fats</option>
                  <option value="Spices & Sauces">Spices & Sauces</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Unit of Measure</label>
                <select
                  value={newItemUnit}
                  onChange={e => setNewItemUnit(e.target.value as InventoryItem['unit'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="L">Liters (L)</option>
                  <option value="bottles">Bottles</option>
                  <option value="pieces">Pieces</option>
                  <option value="packets">Packets</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Initial Stock</label>
                <input
                  type="number"
                  step="any"
                  value={newItemStock}
                  onChange={e => setNewItemStock(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Min Alert</label>
                <input
                  type="number"
                  step="any"
                  value={newItemThreshold}
                  onChange={e => setNewItemThreshold(e.target.value)}
                  placeholder="5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Unit Cost (KES)</label>
                <input
                  type="number"
                  value={newItemCost}
                  onChange={e => setNewItemCost(e.target.value)}
                  placeholder="150"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Supplier Name</label>
              <input
                type="text"
                value={newItemSupplier}
                onChange={e => setNewItemSupplier(e.target.value)}
                placeholder="e.g. Wakulima Market, Farmer's Choice"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddItemOpen(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950"
              >
                Save Stock Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
