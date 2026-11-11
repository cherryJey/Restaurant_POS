import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart, 
  CheckCircle,
  Eye,
  X
} from 'lucide-react';
import { Order, ZReport, RestaurantSettings } from '../types';
import { formatKES, formatDateTime, compileZReport } from '../utils/formatters';

interface ReportsViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  cashierName: string;
  onViewReceipt: (order: Order) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  settings,
  cashierName,
  onViewReceipt
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'zreport' | 'transactions'>('daily');
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);

  // Filter orders for chosen date
  const dateOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = (o.completedAt || o.createdAt).split('T')[0];
      return orderDate === selectedDate;
    });
  }, [orders, selectedDate]);

  const paidDateOrders = useMemo(() => {
    return dateOrders.filter(o => o.status === 'paid');
  }, [dateOrders]);

  // Aggregate metrics
  const grossSalesKes = paidDateOrders.reduce((sum, o) => sum + o.totalKes, 0);
  const totalVatKes = paidDateOrders.reduce((sum, o) => sum + (o.vatAmountKes || 0), 0);
  const totalCateringLevyKes = paidDateOrders.reduce((sum, o) => sum + (o.cateringLevyAmountKes || 0), 0);
  const totalDiscountsKes = paidDateOrders.reduce((sum, o) => sum + (o.discountKes || 0), 0);
  const netSalesKes = grossSalesKes - (totalVatKes + totalCateringLevyKes);
  const totalOrdersCount = paidDateOrders.length;
  const averageTicketKes = totalOrdersCount > 0 ? Math.round(grossSalesKes / totalOrdersCount) : 0;

  // Hourly distribution (10am to 10pm)
  const hourlyData = useMemo(() => {
    const hours = [
      { hour: '10:00', label: '10 AM', revenueKes: 0, count: 0 },
      { hour: '11:00', label: '11 AM', revenueKes: 0, count: 0 },
      { hour: '12:00', label: '12 PM', revenueKes: 0, count: 0 },
      { hour: '13:00', label: '1 PM', revenueKes: 0, count: 0 },
      { hour: '14:00', label: '2 PM', revenueKes: 0, count: 0 },
      { hour: '15:00', label: '3 PM', revenueKes: 0, count: 0 },
      { hour: '16:00', label: '4 PM', revenueKes: 0, count: 0 },
      { hour: '17:00', label: '5 PM', revenueKes: 0, count: 0 },
      { hour: '18:00', label: '6 PM', revenueKes: 0, count: 0 },
      { hour: '19:00', label: '7 PM', revenueKes: 0, count: 0 },
      { hour: '20:00', label: '8 PM', revenueKes: 0, count: 0 },
      { hour: '21:00', label: '9 PM', revenueKes: 0, count: 0 },
    ];

    paidDateOrders.forEach(o => {
      const d = new Date(o.completedAt || o.createdAt);
      const h = d.getHours();
      const targetIdx = h - 10;
      if (targetIdx >= 0 && targetIdx < hours.length) {
        hours[targetIdx].revenueKes += o.totalKes;
        hours[targetIdx].count += 1;
      }
    });

    const maxRevenue = Math.max(...hours.map(h => h.revenueKes), 1000);
    return { hours, maxRevenue };
  }, [paidDateOrders]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    let mpesa = 0;
    let cash = 0;
    let card = 0;
    let mpesaCount = 0;
    let cashCount = 0;
    let cardCount = 0;

    paidDateOrders.forEach(o => {
      const method = o.paymentDetails?.method;
      if (method === 'mpesa') {
        mpesa += o.totalKes;
        mpesaCount++;
      } else if (method === 'cash') {
        cash += o.totalKes;
        cashCount++;
      } else if (method === 'card') {
        card += o.totalKes;
        cardCount++;
      } else if (method === 'split' && o.paymentDetails?.splitDetails) {
        mpesa += o.paymentDetails.splitDetails.mpesaKes || 0;
        cash += o.paymentDetails.splitDetails.cashKes || 0;
        mpesaCount++;
        cashCount++;
      }
    });

    return { mpesa, cash, card, mpesaCount, cashCount, cardCount };
  }, [paidDateOrders]);

  // Top Selling Items
  const topItems = useMemo(() => {
    const map = new Map<string, { quantity: number; revenueKes: number }>();
    paidDateOrders.forEach(o => {
      o.items.forEach(it => {
        const existing = map.get(it.name) || { quantity: 0, revenueKes: 0 };
        map.set(it.name, {
          quantity: existing.quantity + it.quantity,
          revenueKes: existing.revenueKes + it.totalKes
        });
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenueKes - a.revenueKes);
  }, [paidDateOrders]);

  // Generated Official Z-Report
  const zReportData: ZReport = useMemo(() => {
    return compileZReport(orders, selectedDate, cashierName, 1);
  }, [orders, selectedDate, cashierName]);

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Type', 'Table', 'Status', 'Payment Method', 'M-Pesa Ref', 'Total KES', 'VAT KES'];
    const rows = dateOrders.map(o => [
      o.orderNumber,
      formatDateTime(o.createdAt),
      o.orderType,
      o.tableName || 'N/A',
      o.status,
      o.paymentDetails?.method || 'unpaid',
      o.paymentDetails?.mpesaRef || '',
      o.totalKes,
      o.vatAmountKes || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SimbaPOS_Daily_Sales_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header & Date Selector */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Daily Sales Reports & Analytics (KES)
            </h2>
          </div>
        </div>

        {/* Date Selector & Subtabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
          >
            Today
          </button>

          {/* Export & Z-Report Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsZReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-950" />
            <span>End-of-Day Z-Report</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3.5 sm:p-4 bg-slate-900/60 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Gross Revenue</span>
          <div className="text-xl font-extrabold font-mono text-amber-400 mt-1 tabular-nums">
            {formatKES(grossSalesKes)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {totalOrdersCount} paid tickets
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Net Sales (Excl. Tax)</span>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatKES(netSalesKes)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Core food & drink revenue
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Kenya VAT (16%)</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatKES(totalVatKes)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            KRA Output Tax collected
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Catering Levy (2%)</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatKES(totalCateringLevyKes)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Tourism Fund contribution
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Average Ticket</span>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {formatKES(averageTicketKes)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Per dining table / order
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">M-PESA Share</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {grossSalesKes > 0 ? Math.round((paymentBreakdown.mpesa / grossSalesKes) * 100) : 0}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
            {formatKES(paymentBreakdown.mpesa)}
          </span>
        </div>
      </div>

      {/* Main Reports Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* Hourly Distribution & Payment Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* HOURLY BAR CHART */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Hourly Sales Volume & Rush Times</h3>
                  <span className="text-xs text-slate-400">Peak dining hours for {selectedDate}</span>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  Total: {formatKES(grossSalesKes)}
                </span>
              </div>

              {/* Bar Chart Representation */}
              <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-slate-800">
                {hourlyData.hours.map((h, i) => {
                  const heightPercent = Math.max(8, Math.round((h.revenueKes / hourlyData.maxRevenue) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      {h.revenueKes > 0 && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-amber-400 font-mono tabular-nums whitespace-nowrap">
                          {formatKES(h.revenueKes)}
                        </span>
                      )}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-7 rounded-t transition-all ${
                          h.revenueKes > 0
                            ? 'bg-amber-500 group-hover:bg-amber-400'
                            : 'bg-slate-800/60'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {h.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500 font-mono">
              <span>Opens 10:00 AM</span>
              <span>Lunch Rush: 12:00 PM – 2:00 PM</span>
              <span>Dinner Rush: 6:00 PM – 9:00 PM</span>
            </div>
          </div>

          {/* PAYMENT METHOD SPLIT */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Payment Method Share</h3>
              <span className="text-xs text-slate-400">Settlements for {selectedDate}</span>

              <div className="space-y-3.5 mt-5">
                {/* M-PESA */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-emerald-400">M-PESA (Till / STK)</span>
                    <span className="font-mono text-white font-bold">{formatKES(paymentBreakdown.mpesa)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${grossSalesKes > 0 ? (paymentBreakdown.mpesa / grossSalesKes) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{paymentBreakdown.mpesaCount} transactions</span>
                    <span>{grossSalesKes > 0 ? Math.round((paymentBreakdown.mpesa / grossSalesKes) * 100) : 0}%</span>
                  </div>
                </div>

                {/* CASH */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-amber-400">Cash in Drawer</span>
                    <span className="font-mono text-white font-bold">{formatKES(paymentBreakdown.cash)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${grossSalesKes > 0 ? (paymentBreakdown.cash / grossSalesKes) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{paymentBreakdown.cashCount} transactions</span>
                    <span>{grossSalesKes > 0 ? Math.round((paymentBreakdown.cash / grossSalesKes) * 100) : 0}%</span>
                  </div>
                </div>

                {/* CARD */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-blue-400">Credit / Debit Card (PDQ)</span>
                    <span className="font-mono text-white font-bold">{formatKES(paymentBreakdown.card)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${grossSalesKes > 0 ? (paymentBreakdown.card / grossSalesKes) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{paymentBreakdown.cardCount} transactions</span>
                    <span>{grossSalesKes > 0 ? Math.round((paymentBreakdown.card / grossSalesKes) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
              <span>All amounts collected in Kenyan Shillings (KES)</span>
            </div>
          </div>
        </div>

        {/* Top Dishes & Order Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Top Selling Dishes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Best-Selling Menu Items</h3>
            <span className="text-xs text-slate-400 block">Ranked by revenue</span>

            <div className="space-y-2.5 pt-2">
              {topItems.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center">
                  No sales recorded on this date.
                </div>
              ) : (
                topItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div>
                      <span className="text-xs font-bold text-white block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.quantity} portions sold</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 font-mono tabular-nums">
                      {formatKES(item.revenueKes)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Orders Ledger */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Transactions Ledger ({dateOrders.length})</h3>
                <span className="text-xs text-slate-400">Order history for {selectedDate}</span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Table/Type</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Total (KES)</th>
                    <th className="py-2.5 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {dateOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {o.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {formatDateTime(o.completedAt || o.createdAt).split(' ')[1]}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {o.tableName || o.orderType}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="uppercase text-[11px] font-mono text-amber-400">
                          {o.paymentDetails?.method || (o.status === 'paid' ? 'Paid' : 'Unpaid')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white tabular-nums">
                        {formatKES(o.totalKes)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {o.status === 'paid' && (
                          <button
                            onClick={() => onViewReceipt(o)}
                            className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL END-OF-DAY Z-REPORT MODAL */}
      {isZReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-mono font-bold block">
                  OFFICIAL FISCAL END-OF-DAY CLOSURE
                </span>
                <span className="text-sm font-bold text-white">{zReportData.reportNumber}</span>
              </div>
              <button
                onClick={() => setIsZReportModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thermal Z-Report Output Paper */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-950/60">
              <div className="bg-white text-slate-950 p-6 rounded-lg shadow-xl font-mono text-[11px] leading-relaxed w-full max-w-[340px] border border-slate-200 select-all print-only">
                <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-slate-300">
                  <h2 className="font-extrabold text-sm uppercase text-black">{settings.name}</h2>
                  <p className="text-[10px] text-slate-600">{settings.branch}</p>
                  <p className="text-[10px] text-slate-600">KRA PIN: {settings.kraPin}</p>
                  <div className="pt-1 font-bold text-xs text-black">
                    *** OFFICIAL Z-REPORT ***
                  </div>
                  <p className="text-[10px] text-slate-700">REPORT NO: {zReportData.reportNumber}</p>
                  <p className="text-[10px] text-slate-700">DATE: {selectedDate}</p>
                  <p className="text-[10px] text-slate-700">GENERATED: {formatDateTime(zReportData.generatedAt)}</p>
                  <p className="text-[10px] text-slate-700">CASHIER / MANAGER: {cashierName}</p>
                </div>

                {/* Sales Section */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
                  <div className="font-bold text-black uppercase pb-0.5">FINANCIAL SUMMARY (KES)</div>
                  <div className="flex justify-between">
                    <span>GROSS SALES:</span>
                    <span className="font-bold">{formatKES(zReportData.grossSalesKes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DISCOUNTS:</span>
                    <span>-{formatKES(zReportData.discountsTotalKes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NET SALES:</span>
                    <span className="font-bold">{formatKES(zReportData.netSalesKes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT 16%:</span>
                    <span>{formatKES(zReportData.vatTotalKes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CATERING LEVY 2%:</span>
                    <span>{formatKES(zReportData.cateringLevyTotalKes)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-extrabold text-xs text-black">
                    <span>TOTAL AUDITED:</span>
                    <span>{formatKES(zReportData.grossSalesKes)}</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
                  <div className="font-bold text-black uppercase pb-0.5">PAYMENT METHODS</div>
                  <div className="flex justify-between">
                    <span>M-PESA ({zReportData.paymentBreakdown.mpesaCount} txs):</span>
                    <span className="font-bold">{formatKES(zReportData.paymentBreakdown.mpesaKes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CASH DRAWER ({zReportData.paymentBreakdown.cashCount} txs):</span>
                    <span className="font-bold">{formatKES(zReportData.paymentBreakdown.cashKes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CARD PDQ ({zReportData.paymentBreakdown.cardCount} txs):</span>
                    <span className="font-bold">{formatKES(zReportData.paymentBreakdown.cardKes)}</span>
                  </div>
                </div>

                {/* Order Counts */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>TOTAL ORDERS:</span>
                    <span>{zReportData.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AVERAGE TICKET:</span>
                    <span>{formatKES(zReportData.averageOrderValueKes)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 text-center space-y-1">
                  <p className="text-[9.5px] text-slate-500 uppercase">
                    END OF FINANCIAL DAY AUDIT · SIGN OFF REQUIRED
                  </p>
                  <div className="pt-4 border-t border-slate-300 flex justify-between text-[10px]">
                    <span>Manager Sign: ___________</span>
                    <span>Date: _________</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Z-Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
