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
import { CatalogView } from './components/catalog/CatalogView';
import { ReturnsView } from './components/returns/ReturnsView';
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
  const [catalogFilter, setCatalogFilter] = useState<ProductStockStatus | 'ALL'>('ALL');

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
      setActiveTab('orders');
    } else if (tab === 'products' || tab === 'inventory') {
      if (filter) {
        setCatalogFilter(filter as ProductStockStatus);
      } else {
        setCatalogFilter('ALL');
      }
      setActiveTab('products');
    } else {
      setActiveTab(tab);
    }
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

      {(activeTab === 'products' || activeTab === 'inventory') && (
        <CatalogView
          initialFilterStatus={catalogFilter}
          onNavigateTab={handleNavigateFromHome}
        />
      )}

      {activeTab === 'returns' && (
        <ReturnsView onSelectOrder={handleSelectOrder} />
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
