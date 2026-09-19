import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SellerOrder, OrderStatus, SellerNotification, SellerReturnOrder } from '../types/seller';
import { orderService } from '../services/orderService';
import { catalogService } from '../services/catalogService';
import { notificationService } from '../services/notificationService';
import { returnsService } from '../services/returnsService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { soundService, SoundKey } from '../utils/soundService';
import { StatusSoundsModal } from '../components/navigation/StatusSoundsModal';

interface StoreContextType {
  orders: SellerOrder[];
  isLoadingOrders: boolean;
  activeOrdersCount: number;
  newOrdersCount: number;
  pickingCount: number;
  packedCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReturnsCount: number;
  returns: SellerReturnOrder[];
  unreadNotifCount: number;
  notifications: SellerNotification[];
  soundAlertsEnabled: boolean;
  toggleSoundAlerts: () => void;
  playStatusSound: (key: SoundKey) => void;
  openSoundsModal: () => void;
  isSoundsModalOpen: boolean;
  setIsSoundsModalOpen: (open: boolean) => void;
  acceptOrder: (orderId: string) => Promise<boolean>;
  markOrderReady: (orderId: string) => Promise<boolean>;
  markOrderHandedOver: (orderId: string) => Promise<boolean>;
  markOrderArriving: (orderId: string) => Promise<boolean>;
  markOrderDelivered: (orderId: string) => Promise<boolean>;
  toggleItemPacked: (orderId: string, productId: string, isPacked: boolean) => Promise<void>;
  rejectOrder: (orderId: string, reason: string) => Promise<boolean>;
  simulateIncomingOrder: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [returns, setReturns] = useState<SellerReturnOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(2);
  const [outOfStockCount, setOutOfStockCount] = useState(2);
  const [isSoundsModalOpen, setIsSoundsModalOpen] = useState(false);
  // Sounds are mandatory across the QCOM Seller Hub — no option to disable
  const soundAlertsEnabled = true;
  const { showToast } = useToast();
  const { currentStore } = useAuth();

  const playStatusSound = useCallback((key: SoundKey) => {
    soundService.play(key);
  }, []);

  const openSoundsModal = useCallback(() => {
    setIsSoundsModalOpen(true);
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const [orderRes, notifRes, prodRes, returnsRes] = await Promise.all([
        orderService.getOrders(),
        notificationService.getNotifications(),
        catalogService.getProducts(),
        returnsService.getReturns(),
      ]);

      setOrders(orderRes.data);
      setNotifications(notifRes.data);
      setReturns(returnsRes.data);

      const low = prodRes.data.filter(p => p.status === 'LOW_STOCK').length;
      const out = prodRes.data.filter(p => p.status === 'OUT_OF_STOCK').length;
      setLowStockCount(low);
      setOutOfStockCount(out);
    } catch (err: any) {
      console.error('Error refreshing store orders:', err);
      showToast('Data Error', 'Failed to fetch active store orders.', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders, currentStore?.id]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(
      o => o.status === 'placed' || o.status === 'picking' || o.status === 'packed' || o.status === 'out_for_delivery'
    ).length;
  }, [orders]);

