import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ChefHat, 
  Layers, 
  Clock, 
  AlertCircle, 
  X,
  CreditCard,
  MessageSquare,
  Sparkles,
  Percent,
  Check
} from 'lucide-react';
import { 
  MenuItem, 
  MenuCategory, 
  Order, 
  OrderItem, 
  OrderType, 
  Table, 
  InventoryItem 
} from '../types';
import { formatKES, calculateKenyanTaxes } from '../utils/formatters';

interface RegisterViewProps {
  menu: MenuItem[];
  inventory: InventoryItem[];
  tables: Table[];
  currentOrder: Order;
  setCurrentOrder: React.Dispatch<React.SetStateAction<Order>>;
  onPayClick: () => void;
  onSendToKitchen: () => void;
  onHoldOrder: () => void;
  onClearOrder: () => void;
  onSelectTable: (table: Table) => void;
  vatRatePercent: number;
  cateringLevyPercent: number;
}

const CATEGORIES: MenuCategory[] = [
  'All',
  'Grills & Nyama',
  'Swahili Dishes',
  'Fast Food & Bites',
  'Traditional & Sides',
  'Beverages & Beers',
  'Breakfast & Cafe',
  'Desserts'
];

export const RegisterView: React.FC<RegisterViewProps> = ({
  menu,
  inventory,
  tables,
  currentOrder,
  setCurrentOrder,
  onPayClick,
  onSendToKitchen,
  onHoldOrder,
  onClearOrder,
  onSelectTable,
  vatRatePercent,
  cateringLevyPercent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItemNoteId, setEditingItemNoteId] = useState<string | null>(null);
  const [itemNoteText, setItemNoteText] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState<'kes' | 'percent'>('kes');
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  // Compute stock availability map for menu items
  const itemAvailability = useMemo(() => {
    const invMap = new Map<string, number>();
    inventory.forEach(inv => invMap.set(inv.id, inv.currentStock));

    const result = new Map<string, { available: boolean; portionsLeft?: number; reason?: string }>();

    menu.forEach(item => {
      if (!item.isAvailable) {
        result.set(item.id, { available: false, reason: 'Manually marked unavailable' });
        return;
      }

      if (!item.recipe || item.recipe.length === 0) {
        result.set(item.id, { available: true });
        return;
      }

      let minPortions = Infinity;
      let bottleneckIngredient = '';

      for (const ingredient of item.recipe) {
        const currentStock = invMap.get(ingredient.inventoryItemId) ?? 0;
        const possiblePortions = Math.floor(currentStock / ingredient.quantityNeeded);
        if (possiblePortions < minPortions) {
          minPortions = possiblePortions;
          const invObj = inventory.find(i => i.id === ingredient.inventoryItemId);
          bottleneckIngredient = invObj?.name || 'ingredient';
        }
      }

      if (minPortions <= 0) {
        result.set(item.id, { 
          available: false, 
          portionsLeft: 0, 
          reason: `Out of ${bottleneckIngredient}` 
        });
      } else {
        result.set(item.id, { 
          available: true, 
          portionsLeft: minPortions 
        });
      }
    });

    return result;
  }, [menu, inventory]);

  // Filtered menu items
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  // Recalculate order totals whenever items or discount change
  const updateOrderTotals = (items: OrderItem[], discountKes: number = currentOrder.discountKes) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalKes, 0);
    const effectiveTotal = Math.max(0, subtotal - discountKes + currentOrder.serviceChargeKes);
    const taxes = calculateKenyanTaxes(effectiveTotal, vatRatePercent, cateringLevyPercent);

    setCurrentOrder(prev => ({
      ...prev,
      items,
      subtotalKes: subtotal,
      discountKes,
      vatAmountKes: taxes.vatAmountKes,
      cateringLevyAmountKes: taxes.cateringLevyAmountKes,
      totalKes: effectiveTotal,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleAddItem = (item: MenuItem) => {
    const avail = itemAvailability.get(item.id);
    if (avail && !avail.available) return;

    const existingIndex = currentOrder.items.findIndex(i => i.menuItemId === item.id);
    let newItems: OrderItem[];

    if (existingIndex > -1) {
      newItems = currentOrder.items.map((it, idx) => {
        if (idx === existingIndex) {
          const newQty = it.quantity + 1;
          return {
            ...it,
            quantity: newQty,
            totalKes: newQty * it.unitPriceKes
          };
        }
        return it;
      });
    } else {
      const newItem: OrderItem = {
        id: `ord-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        unitPriceKes: item.priceKes,
        totalKes: item.priceKes
      };
      newItems = [...currentOrder.items, newItem];
    }

    updateOrderTotals(newItems);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const newItems = currentOrder.items
      .map(it => {
        if (it.id === itemId) {
          const newQty = it.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...it,
            quantity: newQty,
            totalKes: newQty * it.unitPriceKes
          };
        }
        return it;
      })
      .filter((it): it is OrderItem => it !== null);

    updateOrderTotals(newItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = currentOrder.items.filter(it => it.id !== itemId);
    updateOrderTotals(newItems);
  };

  const handleSaveItemNote = (itemId: string) => {
    const newItems = currentOrder.items.map(it => {
      if (it.id === itemId) {
        return { ...it, notes: itemNoteText.trim() || undefined };
      }
      return it;
    });
    updateOrderTotals(newItems);
    setEditingItemNoteId(null);
    setItemNoteText('');
  };

  const handleApplyDiscount = () => {
    const val = parseFloat(discountInput);
    if (isNaN(val) || val <= 0) {
      updateOrderTotals(currentOrder.items, 0);
      setIsDiscountModalOpen(false);
      return;
    }

    let discountAmountKes = 0;
    if (discountType === 'percent') {
      const percent = Math.min(100, val);
      discountAmountKes = Math.round((currentOrder.subtotalKes * percent) / 100);
    } else {
      discountAmountKes = Math.min(currentOrder.subtotalKes, Math.round(val));
    }

    updateOrderTotals(currentOrder.items, discountAmountKes);
    setIsDiscountModalOpen(false);
    setDiscountInput('');
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-57px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* LEFT/CENTER: Menu & Category Browser */}
      <div className="flex-1 flex flex-col border-r border-slate-800 overflow-hidden">
        {/* Search & Categories Bar */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Nyama, Biryani, Chai, Sodas, Tilapia..."
                className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Section Counters */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{filteredMenu.length} dishes</span>
              <span>·</span>
              <span className="text-amber-400">All prices in KES</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredMenu.map(item => {
            const avail = itemAvailability.get(item.id);
            const isOutOfStock = avail ? !avail.available : false;
            const portionsLeft = avail?.portionsLeft;
            const isLowStock = portionsLeft !== undefined && portionsLeft > 0 && portionsLeft <= 5;

            return (
              <button
                key={item.id}
                onClick={() => handleAddItem(item)}
                disabled={isOutOfStock}
                className={`group relative flex flex-col text-left rounded-xl border p-3 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 hover:shadow-md cursor-pointer'
                }`}
              >
                {/* Image or Themed Header */}
                <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-950 mb-2.5 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-850 to-slate-950 text-slate-400 p-2 text-center">
                      <ChefHat className="w-6 h-6 mb-1 text-amber-500/60" />
                      <span className="text-[11px] font-medium text-slate-400 line-clamp-1">{item.category}</span>
                    </div>
                  )}

                  {/* Prep time badge */}
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur-xs text-[10px] text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    {item.preparationTimeMinutes}m
                  </span>

                  {/* Stock status indicator */}
                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 text-center">
                      <span className="text-xs font-bold text-red-400">
                        {avail?.reason || 'Sold Out'}
                      </span>
                    </div>
                  ) : isLowStock ? (
                    <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      Only {portionsLeft} left
                    </span>
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Price in KES */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums">
                      {formatKES(item.priceKes)}
                    </span>
                    <span className="w-6 h-6 rounded-md bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-slate-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Order Cart & Terminal Checkout */}
      <div className="w-full lg:w-[410px] xl:w-[450px] bg-slate-900 flex flex-col h-full border-t lg:border-t-0 shrink-0">
        {/* Cart Header */}
        <div className="p-3.5 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">{currentOrder.orderNumber}</span>
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono">
                  {currentOrder.tableName || 'Dine-In'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Server: {currentOrder.waiterName || currentOrder.cashierName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {currentOrder.items.length > 0 && (
                <button
                  onClick={onClearOrder}
                  className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded border border-red-900/40 transition-colors"
                  title="Clear Cart"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Order Type & Table Selection */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(['dine-in', 'takeaway', 'delivery'] as OrderType[]).map(type => (
              <button
                key={type}
                onClick={() => {
                  setCurrentOrder(prev => ({
                    ...prev,
                    orderType: type,
                    tableName: type === 'takeaway' ? 'Takeaway' : type === 'delivery' ? 'Delivery' : prev.tableName || 'T-01'
                  }));
                }}
                className={`py-1.5 text-center capitalize font-medium rounded-md transition-colors ${
                  currentOrder.orderType === type
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Table Selector Dropdown (for dine-in) */}
          {currentOrder.orderType === 'dine-in' && (
            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 shrink-0">Table:</span>
              <select
                value={currentOrder.tableId || ''}
                onChange={e => {
                  const selected = tables.find(t => t.id === e.target.value);
                  if (selected) {
                    onSelectTable(selected);
                  }
                }}
                className="bg-transparent text-white w-full focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-slate-900">Select Table</option>
                {tables.map(tbl => (
                  <option key={tbl.id} value={tbl.id} className="bg-slate-900">
                    {tbl.number} ({tbl.section} - {tbl.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {currentOrder.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ChefHat className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">Order is empty</p>
              <p className="text-xs text-slate-500 mt-1">
                Tap items on the left to add dishes to this ticket
              </p>
            </div>
          ) : (
            currentOrder.items.map(item => (
              <div
                key={item.id}
                className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white block truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {formatKES(item.unitPriceKes)} each
                    </span>
                    {item.notes && (
                      <span className="text-[11px] text-amber-300/90 block italic mt-0.5">
                        Note: {item.notes}
                      </span>
                    )}
                  </div>

                  {/* Item Total */}
                  <span className="text-xs font-bold text-white font-mono tabular-nums shrink-0">
                    {formatKES(item.totalKes)}
                  </span>
                </div>

                {/* Inline Modifier & Stepper Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                  <button
                    onClick={() => {
                      setEditingItemNoteId(item.id);
                      setItemNoteText(item.notes || '');
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{item.notes ? 'Edit Note' : 'Add Note'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono px-2 text-white min-w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-6 h-6 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Note Edit Modal Overlay */}
                {editingItemNoteId === item.id && (
                  <div className="mt-2 p-2 bg-slate-900 rounded border border-amber-500/40 space-y-2">
                    <input
                      type="text"
                      value={itemNoteText}
                      onChange={e => setItemNoteText(e.target.value)}
                      placeholder="e.g. Extra chili, no onions, take-away pack..."
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingItemNoteId(null)}
                        className="text-[11px] px-2 py-0.5 rounded text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveItemNote(item.id)}
                        className="text-[11px] px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bill Calculations & Taxes */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums text-slate-200">
              {formatKES(currentOrder.subtotalKes)}
            </span>
          </div>

          {currentOrder.discountKes > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount</span>
              <span className="font-mono tabular-nums">
                -{formatKES(currentOrder.discountKes)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Kenya VAT (16% incl.)</span>
            <span className="font-mono tabular-nums">
              {formatKES(currentOrder.vatAmountKes)}
            </span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Catering Levy (2% incl.)</span>
            <span className="font-mono tabular-nums">
              {formatKES(currentOrder.cateringLevyAmountKes)}
            </span>
          </div>

          {/* Large Total Row */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white">Total Amount Due</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono tabular-nums">
              {formatKES(currentOrder.totalKes)}
            </span>
          </div>

          {/* Quick Tools: Discount & Split */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 flex items-center justify-center gap-1.5 text-xs font-medium"
            >
              <Percent className="w-3 h-3 text-amber-400" />
              <span>{currentOrder.discountKes > 0 ? 'Edit Discount' : 'Discount'}</span>
            </button>

            <button
              onClick={() => setIsSplitModalOpen(true)}
              disabled={currentOrder.items.length === 0}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 flex items-center justify-center gap-1.5 text-xs font-medium disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Split Bill</span>
            </button>
          </div>

          {/* Bottom Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onHoldOrder}
              disabled={currentOrder.items.length === 0}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Hold Order</span>
            </button>

            <button
              onClick={onSendToKitchen}
              disabled={currentOrder.items.length === 0}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Kitchen KOT</span>
            </button>
          </div>

          {/* Massive Primary Charge Button */}
          <button
            onClick={onPayClick}
            disabled={currentOrder.items.length === 0}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-1"
          >
            <CreditCard className="w-5 h-5 text-slate-950" />
            <span>PAY {formatKES(currentOrder.totalKes)}</span>
          </button>
        </div>
      </div>

      {/* DISCOUNT MODAL */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-4 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Apply Order Discount</h3>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setDiscountType('kes')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                  discountType === 'kes' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Fixed KES
              </button>
              <button
                onClick={() => setDiscountType('percent')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                  discountType === 'percent' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Percentage (%)
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {discountType === 'kes' ? 'Amount in KES' : 'Discount Percentage'}
              </label>
              <input
                type="number"
                value={discountInput}
                onChange={e => setDiscountInput(e.target.value)}
                placeholder={discountType === 'kes' ? 'e.g. 200' : 'e.g. 10'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateOrderTotals(currentOrder.items, 0);
                  setIsDiscountModalOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Remove Discount
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPLIT BILL MODAL */}
      {isSplitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-4 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Split Bill Evenly</h3>
              <button
                onClick={() => setIsSplitModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-xs text-slate-400">Total Bill</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {formatKES(currentOrder.totalKes)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Number of Guests / Splits</label>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold font-mono text-white w-10 text-center">
                  {splitCount}
                </span>
                <button
                  onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Each Person Pays</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {formatKES(Math.ceil(currentOrder.totalKes / splitCount))}
              </div>
            </div>

            <button
              onClick={() => setIsSplitModalOpen(false)}
              className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
