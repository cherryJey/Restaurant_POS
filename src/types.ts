/**
 * SimbaPOS Restaurant POS & Inventory Types
 * All monetary amounts are in Kenyan Shillings (KES)
 */

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';

export type PaymentMethod = 'mpesa' | 'cash' | 'card' | 'split';

export type MenuCategory = 
  | 'All'
  | 'Grills & Nyama'
  | 'Swahili Dishes'
  | 'Fast Food & Bites'
  | 'Traditional & Sides'
  | 'Beverages & Beers'
  | 'Breakfast & Cafe'
  | 'Desserts';

export interface RecipeIngredient {
  inventoryItemId: string;
  quantityNeeded: number; // e.g. 0.5 kg, 1 bottle
  unit: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  priceKes: number;
  costKes: number; // Cost of goods
  description: string;
  image?: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  recipe?: RecipeIngredient[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPriceKes: number;
  totalKes: number;
  notes?: string;
  modifiers?: string[];
}

export interface PaymentDetails {
  method: PaymentMethod;
  timestamp: string;
  mpesaRef?: string;
  mpesaPhone?: string;
  cashTenderedKes?: number;
  changeKes?: number;
  cardRef?: string;
  splitDetails?: {
    mpesaKes?: number;
    cashKes?: number;
    cardKes?: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #ORD-1048
  kotNumber?: string;  // Kitchen Order Ticket #
  tableId?: string;
  tableName?: string;
  orderType: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotalKes: number;
  vatRatePercent: number; // 16% in Kenya
  vatAmountKes: number;
  cateringLevyPercent: number; // 2% in Kenya
  cateringLevyAmountKes: number;
  discountKes: number;
  discountReason?: string;
  serviceChargeKes: number;
  totalKes: number;
  paymentDetails?: PaymentDetails;
  cashierName: string;
  waiterName?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isKitchenSent: boolean;
}

export interface Table {
  id: string;
  number: string;
  section: 'Main Dining' | 'Garden Terrace' | 'Sports Bar' | 'VIP Lounge';
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'bill_requested';
  activeOrderId?: string;
  seatedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Meats & Poultry' | 'Produce & Veg' | 'Dry Goods & Flour' | 'Beverages' | 'Dairy & Fats' | 'Spices & Sauces';
  currentStock: number;
  minThreshold: number;
  unit: 'kg' | 'L' | 'bottles' | 'pieces' | 'packets';
  unitCostKes: number;
  supplier: string;
  lastRestockedAt: string;
}

export type InventoryLogType = 'sale_deduction' | 'restock' | 'wastage' | 'audit_adjustment';

export interface InventoryLog {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: InventoryLogType;
  quantityChange: number; // negative for deduction, positive for restock
  previousStock: number;
  newStock: number;
  reason?: string;
  costKes?: number;
  timestamp: string;
  recordedBy: string;
}

export interface ShiftRegister {
  id: string;
  cashierName: string;
  role: 'Cashier' | 'Manager' | 'Supervisor';
  openedAt: string;
  closedAt?: string;
  openingFloatKes: number;
  cashSalesKes: number;
  mpesaSalesKes: number;
  cardSalesKes: number;
  cashDropsKes: number; // payouts / cash dropped into safe
  expectedCashKes: number;
  actualCashCountKes?: number;
  cashVarianceKes?: number;
  notes?: string;
  status: 'open' | 'closed';
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  branch: string;
  address: string;
  phone: string;
  kraPin: string; // Kenyan Revenue Authority Tax PIN
  mpesaTillNumber: string;
  mpesaPaybillNumber: string;
  vatRatePercent: number; // 16%
  cateringLevyPercent: number; // 2%
  serviceChargePercent: number;
  currencySymbol: string; // "KES"
  receiptFooterNote: string;
}

export interface ZReport {
  id: string;
  reportNumber: string; // e.g. Z-2026-0312
  date: string;
  generatedAt: string;
  generatedBy: string;
  grossSalesKes: number;
  netSalesKes: number;
  vatTotalKes: number;
  cateringLevyTotalKes: number;
  discountsTotalKes: number;
  serviceChargeTotalKes: number;
  totalOrders: number;
  averageOrderValueKes: number;
  paymentBreakdown: {
    mpesaKes: number;
    mpesaCount: number;
    cashKes: number;
    cashCount: number;
    cardKes: number;
    cardCount: number;
    splitKes: number;
    splitCount: number;
  };
  orderTypeBreakdown: {
    dineInKes: number;
    dineInCount: number;
    takeawayKes: number;
    takeawayCount: number;
    deliveryKes: number;
    deliveryCount: number;
  };
  categoryBreakdown: {
    category: string;
    itemsSold: number;
    revenueKes: number;
  }[];
  topItems: {
    name: string;
    quantity: number;
    revenueKes: number;
  }[];
}
