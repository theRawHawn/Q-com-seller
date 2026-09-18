import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SellerOrder, OrderStatus, SellerNotification } from '../types/seller';
import { orderService } from '../services/orderService';
import { catalogService } from '../services/catalogService';
import { notificationService } from '../services/notificationService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface StoreContextType {
  orders: SellerOrder[];
  isLoadingOrders: boolean;
  activeOrdersCount: number;
  newOrdersCount: number;
  pickingCount: number;
  packedCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  unreadNotifCount: number;
  notifications: SellerNotification[];
  soundAlertsEnabled: boolean;
  toggleSoundAlerts: () => void;
  acceptOrder: (orderId: string) => Promise<boolean>;
  markOrderReady: (orderId: string) => Promise<boolean>;
  markOrderHandedOver: (orderId: string) => Promise<boolean>;
  toggleItemPacked: (orderId: string, productId: string, isPacked: boolean) => Promise<void>;
  rejectOrder: (orderId: string, reason: string) => Promise<boolean>;
  simulateIncomingOrder: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(2);
  const [outOfStockCount, setOutOfStockCount] = useState(2);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const { showToast } = useToast();
  const { currentStore } = useAuth();

  const playChime = useCallback(() => {
    if (!soundAlertsEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundAlertsEnabled]);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const [orderRes, notifRes, prodRes] = await Promise.all([
        orderService.getOrders(),
        notificationService.getNotifications(),
        catalogService.getProducts(),
      ]);

      setOrders(orderRes.data);
      setNotifications(notifRes.data);

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

  const acceptOrder = async (orderId: string): Promise<boolean> => {
    try {
      const res = await orderService.acceptOrder(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
      showToast('Order Accepted', `Order #${res.data.orderNumber} moved to Picking.`, 'success');
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
      showToast('Handover Confirmed', `Order #${res.data.orderNumber} dispatched with EV Courier.`, 'info');
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
    } catch (err: any) {
      showToast('Item Check Error', err.message, 'error');
    }
  };

  const rejectOrder = async (orderId: string, reason: string): Promise<boolean> => {
    try {
      const res = await orderService.rejectOrder(orderId, reason);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.data : o)));
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
      playChime();
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
    setSoundAlertsEnabled(prev => !prev);
    showToast('Sound Alerts', !soundAlertsEnabled ? 'Order audio chime enabled.' : 'Audio chime muted.', 'info');
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
        unreadNotifCount,
        notifications,
        soundAlertsEnabled,
        toggleSoundAlerts,
        acceptOrder,
        markOrderReady,
        markOrderHandedOver,
        toggleItemPacked,
        rejectOrder,
        simulateIncomingOrder,
        refreshOrders,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
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
