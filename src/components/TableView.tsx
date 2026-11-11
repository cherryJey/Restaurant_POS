import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Clock, 
  Utensils, 
  CheckCircle2, 
  Plus, 
  CreditCard,
  X
} from 'lucide-react';
import { Table, Order } from '../types';
import { formatKES } from '../utils/formatters';

interface TableViewProps {
  tables: Table[];
  orders: Order[];
  onSelectTableForOrder: (table: Table) => void;
  onUpdateTableStatus: (tableId: string, status: Table['status']) => void;
  onAddTable: (newTable: Table) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tables,
  orders,
  onSelectTableForOrder,
  onUpdateTableStatus,
  onAddTable
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newSection, setNewSection] = useState<Table['section']>('Main Dining');
  const [newCapacity, setNewCapacity] = useState(4);

  const sections = ['All', 'Main Dining', 'Garden Terrace', 'Sports Bar', 'VIP Lounge'];

  const filteredTables = tables.filter(t => {
    if (selectedSection === 'All') return true;
    return t.section === selectedSection;
  });

  const getActiveOrderForTable = (table: Table): Order | undefined => {
    return orders.find(o => o.tableId === table.id && o.status !== 'paid' && o.status !== 'cancelled');
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;

    const newTbl: Table = {
      id: `tbl-${Date.now()}`,
      number: newNumber.trim().toUpperCase(),
      section: newSection,
      capacity: newCapacity,
      status: 'available'
    };

    onAddTable(newTbl);
    setNewNumber('');
    setIsAddTableOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Bar */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Restaurant Floor Plan & Tables
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {tables.filter(t => t.status === 'occupied').length} / {tables.length} occupied
          </span>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedSection === sec
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Add Table Button */}
        <button
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add Table</span>
        </button>
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredTables.map(tbl => {
          const activeOrder = getActiveOrderForTable(tbl);
          const isOccupied = tbl.status === 'occupied' || !!activeOrder;
          const isBillRequested = tbl.status === 'bill_requested';
          const isReserved = tbl.status === 'reserved';

          let statusBg = 'bg-slate-900 border-slate-800 hover:border-slate-700';
          let statusText = 'text-emerald-400';
          let statusLabel = 'Available';

          if (isOccupied) {
            statusBg = 'bg-amber-950/20 border-amber-600/60 hover:border-amber-500';
            statusText = 'text-amber-400';
            statusLabel = 'Occupied';
          } else if (isBillRequested) {
            statusBg = 'bg-purple-950/30 border-purple-600/70 hover:border-purple-500';
            statusText = 'text-purple-400';
            statusLabel = 'Bill Requested';
          } else if (isReserved) {
            statusBg = 'bg-blue-950/20 border-blue-600/60 hover:border-blue-500';
            statusText = 'text-blue-400';
            statusLabel = 'Reserved';
          }

          return (
            <div
              key={tbl.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-sm ${statusBg}`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold font-mono text-white">
                    {tbl.number}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Users className="w-3.5 h-3.5" />
                    <span>{tbl.capacity}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {tbl.section}
                </span>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    isOccupied ? 'bg-amber-400' : isBillRequested ? 'bg-purple-400' : isReserved ? 'bg-blue-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`text-xs font-semibold ${statusText}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Order Info (if occupied) */}
              <div className="my-3 py-2 border-t border-slate-800/80">
                {activeOrder ? (
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-mono block">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="text-sm font-extrabold text-amber-400 font-mono tabular-nums block">
                      {formatKES(activeOrder.totalKes)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {activeOrder.items.length} items ordered
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    Ready for new guests
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => onSelectTableForOrder(tbl)}
                  className="w-full py-2 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isOccupied ? 'View / Add Order' : 'Seat Guests'}</span>
                </button>

                {/* Status Toggle helper */}
                <div className="flex gap-1">
                  {isOccupied ? (
                    <button
                      onClick={() => onUpdateTableStatus(tbl.id, 'bill_requested')}
                      className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Print Bill
                    </button>
                  ) : isReserved ? (
                    <button
                      onClick={() => onUpdateTableStatus(tbl.id, 'available')}
                      className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    >
                      Release
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateTableStatus(tbl.id, 'reserved')}
                      className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                    >
                      Reserve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TABLE MODAL */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewTable}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Add Restaurant Table</h3>
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Table Number / Label</label>
              <input
                type="text"
                value={newNumber}
                onChange={e => setNewNumber(e.target.value)}
                placeholder="e.g. T-07, G-05, VIP-2"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm uppercase focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Floor Section</label>
              <select
                value={newSection}
                onChange={e => setNewSection(e.target.value as Table['section'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none"
              >
                <option value="Main Dining">Main Dining</option>
                <option value="Garden Terrace">Garden Terrace</option>
                <option value="Sports Bar">Sports Bar</option>
                <option value="VIP Lounge">VIP Lounge</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Seating Capacity</label>
              <input
                type="number"
                min="1"
                max="24"
                value={newCapacity}
                onChange={e => setNewCapacity(parseInt(e.target.value) || 2)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950"
              >
                Add Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