  const newOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'placed').length;
  }, [orders]);

  const pickingCount = useMemo(() => {
    return orders.filter(o => o.status === 'picking').length;
  }, [orders]);

  const packedCount = useMemo(() => {
    return orders.filter(o => o.status === 'packed').length;
  }, [orders]);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const pendingReturnsCount = useMemo(() => {
    return returns.filter(r => r.status === 'requested' || r.status === 'pending_inspection').length;
  }, [returns]);

  const acceptOrder = async (orderId: string): Promise<boolean> => {
    try {
      const res = await orderService.acceptOrder(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      soundService.play('picking');
      showToast('Order Accepted · SLA Started', `Order #${res.data.orderNumber} moved to Picking. Standard 3m SLA timer is running.`, 'success');
      return true;
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
      return false;
    }
  };

  const markOrderReady = async (orderId: string): Promise<boolean> => {
    try {
      const res = await orderService.markOrderReady(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      soundService.play('packed');
      showToast('Ready for Handover', `Order #${res.data.orderNumber} is packed. Rider notified!`, 'success');
      return true;
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
      return false;
    }
  };

  const markOrderHandedOver = async (orderId: string): Promise<boolean> => {
    try {
      const res = await orderService.markOrderHandedOver(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      soundService.play('out_for_delivery');
      showToast('Handover Confirmed', `Order #${res.data.orderNumber} dispatched with EV Courier.`, 'info');
      return true;
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
      return false;
    }
  };

  const markOrderArriving = async (orderId: string): Promise<boolean> => {
    try {
      const res = await orderService.markOrderArriving(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      soundService.play('arriving');
      showToast('Courier Arriving', `Rider is arriving at job-site for order #${res.data.orderNumber}.`, 'info');
      return true;
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
      return false;
    }
  };

  const markOrderDelivered = async (orderId: string): Promise<boolean> => {
    try {
      const res = await orderService.markOrderDelivered(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      soundService.play('delivered');
      showToast('Delivered Successfully', `Order #${res.data.orderNumber} marked as completed!`, 'success');
      return true;
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
      return false;
    }
  };

  const toggleItemPacked = async (orderId: string, productId: string, isPacked: boolean) => {
    try {
      const res = await orderService.toggleItemPacked(orderId, productId, isPacked);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      if (isPacked) {
        soundService.play('item_packed');
      }
    } catch (err: any) {
      showToast('Item Check Error', err.message, 'error');
    }
  };

  const rejectOrder = async (orderId: string, reason: string): Promise<boolean> => {
    try {
      const res = await orderService.rejectOrder(orderId, reason);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      soundService.play('cancelled');
      showToast('Order Rejected', `Order #${res.data.orderNumber} was declined.`, 'warning');
      return true;
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
      return false;
    }
  };

  const simulateIncomingOrder = async () => {
    try {
      const res = await orderService.createSimulatedOrder();
      setOrders(prev => [res.data, ...prev]);
      soundService.play('placed');
      showToast('🔔 New Order Arrived!', `Order #${res.data.orderNumber} · ₹${res.data.total.toFixed(0)}`, 'warning');

      // Also add to notification center
      notificationService.addNotification({
        type: 'NEW_ORDER',
        title: `New Order #${res.data.orderNumber}`,
        message: `${res.data.items.length} items · ₹${res.data.total.toFixed(0)} · Rider assigned`,
        context: 'Urgent customer requirement on site.',
        priority: 'URGENT',
        actionLabel: 'Accept & Pick',
        actionTab: 'orders',
        referenceId: res.data.id,
      }).then(nRes => {
        setNotifications(prev => [nRes.data, ...prev]);
      });
    } catch (err: any) {
      showToast('Simulate Error', err.message, 'error');
    }
  };

  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('Notifications Cleared', 'All alerts marked as read.', 'info');
  };

  const toggleSoundAlerts = () => {
    setIsSoundsModalOpen(true);
    showToast('Mandatory Audio Alerts', 'Audio chimes are mandatory for rapid fulfillment and cannot be disabled.', 'info');
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const res = await catalogService.updateStock(productId, newStock);
      const prodRes = await catalogService.getProducts();
      setLowStockCount(prodRes.data.filter(p => p.status === 'LOW_STOCK').length);
      setOutOfStockCount(prodRes.data.filter(p => p.status === 'OUT_OF_STOCK').length);
      showToast('Inventory Updated', `${res.data.name}: stock set to ${newStock} units.`, 'success');
    } catch (err: any) {
      showToast('Inventory Error', err.message, 'error');
      throw err;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        orders,
        isLoadingOrders,
        activeOrdersCount,
        newOrdersCount,
        pickingCount,
        packedCount,
        lowStockCount,
        outOfStockCount,
        pendingReturnsCount,
        returns,
        unreadNotifCount,
        notifications,
        soundAlertsEnabled,
        toggleSoundAlerts,
        playStatusSound,
        openSoundsModal,
        isSoundsModalOpen,
        setIsSoundsModalOpen,
        acceptOrder,
        markOrderReady,
        markOrderHandedOver,
        markOrderArriving,
        markOrderDelivered,
        toggleItemPacked,
        rejectOrder,
        simulateIncomingOrder,
        refreshOrders,
        markNotificationRead,
        markAllNotificationsRead,
        updateProductStock,
      }}
    >
      {children}
      <StatusSoundsModal
        isOpen={isSoundsModalOpen}
        onClose={() => setIsSoundsModalOpen(false)}
      />
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
