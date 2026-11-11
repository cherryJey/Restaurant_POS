import { 
  MenuItem, 
  InventoryItem, 
  Table, 
  RestaurantSettings, 
  Order, 
  ShiftRegister,
  InventoryLog 
} from '../types';

export const INITIAL_SETTINGS: RestaurantSettings = {
  name: 'Simba Grill & African Kitchen',
  tagline: 'Authentic Kenyan Charcoal Grill & Swahili Delicacies',
  branch: 'Nairobi CBD Branch',
  address: 'Plot 42, Kimathi Street, Nairobi Central, Kenya',
  phone: '+254 712 345 678',
  kraPin: 'P051839201Z',
  mpesaTillNumber: '894 102',
  mpesaPaybillNumber: '522522 (Acc: SIMBA)',
  vatRatePercent: 16,
  cateringLevyPercent: 2,
  serviceChargePercent: 0,
  currencySymbol: 'KES',
  receiptFooterNote: 'Asante sana kwa kututembelea! Karibu tena.'
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Fresh Goat Meat (Mbuzi)',
    category: 'Meats & Poultry',
    currentStock: 28.5,
    minThreshold: 10.0,
    unit: 'kg',
    unitCostKes: 680,
    supplier: 'Kiserian Livestock Co-op',
    lastRestockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inv-2',
    name: 'Prime Beef Cuts',
    category: 'Meats & Poultry',
    currentStock: 18.0,
    minThreshold: 8.0,
    unit: 'kg',
    unitCostKes: 540,
    supplier: 'Dagoretti Meats Ltd',
    lastRestockedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'inv-3',
    name: 'Fresh Chicken Portions',
    category: 'Meats & Poultry',
    currentStock: 14.5,
    minThreshold: 6.0,
    unit: 'kg',
    unitCostKes: 480,
    supplier: 'Kenchic Poultry Depot',
    lastRestockedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'inv-4',
    name: 'Lake Victoria Fresh Tilapia',
    category: 'Meats & Poultry',
    currentStock: 12,
    minThreshold: 5,
    unit: 'pieces',
    unitCostKes: 420,
    supplier: 'Kisumu Fish Traders Ltd',
    lastRestockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inv-5',
    name: 'Irish Potatoes (Nyandarua)',
    category: 'Produce & Veg',
    currentStock: 45.0,
    minThreshold: 15.0,
    unit: 'kg',
    unitCostKes: 95,
    supplier: 'Kinangop Farmers Direct',
    lastRestockedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'inv-6',
    name: 'Sukuma Wiki & Spinach Bunches',
    category: 'Produce & Veg',
    currentStock: 16.0,
    minThreshold: 5.0,
    unit: 'kg',
    unitCostKes: 60,
    supplier: 'Wakulima Market Traders',
    lastRestockedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'inv-7',
    name: 'Tomatoes & Red Onions',
    category: 'Produce & Veg',
    currentStock: 22.0,
    minThreshold: 8.0,
    unit: 'kg',
    unitCostKes: 110,
    supplier: 'Wakulima Market Traders',
    lastRestockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inv-8',
    name: 'Maize Flour (Unga ya Ugali)',
    category: 'Dry Goods & Flour',
    currentStock: 35.0,
    minThreshold: 10.0,
    unit: 'kg',
    unitCostKes: 120,
    supplier: 'Unga Limited Kenya',
    lastRestockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'inv-9',
    name: 'Basmati Rice Fragrant',
    category: 'Dry Goods & Flour',
    currentStock: 24.0,
    minThreshold: 8.0,
    unit: 'kg',
    unitCostKes: 220,
    supplier: 'Mwea Rice Millers',
    lastRestockedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'inv-10',
    name: 'Wheat Flour (All Purpose)',
    category: 'Dry Goods & Flour',
    currentStock: 19.0,
    minThreshold: 6.0,
    unit: 'kg',
    unitCostKes: 130,
    supplier: 'Mombasa Maize Millers',
    lastRestockedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'inv-11',
    name: 'Vegetable Cooking Oil',
    category: 'Dairy & Fats',
    currentStock: 25.0,
    minThreshold: 8.0,
    unit: 'L',
    unitCostKes: 290,
    supplier: 'Bidco Africa Ltd',
    lastRestockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'inv-12',
    name: 'Fresh Cow Milk',
    category: 'Dairy & Fats',
    currentStock: 14.0,
    minThreshold: 5.0,
    unit: 'L',
    unitCostKes: 90,
    supplier: 'New KCC Dairy',
    lastRestockedAt: new Date().toISOString(),
  },
  {
    id: 'inv-13',
    name: 'Pure Raw Honey & Fresh Ginger',
    category: 'Spices & Sauces',
    currentStock: 5.2,
    minThreshold: 2.0,
    unit: 'kg',
    unitCostKes: 650,
    supplier: 'Baringo Honey Co-op',
    lastRestockedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'inv-14',
    name: 'Tusker Lager 500ml',
    category: 'Beverages',
    currentStock: 48,
    minThreshold: 18,
    unit: 'bottles',
    unitCostKes: 220,
    supplier: 'East African Breweries Ltd',
    lastRestockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inv-15',
    name: 'White Cap Crisp 500ml',
    category: 'Beverages',
    currentStock: 32,
    minThreshold: 12,
    unit: 'bottles',
    unitCostKes: 230,
    supplier: 'East African Breweries Ltd',
    lastRestockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inv-16',
    name: 'Assorted Sodas 500ml Glass',
    category: 'Beverages',
    currentStock: 64,
    minThreshold: 24,
    unit: 'bottles',
    unitCostKes: 75,
    supplier: 'Nairobi Bottlers Ltd',
    lastRestockedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Nyama Choma 1kg (Goat)',
    category: 'Grills & Nyama',
    priceKes: 1400,
    costKes: 720,
    description: 'Charcoal grilled tender mbuzi served with fresh tomato-onion kachumbari and spicy pili pili.',
    image: '/src/assets/images/nyama_choma_plate_1794381187266.jpg',
    isAvailable: true,
    preparationTimeMinutes: 25,
    recipe: [
      { inventoryItemId: 'inv-1', quantityNeeded: 1.0, unit: 'kg' },
      { inventoryItemId: 'inv-7', quantityNeeded: 0.15, unit: 'kg' }
    ]
  },
  {
    id: 'menu-2',
    name: 'Nyama Choma 1/2kg (Goat)',
    category: 'Grills & Nyama',
    priceKes: 750,
    costKes: 380,
    description: 'Half-portion succulent roasted goat meat with zesty kachumbari.',
    image: '/src/assets/images/nyama_choma_plate_1794381187266.jpg',
    isAvailable: true,
    preparationTimeMinutes: 20,
    recipe: [
      { inventoryItemId: 'inv-1', quantityNeeded: 0.5, unit: 'kg' },
      { inventoryItemId: 'inv-7', quantityNeeded: 0.1, unit: 'kg' }
    ]
  },
  {
    id: 'menu-3',
    name: 'Swahili Chicken Biryani',
    category: 'Swahili Dishes',
    priceKes: 650,
    costKes: 280,
    description: 'Fragrant saffron basmati rice with slow-cooked chicken drumstick in coastal spiced masala & egg.',
    image: '/src/assets/images/swahili_biryani_rice_1794381188329.jpg',
    isAvailable: true,
    preparationTimeMinutes: 15,
    recipe: [
      { inventoryItemId: 'inv-3', quantityNeeded: 0.35, unit: 'kg' },
      { inventoryItemId: 'inv-9', quantityNeeded: 0.25, unit: 'kg' },
      { inventoryItemId: 'inv-7', quantityNeeded: 0.1, unit: 'kg' }
    ]
  },
  {
    id: 'menu-4',
    name: 'Chips Masala',
    category: 'Fast Food & Bites',
    priceKes: 350,
    costKes: 120,
    description: 'Crispy potato chips tossed in rich savory garlic, tomato, chili gravy with fresh lime and coriander.',
    image: '/src/assets/images/chips_masala_dish_1794381187955.jpg',
    isAvailable: true,
    preparationTimeMinutes: 12,
    recipe: [
      { inventoryItemId: 'inv-5', quantityNeeded: 0.35, unit: 'kg' },
      { inventoryItemId: 'inv-11', quantityNeeded: 0.05, unit: 'L' },
      { inventoryItemId: 'inv-7', quantityNeeded: 0.08, unit: 'kg' }
    ]
  },
  {
    id: 'menu-5',
    name: 'Lake Victoria Whole Tilapia Fry',
    category: 'Traditional & Sides',
    priceKes: 950,
    costKes: 480,
    description: 'Crispy deep-fried whole fresh tilapia paired with steaming ugali, sautéed greens, and kachumbari.',
    isAvailable: true,
    preparationTimeMinutes: 22,
    recipe: [
      { inventoryItemId: 'inv-4', quantityNeeded: 1, unit: 'pieces' },
      { inventoryItemId: 'inv-8', quantityNeeded: 0.2, unit: 'kg' },
      { inventoryItemId: 'inv-6', quantityNeeded: 0.2, unit: 'kg' },
      { inventoryItemId: 'inv-11', quantityNeeded: 0.08, unit: 'L' }
    ]
  },
  {
    id: 'menu-6',
    name: 'Beef Stew & Ugali Sukuma',
    category: 'Traditional & Sides',
    priceKes: 480,
    costKes: 220,
    description: 'Rich, thick beef stew served with stone-ground white ugali and shredded sukuma wiki greens.',
    isAvailable: true,
    preparationTimeMinutes: 15,
    recipe: [
      { inventoryItemId: 'inv-2', quantityNeeded: 0.28, unit: 'kg' },
      { inventoryItemId: 'inv-8', quantityNeeded: 0.2, unit: 'kg' },
      { inventoryItemId: 'inv-6', quantityNeeded: 0.2, unit: 'kg' }
    ]
  },
  {
    id: 'menu-7',
    name: 'Chapati (Pair) with Dengu / Ndengu',
    category: 'Traditional & Sides',
    priceKes: 280,
    costKes: 110,
    description: 'Two flaky, layered soft Kenyan chapatis served with seasoned green grams (ndengu) stew.',
    isAvailable: true,
    preparationTimeMinutes: 10,
    recipe: [
      { inventoryItemId: 'inv-10', quantityNeeded: 0.25, unit: 'kg' },
      { inventoryItemId: 'inv-11', quantityNeeded: 0.04, unit: 'L' }
    ]
  },
  {
    id: 'menu-8',
    name: 'Crispy Beef Samosas (3 pcs)',
    category: 'Fast Food & Bites',
    priceKes: 210,
    costKes: 85,
    description: 'Golden triangular pastry pockets filled with minced spiced beef, spring onions, and cumin.',
    isAvailable: true,
    preparationTimeMinutes: 8,
    recipe: [
      { inventoryItemId: 'inv-2', quantityNeeded: 0.15, unit: 'kg' },
      { inventoryItemId: 'inv-10', quantityNeeded: 0.1, unit: 'kg' },
      { inventoryItemId: 'inv-11', quantityNeeded: 0.03, unit: 'L' }
    ]
  },
  {
    id: 'menu-9',
    name: 'Kenyan Dawa Tea (Honey & Lemon)',
    category: 'Breakfast & Cafe',
    priceKes: 250,
    costKes: 80,
    description: 'Immunity-boosting hot concoction made with crushed ginger, fresh lemon slices, and sweet organic honey.',
    image: '/src/assets/images/chai_dawa_tea_1794381188422.jpg',
    isAvailable: true,
    preparationTimeMinutes: 6,
    recipe: [
      { inventoryItemId: 'inv-13', quantityNeeded: 0.05, unit: 'kg' }
    ]
  },
  {
    id: 'menu-10',
    name: 'Masala Chai ya Maziwa',
    category: 'Breakfast & Cafe',
    priceKes: 180,
    costKes: 55,
    description: 'Spiced boiled cow milk tea infused with crushed ginger, cinnamon, and cardamoms.',
    isAvailable: true,
    preparationTimeMinutes: 7,
    recipe: [
      { inventoryItemId: 'inv-12', quantityNeeded: 0.25, unit: 'L' }
    ]
  },
  {
    id: 'menu-11',
    name: 'Tusker Lager 500ml (Baridi)',
    category: 'Beverages & Beers',
    priceKes: 320,
    costKes: 220,
    description: 'Ice-cold Kenya signature Tusker brewed from 100% African ingredients.',
    isAvailable: true,
    preparationTimeMinutes: 2,
    recipe: [
      { inventoryItemId: 'inv-14', quantityNeeded: 1, unit: 'bottles' }
    ]
  },
  {
    id: 'menu-12',
    name: 'White Cap Crisp 500ml',
    category: 'Beverages & Beers',
    priceKes: 340,
    costKes: 230,
    description: 'Crisp, refreshing light premium lager with no added sugar.',
    isAvailable: true,
    preparationTimeMinutes: 2,
    recipe: [
      { inventoryItemId: 'inv-15', quantityNeeded: 1, unit: 'bottles' }
    ]
  },
  {
    id: 'menu-13',
    name: 'Stoney Tangawizi / Coke 500ml',
    category: 'Beverages & Beers',
    priceKes: 120,
    costKes: 75,
    description: 'Chilled 500ml glass bottle soda (Stoney, Coke, Fanta, Sprite).',
    isAvailable: true,
    preparationTimeMinutes: 1,
    recipe: [
      { inventoryItemId: 'inv-16', quantityNeeded: 1, unit: 'bottles' }
    ]
  },
  {
    id: 'menu-14',
    name: 'Fresh Passion Juice 500ml',
    category: 'Beverages & Beers',
    priceKes: 220,
    costKes: 70,
    description: 'Freshly squeezed natural passion fruit juice served chilled.',
    isAvailable: true,
    preparationTimeMinutes: 4
  },
  {
    id: 'menu-15',
    name: 'Coastal Mahamri (3 pcs)',
    category: 'Desserts',
    priceKes: 160,
    costKes: 50,
    description: 'Swahili cardamom and coconut milk fluffy golden fried donuts.',
    isAvailable: true,
    preparationTimeMinutes: 5,
    recipe: [
      { inventoryItemId: 'inv-10', quantityNeeded: 0.15, unit: 'kg' },
      { inventoryItemId: 'inv-11', quantityNeeded: 0.03, unit: 'L' }
    ]
  }
];

