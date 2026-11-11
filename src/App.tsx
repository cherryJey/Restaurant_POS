/**
 * SimbaPOS - Complete Restaurant Point of Sale & Inventory System
 * All prices and accounts in Kenyan Shillings (KES)
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_SETTINGS, 
  INITIAL_INVENTORY, 
  INITIAL_MENU, 
  INITIAL_TABLES, 
  INITIAL_SHIFT, 
  INITIAL_ORDERS,
  INITIAL_INVENTORY_LOGS 
} from './data/initialData';
import { 
  MenuItem, 
  InventoryItem, 
  Table, 
  RestaurantSettings, 
  Order, 
  ShiftRegister, 
  InventoryLog, 
  PaymentDetails,
  OrderStatus 
} from './types';
import { calculateKenyanTaxes } from './utils/formatters';

// Components
import { Header } from './components/Header';
import { RegisterView } from './components/RegisterView';
import { TableView } from './components/TableView';
import { KitchenDisplayView } from './components/KitchenDisplayView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { ShiftRegisterModal } from './components/ShiftRegisterModal';
import { SettingsModal } from './components/SettingsModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { StaffModal } from './components/StaffModal';
import { HeldOrdersModal } from './components/HeldOrdersModal';

export default function App() {
  // Local storage initializers
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem('simbapos_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('simbapos_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('simbapos_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('simbapos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('simbapos_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    const saved = localStorage.getItem('simbapos_logs');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_LOGS;
  });

  const [shift, setShift] = useState<ShiftRegister>(() => {
    const saved = localStorage.getItem('simbapos_shift');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT;
  });

  const [heldOrders, setHeldOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('simbapos_held_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'pos' | 'tables' | 'kitchen' | 'inventory' | 'reports' | 'shift' | 'settings'>('pos');

  // Active Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState(false);

  // Helper to generate a new blank order
  const createBlankOrder = (assignedTable?: Table): Order => {
    const nextOrderNum = `#ORD-${1040 + orders.length + heldOrders.length + 1}`;
    const nextKotNum = `KOT-${String(orders.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    return {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: nextOrderNum,
      kotNumber: nextKotNum,
      tableId: assignedTable ? assignedTable.id : 'tbl-1',
      tableName: assignedTable ? assignedTable.number : 'T-01',
      orderType: assignedTable ? 'dine-in' : 'dine-in',
      status: 'new',
      items: [],
      subtotalKes: 0,
      vatRatePercent: settings.vatRatePercent,
      vatAmountKes: 0,
      cateringLevyPercent: settings.cateringLevyPercent,
      cateringLevyAmountKes: 0,
      discountKes: 0,
      serviceChargeKes: 0,
      totalKes: 0,
      cashierName: shift.cashierName,
      createdAt: nowIso,
      updatedAt: nowIso,
      isKitchenSent: false
    };
  };

  const [currentOrder, setCurrentOrder] = useState<Order>(() => createBlankOrder());

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('simbapos_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('simbapos_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('simbapos_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('simbapos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('simbapos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('simbapos_logs', JSON.stringify(inventoryLogs));
  }, [inventoryLogs]);

  useEffect(() => {
    localStorage.setItem('simbapos_shift', JSON.stringify(shift));
  }, [shift]);

  useEffect(() => {
    localStorage.setItem('simbapos_held_orders', JSON.stringify(heldOrders));
  }, [heldOrders]);

  // Low stock counter
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minThreshold).length;

  // Active kitchen orders
  const activeKitchenOrdersCount = orders.filter(
    o => o.isKitchenSent && (o.status === 'new' || o.status === 'preparing' || o.status === 'ready')
  ).length;

  // Inventory Auto-Deduction on Order Payment
  const deductInventoryForOrder = (orderToDeduct: Order) => {
    const updatedInventory = [...inventory];
    const newLogs: InventoryLog[] = [];
    const nowIso = new Date().toISOString();

    orderToDeduct.items.forEach(orderItem => {
      const dish = menu.find(m => m.id === orderItem.menuItemId);
      if (!dish || !dish.recipe) return;

      dish.recipe.forEach(ingredient => {
        const invIndex = updatedInventory.findIndex(i => i.id === ingredient.inventoryItemId);
        if (invIndex > -1) {
          const invItem = updatedInventory[invIndex];
          const totalDeduction = ingredient.quantityNeeded * orderItem.quantity;
          const previous = invItem.currentStock;
          const next = Math.max(0, Math.round((previous - totalDeduction) * 100) / 100);

          updatedInventory[invIndex] = {
            ...invItem,
            currentStock: next
          };

          newLogs.push({
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            inventoryItemId: invItem.id,
            itemName: invItem.name,
            type: 'sale_deduction',
            quantityChange: -totalDeduction,
            previousStock: previous,
            newStock: next,
            reason: `Order ${orderToDeduct.orderNumber} (${orderItem.quantity}x ${dish.name})`,
            timestamp: nowIso,
            recordedBy: 'SimbaPOS Auto-Deduct'
          });
        }
      });
    });

    setInventory(updatedInventory);
    if (newLogs.length > 0) {
      setInventoryLogs(prev => [...newLogs, ...prev]);
    }
  };

  // Complete Payment Handler
  const handleCompletePayment = (paymentDetails: PaymentDetails) => {
    const completedAt = new Date().toISOString();
    const paidOrder: Order = {
      ...currentOrder,
      status: 'paid',
      paymentDetails,
      completedAt,
      updatedAt: completedAt,
      isKitchenSent: true
    };

    // 1. Record completed order
    setOrders(prev => [paidOrder, ...prev.filter(o => o.id !== paidOrder.id)]);

    // 2. Deduct recipe ingredients from stock
    deductInventoryForOrder(paidOrder);

    // 3. Update active Shift register cash drawer
    setShift(prev => {
      let cashSales = prev.cashSalesKes;
      let mpesaSales = prev.mpesaSalesKes;
      let cardSales = prev.cardSalesKes;

      if (paymentDetails.method === 'cash') {
        cashSales += paidOrder.totalKes;
      } else if (paymentDetails.method === 'mpesa') {
        mpesaSales += paidOrder.totalKes;
      } else if (paymentDetails.method === 'card') {
        cardSales += paidOrder.totalKes;
      } else if (paymentDetails.method === 'split' && paymentDetails.splitDetails) {
        cashSales += paymentDetails.splitDetails.cashKes || 0;
        mpesaSales += paymentDetails.splitDetails.mpesaKes || 0;
        cardSales += paymentDetails.splitDetails.cardKes || 0;
      }

      return {
        ...prev,
        cashSalesKes: cashSales,
        mpesaSalesKes: mpesaSales,
        cardSalesKes: cardSales,
        expectedCashKes: prev.openingFloatKes + cashSales - prev.cashDropsKes
      };
    });

    // 4. Free table if assigned
    if (paidOrder.tableId) {
      setTables(prev => prev.map(t => {
        if (t.id === paidOrder.tableId) {
          return { ...t, status: 'available', activeOrderId: undefined };
        }
        return t;
      }));
    }

    // 5. Open Thermal Receipt Preview
    setIsPaymentModalOpen(false);
    setReceiptOrder(paidOrder);

    // 6. Reset current order to blank
    setCurrentOrder(createBlankOrder());
  };

  // Send Order to Kitchen (without taking payment immediately for dine-in)
  const handleSendToKitchen = () => {
    if (currentOrder.items.length === 0) return;

    const updated: Order = {
      ...currentOrder,
      status: 'new',
      isKitchenSent: true,
      updatedAt: new Date().toISOString()
    };

    // Save or update order in orders array
    setOrders(prev => {
      const exists = prev.some(o => o.id === updated.id);
      if (exists) {
        return prev.map(o => o.id === updated.id ? updated : o);
      }
      return [updated, ...prev];
    });

    // Mark table as occupied
    if (updated.tableId) {
      setTables(prev => prev.map(t => {
        if (t.id === updated.tableId) {
          return { ...t, status: 'occupied', activeOrderId: updated.id };
        }
        return t;
      }));
    }

    // Reset current active order
    setCurrentOrder(createBlankOrder());
    setCurrentTab('kitchen');
  };

  // Hold / Park active order
  const handleHoldOrder = () => {
    if (currentOrder.items.length === 0) return;
    setHeldOrders(prev => [currentOrder, ...prev]);
    setCurrentOrder(createBlankOrder());
  };

  // Resume held order
  const handleResumeHeldOrder = (orderToResume: Order) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderToResume.id));
    setCurrentOrder(orderToResume);
    setCurrentTab('pos');
  };

  // Delete held order
  const handleDeleteHeldOrder = (orderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Select Table from Table floor plan
  const handleSelectTableFromFloor = (table: Table) => {
    // If table has active order, load that order!
    const activeOrd = orders.find(o => o.tableId === table.id && o.status !== 'paid' && o.status !== 'cancelled');

    if (activeOrd) {
      setCurrentOrder(activeOrd);
    } else {
      setCurrentOrder(prev => ({
        ...prev,
        tableId: table.id,
        tableName: table.number,
        orderType: 'dine-in'
      }));
    }
    setCurrentTab('pos');
  };

  // Update Kitchen order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));
  };

  // Inventory actions
  const handleRestock = (itemId: string, quantityAdded: number, costKes: number, reason: string) => {
    const nowIso = new Date().toISOString();
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const previous = item.currentStock;
        const next = previous + quantityAdded;

        // Log
        setInventoryLogs(logs => [
          {
            id: `log-${Date.now()}`,
            inventoryItemId: item.id,
            itemName: item.name,
            type: 'restock',
            quantityChange: quantityAdded,
            previousStock: previous,
            newStock: next,
            reason,
            costKes,
            timestamp: nowIso,
            recordedBy: shift.cashierName
          },
          ...logs
        ]);

        return {
          ...item,
          currentStock: next,
          lastRestockedAt: nowIso
        };
      }
      return item;
    }));
  };

  const handleRecordWastage = (itemId: string, quantityLost: number, reason: string) => {
    const nowIso = new Date().toISOString();
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const previous = item.currentStock;
        const next = Math.max(0, previous - quantityLost);

        // Log
        setInventoryLogs(logs => [
          {
            id: `log-${Date.now()}`,
            inventoryItemId: item.id,
            itemName: item.name,
            type: 'wastage',
            quantityChange: -quantityLost,
            previousStock: previous,
            newStock: next,
            reason,
            costKes: quantityLost * item.unitCostKes,
            timestamp: nowIso,
            recordedBy: shift.cashierName
          },
          ...logs
        ]);

        return {
          ...item,
          currentStock: next
        };
      }
      return item;
    }));
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setInventory(INITIAL_INVENTORY);
    setMenu(INITIAL_MENU);
    setTables(INITIAL_TABLES);
    setOrders(INITIAL_ORDERS);
    setInventoryLogs(INITIAL_INVENTORY_LOGS);
    setShift(INITIAL_SHIFT);
    setHeldOrders([]);
    setCurrentOrder(createBlankOrder());
    setCurrentTab('pos');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeKitchenOrdersCount={activeKitchenOrdersCount}
        lowStockCount={lowStockCount}
        activeShift={shift}
        heldOrdersCount={heldOrders.length}
        onOpenHeldOrders={() => setIsHeldOrdersModalOpen(true)}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
      />

      {/* Main Viewport Router */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentTab === 'pos' && (
          <RegisterView
            menu={menu}
            inventory={inventory}
            tables={tables}
            currentOrder={currentOrder}
            setCurrentOrder={setCurrentOrder}
            onPayClick={() => setIsPaymentModalOpen(true)}
            onSendToKitchen={handleSendToKitchen}
            onHoldOrder={handleHoldOrder}
            onClearOrder={() => setCurrentOrder(createBlankOrder())}
            onSelectTable={handleSelectTableFromFloor}
            vatRatePercent={settings.vatRatePercent}
            cateringLevyPercent={settings.cateringLevyPercent}
          />
        )}

        {currentTab === 'tables' && (
          <TableView
            tables={tables}
            orders={orders}
            onSelectTableForOrder={handleSelectTableFromFloor}
            onUpdateTableStatus={(tableId, status) => {
              setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
            }}
            onAddTable={(newTable) => {
              setTables(prev => [...prev, newTable]);
            }}
          />
        )}

        {currentTab === 'kitchen' && (
          <KitchenDisplayView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            inventoryLogs={inventoryLogs}
            menu={menu}
            onRestock={handleRestock}
            onRecordWastage={handleRecordWastage}
            onAddNewItem={(newItem) => setInventory(prev => [...prev, newItem])}
            onUpdateItem={(updatedItem) => {
              setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
            }}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            orders={orders}
            settings={settings}
            cashierName={shift.cashierName}
            onViewReceipt={(ord) => setReceiptOrder(ord)}
          />
        )}

        {currentTab === 'shift' && (
          <ShiftRegisterModal
            shift={shift}
            onUpdateShift={setShift}
            isInlineView={true}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onSaveSettings={setSettings}
            onResetDemoData={handleResetDemoData}
            isInlineView={true}
          />
        )}
      </main>

      {/* MODALS */}

      {/* Payment Checkout Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          order={currentOrder}
          mpesaTillNumber={settings.mpesaTillNumber}
          mpesaPaybillNumber={settings.mpesaPaybillNumber}
          onClose={() => setIsPaymentModalOpen(false)}
          onCompletePayment={handleCompletePayment}
        />
      )}

      {/* Thermal Receipt Preview Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          settings={settings}
          onClose={() => setReceiptOrder(null)}
          onNewOrder={() => {
            setReceiptOrder(null);
            setCurrentOrder(createBlankOrder());
            setCurrentTab('pos');
          }}
        />
      )}

      {/* Staff Switch Modal */}
      {isStaffModalOpen && (
        <StaffModal
          currentCashier={shift.cashierName}
          currentRole={shift.role}
          onSwitchStaff={(name, role) => {
            setShift(prev => ({
              ...prev,
              cashierName: name,
              role
            }));
            setCurrentOrder(prev => ({
              ...prev,
              cashierName: name
            }));
          }}
          onClose={() => setIsStaffModalOpen(false)}
        />
      )}

      {/* Held / Parked Orders Modal */}
      {isHeldOrdersModalOpen && (
        <HeldOrdersModal
          heldOrders={heldOrders}
          onResumeOrder={handleResumeHeldOrder}
          onDeleteHeldOrder={handleDeleteHeldOrder}
          onClose={() => setIsHeldOrdersModalOpen(false)}
        />
      )}
    </div>
  );
}
