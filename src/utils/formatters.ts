import { Order, ZReport, InventoryItem, InventoryLog } from '../types';

/**
 * Format number into Kenyan Shillings (KES)
 * Example: 1400 -> "KES 1,400"
 */
export function formatKES(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'KES 0';
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

/**
 * Format decimal KES (for unit costs or precise tax)
 */
export function formatKESDecimal(amount: number): string {
  if (isNaN(amount)) return 'KES 0.00';
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generate authentic M-Pesa transaction code (10 characters e.g. SK9281HG72)
 */
export function generateMpesaRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'SK'; // Standard Safaricom current prefix
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

/**
 * Format timestamp into HH:MM AM/PM
 */
export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

/**
 * Format timestamp into DD/MM/YYYY HH:MM
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-KE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return isoString;
  }
}

/**
 * Calculate tax breakdown for inclusive Kenyan prices:
 * Total = Base + VAT (16%) + Catering Levy (2%) = Base * (1 + 0.16 + 0.02) = Base * 1.18
 */
export function calculateKenyanTaxes(totalAmountKes: number, vatPercent = 16, cateringLevyPercent = 2) {
  const totalTaxMultiplier = 1 + (vatPercent + cateringLevyPercent) / 100;
  const netAmount = totalAmountKes / totalTaxMultiplier;
  const vatAmount = (netAmount * vatPercent) / 100;
  const cateringLevyAmount = (netAmount * cateringLevyPercent) / 100;

  return {
    netAmountKes: Math.round(netAmount * 100) / 100,
    vatAmountKes: Math.round(vatAmount * 100) / 100,
    cateringLevyAmountKes: Math.round(cateringLevyAmount * 100) / 100,
  };
}

/**
 * Compile a comprehensive End-of-Day Z-Report from orders
 */
export function compileZReport(
  orders: Order[],
  reportDateStr: string,
  cashierName: string,
  reportSeq: number
): ZReport {
  // Filter orders paid on this date
  const paidOrders = orders.filter(o => {
    if (o.status !== 'paid') return false;
    const orderDate = (o.completedAt || o.createdAt).split('T')[0];
    return orderDate === reportDateStr;
  });

  let grossSalesKes = 0;
  let vatTotalKes = 0;
  let cateringLevyTotalKes = 0;
  let discountsTotalKes = 0;
  let serviceChargeTotalKes = 0;

  const paymentBreakdown = {
    mpesaKes: 0,
    mpesaCount: 0,
    cashKes: 0,
    cashCount: 0,
    cardKes: 0,
    cardCount: 0,
    splitKes: 0,
    splitCount: 0,
  };

  const orderTypeBreakdown = {
    dineInKes: 0,
    dineInCount: 0,
    takeawayKes: 0,
    takeawayCount: 0,
    deliveryKes: 0,
    deliveryCount: 0,
  };

  const itemMap: Record<string, { quantity: number; revenueKes: number }> = {};
  const categoryMap: Record<string, { itemsSold: number; revenueKes: number }> = {};

  paidOrders.forEach(o => {
    grossSalesKes += o.totalKes;
    vatTotalKes += o.vatAmountKes || 0;
    cateringLevyTotalKes += o.cateringLevyAmountKes || 0;
    discountsTotalKes += o.discountKes || 0;
    serviceChargeTotalKes += o.serviceChargeKes || 0;

    // Payment methods
    const method = o.paymentDetails?.method || 'cash';
    if (method === 'mpesa') {
      paymentBreakdown.mpesaKes += o.totalKes;
      paymentBreakdown.mpesaCount += 1;
    } else if (method === 'cash') {
      paymentBreakdown.cashKes += o.totalKes;
      paymentBreakdown.cashCount += 1;
    } else if (method === 'card') {
      paymentBreakdown.cardKes += o.totalKes;
      paymentBreakdown.cardCount += 1;
    } else if (method === 'split') {
      paymentBreakdown.splitKes += o.totalKes;
      paymentBreakdown.splitCount += 1;
      if (o.paymentDetails?.splitDetails) {
        paymentBreakdown.mpesaKes += o.paymentDetails.splitDetails.mpesaKes || 0;
        paymentBreakdown.cashKes += o.paymentDetails.splitDetails.cashKes || 0;
        paymentBreakdown.cardKes += o.paymentDetails.splitDetails.cardKes || 0;
      }
    }

    // Order types
    if (o.orderType === 'dine-in') {
      orderTypeBreakdown.dineInKes += o.totalKes;
      orderTypeBreakdown.dineInCount += 1;
    } else if (o.orderType === 'takeaway') {
      orderTypeBreakdown.takeawayKes += o.totalKes;
      orderTypeBreakdown.takeawayCount += 1;
    } else {
      orderTypeBreakdown.deliveryKes += o.totalKes;
      orderTypeBreakdown.deliveryCount += 1;
    }

    // Items
    o.items.forEach(it => {
      if (!itemMap[it.name]) {
        itemMap[it.name] = { quantity: 0, revenueKes: 0 };
      }
      itemMap[it.name].quantity += it.quantity;
      itemMap[it.name].revenueKes += it.totalKes;
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenueKes - a.revenueKes)
    .slice(0, 10);

  const categoryBreakdown = Object.entries(categoryMap).map(([category, val]) => ({
    category,
    ...val,
  }));

  const netSalesKes = grossSalesKes - (vatTotalKes + cateringLevyTotalKes);
  const totalOrders = paidOrders.length;
  const averageOrderValueKes = totalOrders > 0 ? Math.round(grossSalesKes / totalOrders) : 0;

  return {
    id: `z-${reportDateStr}-${reportSeq}`,
    reportNumber: `Z-${reportDateStr.replace(/-/g, '')}-${String(reportSeq).padStart(3, '0')}`,
    date: reportDateStr,
    generatedAt: new Date().toISOString(),
    generatedBy: cashierName,
    grossSalesKes,
    netSalesKes,
    vatTotalKes,
    cateringLevyTotalKes,
    discountsTotalKes,
    serviceChargeTotalKes,
    totalOrders,
    averageOrderValueKes,
    paymentBreakdown,
    orderTypeBreakdown,
    categoryBreakdown,
    topItems,
  };
}