export const INITIAL_TABLES: Table[] = [
  { id: 'tbl-1', number: 'T-01', section: 'Main Dining', capacity: 2, status: 'occupied', activeOrderId: 'ord-today-live-1' },
  { id: 'tbl-2', number: 'T-02', section: 'Main Dining', capacity: 4, status: 'available' },
  { id: 'tbl-3', number: 'T-03', section: 'Main Dining', capacity: 4, status: 'available' },
  { id: 'tbl-4', number: 'T-04', section: 'Main Dining', capacity: 6, status: 'bill_requested' },
  { id: 'tbl-5', number: 'T-05', section: 'Main Dining', capacity: 4, status: 'available' },
  { id: 'tbl-6', number: 'T-06', section: 'Main Dining', capacity: 8, status: 'reserved' },
  { id: 'tbl-7', number: 'G-01', section: 'Garden Terrace', capacity: 4, status: 'available' },
  { id: 'tbl-8', number: 'G-02', section: 'Garden Terrace', capacity: 4, status: 'occupied', activeOrderId: 'ord-today-live-2' },
  { id: 'tbl-9', number: 'G-03', section: 'Garden Terrace', capacity: 6, status: 'available' },
  { id: 'tbl-10', number: 'B-01', section: 'Sports Bar', capacity: 2, status: 'available' },
  { id: 'tbl-11', number: 'B-02', section: 'Sports Bar', capacity: 2, status: 'available' },
  { id: 'tbl-12', number: 'VIP-1', section: 'VIP Lounge', capacity: 10, status: 'available' }
];

