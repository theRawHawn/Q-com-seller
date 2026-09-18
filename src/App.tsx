/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomeOverview } from './components/home/HomeOverview';
import { OrderList } from './components/orders/OrderList';
import { InventoryList } from './components/inventory/InventoryList';
import { EarningsView } from './components/earnings/EarningsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { StoreSettingsView } from './components/settings/StoreSettingsView';
import { OrderStatus, ProductStockStatus } from './types/seller';
import { useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';

function SellerAppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState<ProductStockStatus | 'ALL'>('ALL');

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigateFromHome = (tab: string, filter?: string) => {
    if (tab === 'orders') {
      if (filter && filter !== 'all') {
        setOrderFilter(filter as OrderStatus);
      } else {
        setOrderFilter('all');
      }
      setSelectedOrderId(null);
    } else if (tab === 'inventory') {
      if (filter) {
        setInventoryFilter(filter as ProductStockStatus);
      } else {
        setInventoryFilter('ALL');
      }
    }
    setActiveTab(tab);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveTab('orders');
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && (
        <HomeOverview
          onNavigateTab={handleNavigateFromHome}
          onSelectOrder={handleSelectOrder}
        />
      )}

      {activeTab === 'orders' && (
        <OrderList
          initialFilter={orderFilter}
          selectedOrderId={selectedOrderId}
          onClearSelectedOrder={() => setSelectedOrderId(null)}
        />
      )}

      {activeTab === 'products' && (
        <InventoryList initialFilterStatus="ALL" />
      )}

      {activeTab === 'inventory' && (
        <InventoryList initialFilterStatus={inventoryFilter} />
      )}

      {activeTab === 'earnings' && <EarningsView />}

      {activeTab === 'analytics' && <AnalyticsView />}

      {activeTab === 'settings' && <StoreSettingsView />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <StoreProvider>
          <SellerAppContent />
        </StoreProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