const now = new Date();
const todayDateStr = now.toISOString().split('T')[0];

export const INITIAL_SHIFT: ShiftRegister = {
  id: 'shift-today-01',
  cashierName: 'Grace Wanjiku',
  role: 'Cashier',
  openedAt: `${todayDateStr}T07:30:00.000Z`,
  openingFloatKes: 5000,
  cashSalesKes: 4680,
  mpesaSalesKes: 14250,
  cardSalesKes: 3100,
  cashDropsKes: 0,
  expectedCashKes: 9680,
  status: 'open'
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-past-1',
    orderNumber: '#ORD-1041',
    kotNumber: 'KOT-089',
    tableId: 'tbl-2',
    tableName: 'T-02',
    orderType: 'dine-in',
    status: 'paid',
    items: [
      { id: 'item-1', menuItemId: 'menu-1', name: 'Nyama Choma 1kg (Goat)', quantity: 1, unitPriceKes: 1400, totalKes: 1400, notes: 'Medium well, extra kachumbari' },
      { id: 'item-2', menuItemId: 'menu-4', name: 'Chips Masala', quantity: 2, unitPriceKes: 350, totalKes: 700 },
      { id: 'item-3', menuItemId: 'menu-11', name: 'Tusker Lager 500ml (Baridi)', quantity: 3, unitPriceKes: 320, totalKes: 960 }
    ],
    subtotalKes: 3060,
    vatRatePercent: 16,
    vatAmountKes: 422.07,
    cateringLevyPercent: 2,
    cateringLevyAmountKes: 52.76,
    discountKes: 0,
    serviceChargeKes: 0,
    totalKes: 3060,
    paymentDetails: {
      method: 'mpesa',
      timestamp: `${todayDateStr}T11:45:00.000Z`,
      mpesaRef: 'SK9218HG82',
      mpesaPhone: '0722123456'
    },
    cashierName: 'Grace Wanjiku',
    waiterName: 'Mercy Otieno',
    createdAt: `${todayDateStr}T11:15:00.000Z`,
    updatedAt: `${todayDateStr}T11:45:00.000Z`,
    completedAt: `${todayDateStr}T11:45:00.000Z`,
    isKitchenSent: true
  },
  {
    id: 'ord-past-2',
    orderNumber: '#ORD-1042',
    kotNumber: 'KOT-090',
    tableName: 'Takeaway Walk-in',
    orderType: 'takeaway',
    status: 'paid',
    items: [
      { id: 'item-4', menuItemId: 'menu-3', name: 'Swahili Chicken Biryani', quantity: 2, unitPriceKes: 650, totalKes: 1300 },
      { id: 'item-5', menuItemId: 'menu-9', name: 'Kenyan Dawa Tea (Honey & Lemon)', quantity: 2, unitPriceKes: 250, totalKes: 500 }
    ],
    subtotalKes: 1800,
    vatRatePercent: 16,
    vatAmountKes: 248.28,
    cateringLevyPercent: 2,
    cateringLevyAmountKes: 31.03,
    discountKes: 0,
    serviceChargeKes: 0,
    totalKes: 1800,
    paymentDetails: {
      method: 'cash',
      timestamp: `${todayDateStr}T12:20:00.000Z`,
      cashTenderedKes: 2000,
      changeKes: 200
    },
    cashierName: 'Grace Wanjiku',
    waiterName: 'John Kamau',
    createdAt: `${todayDateStr}T12:05:00.000Z`,
    updatedAt: `${todayDateStr}T12:20:00.000Z`,
    completedAt: `${todayDateStr}T12:20:00.000Z`,
    isKitchenSent: true
  },
  {
    id: 'ord-past-3',
    orderNumber: '#ORD-1043',
    kotNumber: 'KOT-091',
    tableId: 'tbl-3',
    tableName: 'T-03',
    orderType: 'dine-in',
    status: 'paid',
    items: [
      { id: 'item-6', menuItemId: 'menu-5', name: 'Lake Victoria Whole Tilapia Fry', quantity: 2, unitPriceKes: 950, totalKes: 1900 },
      { id: 'item-7', menuItemId: 'menu-6', name: 'Beef Stew & Ugali Sukuma', quantity: 1, unitPriceKes: 480, totalKes: 480 },
      { id: 'item-8', menuItemId: 'menu-13', name: 'Stoney Tangawizi / Coke 500ml', quantity: 3, unitPriceKes: 120, totalKes: 360 },
      { id: 'item-9', menuItemId: 'menu-12', name: 'White Cap Crisp 500ml', quantity: 1, unitPriceKes: 340, totalKes: 340 }
    ],
    subtotalKes: 3080,
    vatRatePercent: 16,
    vatAmountKes: 424.83,
    cateringLevyPercent: 2,
    cateringLevyAmountKes: 53.10,
    discountKes: 0,
    serviceChargeKes: 0,
    totalKes: 3080,
    paymentDetails: {
      method: 'card',
      timestamp: `${todayDateStr}T13:10:00.000Z`,
      cardRef: 'AUTH-VISA-99321'
    },
    cashierName: 'Grace Wanjiku',
    waiterName: 'Mercy Otieno',
    createdAt: `${todayDateStr}T12:30:00.000Z`,
    updatedAt: `${todayDateStr}T13:10:00.000Z`,
    completedAt: `${todayDateStr}T13:10:00.000Z`,
    isKitchenSent: true
  },
  {
    id: 'ord-past-4',
    orderNumber: '#ORD-1044',
    kotNumber: 'KOT-092',
    tableName: 'Express Counter',
    orderType: 'takeaway',
    status: 'paid',
    items: [
      { id: 'item-10', menuItemId: 'menu-8', name: 'Crispy Beef Samosas (3 pcs)', quantity: 3, unitPriceKes: 210, totalKes: 630 },
      { id: 'item-11', menuItemId: 'menu-10', name: 'Masala Chai ya Maziwa', quantity: 2, unitPriceKes: 180, totalKes: 360 }
    ],
    subtotalKes: 990,
    vatRatePercent: 16,
    vatAmountKes: 136.55,
    cateringLevyPercent: 2,
    cateringLevyAmountKes: 17.07,
    discountKes: 0,
    serviceChargeKes: 0,
    totalKes: 990,
    paymentDetails: {
      method: 'mpesa',
      timestamp: `${todayDateStr}T13:45:00.000Z`,
      mpesaRef: 'QK88390XKP',
      mpesaPhone: '0711987654'
    },
    cashierName: 'Grace Wanjiku',
    waiterName: 'John Kamau',
    createdAt: `${todayDateStr}T13:35:00.000Z`,
    updatedAt: `${todayDateStr}T13:45:00.000Z`,
    completedAt: `${todayDateStr}T13:45:00.000Z`,
    isKitchenSent: true
  },
  // Live Active Order in Kitchen / Table 1
  {
    id: 'ord-today-live-1',
    orderNumber: '#ORD-1045',
    kotNumber: 'KOT-093',
    tableId: 'tbl-1',
    tableName: 'T-01',
    orderType: 'dine-in',
    status: 'preparing',
    items: [
      { id: 'item-12', menuItemId: 'menu-1', name: 'Nyama Choma 1kg (Goat)', quantity: 1, unitPriceKes: 1400, totalKes: 1400, notes: 'Very spicy pili pili separate' },
      { id: 'item-13', menuItemId: 'menu-4', name: 'Chips Masala', quantity: 1, unitPriceKes: 350, totalKes: 350 },
      { id: 'item-14', menuItemId: 'menu-11', name: 'Tusker Lager 500ml (Baridi)', quantity: 2, unitPriceKes: 320, totalKes: 640 }
    ],
    subtotalKes: 2390,
    vatRatePercent: 16,
    vatAmountKes: 329.66,
    cateringLevyPercent: 2,
    cateringLevyAmountKes: 41.21,
    discountKes: 0,
    serviceChargeKes: 0,
    totalKes: 2390,
    cashierName: 'Grace Wanjiku',
    waiterName: 'Mercy Otieno',
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), // 14 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    isKitchenSent: true
  },
  // Live Active Order on Garden Terrace Table G-02
  {
    id: 'ord-today-live-2',
    orderNumber: '#ORD-1046',
    kotNumber: 'KOT-094',
    tableId: 'tbl-8',
    tableName: 'G-02',
    orderType: 'dine-in',
    status: 'ready',
    items: [
      { id: 'item-15', menuItemId: 'menu-3', name: 'Swahili Chicken Biryani', quantity: 1, unitPriceKes: 650, totalKes: 650 },
      { id: 'item-16', menuItemId: 'menu-9', name: 'Kenyan Dawa Tea (Honey & Lemon)', quantity: 1, unitPriceKes: 250, totalKes: 250 }
    ],
    subtotalKes: 900,
    vatRatePercent: 16,
    vatAmountKes: 124.14,
    cateringLevyPercent: 2,
    cateringLevyAmountKes: 15.52,
    discountKes: 0,
    serviceChargeKes: 0,
    totalKes: 900,
    cashierName: 'Grace Wanjiku',
    waiterName: 'John Kamau',
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(), // 22 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isKitchenSent: true
  }
];

export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 'log-1',
    inventoryItemId: 'inv-1',
    itemName: 'Fresh Goat Meat (Mbuzi)',
    type: 'restock',
    quantityChange: 30.0,
    previousStock: 0,
    newStock: 30.0,
    reason: 'Weekly delivery from Kiserian',
    costKes: 20400,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    recordedBy: 'Grace Wanjiku'
  },
  {
    id: 'log-2',
    inventoryItemId: 'inv-1',
    itemName: 'Fresh Goat Meat (Mbuzi)',
    type: 'sale_deduction',
    quantityChange: -1.0,
    previousStock: 30.0,
    newStock: 29.0,
    reason: 'Order #ORD-1041',
    timestamp: `${todayDateStr}T11:45:00.000Z`,
    recordedBy: 'System Auto-Deduct'
  },
  {
    id: 'log-3',
    inventoryItemId: 'inv-5',
    itemName: 'Irish Potatoes (Nyandarua)',
    type: 'wastage',
    quantityChange: -2.0,
    previousStock: 47.0,
    newStock: 45.0,
    reason: 'Damaged / bruised on delivery inspection',
    costKes: 190,
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    recordedBy: 'Grace Wanjiku'
  }
];
