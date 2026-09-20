/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { LoginView } from './components/auth/LoginView';
import { Lock, ShieldAlert } from 'lucide-react';

const AccessRestrictedCard: React.FC<{
  permissionKey: string;
  tabLabel: string;
}> = ({ permissionKey, tabLabel }) => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-2xs space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
        <Lock className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{tabLabel} Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Your account (<span className="font-semibold text-slate-800">{currentUser.name}</span> · {currentUser.role.replace('_', ' ')}) does not have permission <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">{permissionKey}</code> required to access this component.
        </p>
      </div>
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <span>Role &amp; Component Access Policy</span>
        </div>
        <p className="text-[11px] text-slate-500">
          The Store Owner configures access rules from the admin panel. If you need access to {tabLabel}, request access from your Store Owner in <span className="font-semibold text-slate-800">Store Settings &gt; Roles &amp; Access Control</span>.
        </p>
      </div>
    </div>
  );
};

function SellerAppContent() {
  const { isAuthenticated, hasPermission } = useAuth();
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

  const canViewOrders = hasPermission('orders.view');
  const canViewCatalog = hasPermission('catalog.view');
  const canViewEarnings = hasPermission('finance.view_earnings');
  const canViewSettings =
    hasPermission('admin.store_profile') ||
    hasPermission('admin.rbac_manage') ||
    hasPermission('admin.fraud_controls') ||
    hasPermission('finance.manage_bank');

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && (
        <HomeOverview
          onNavigateTab={handleNavigateFromHome}
          onSelectOrder={handleSelectOrder}
        />
      )}

      {activeTab === 'orders' && (
        canViewOrders ? (
          <OrderList
            initialFilter={orderFilter}
            selectedOrderId={selectedOrderId}
            onClearSelectedOrder={() => setSelectedOrderId(null)}
          />
        ) : (
          <AccessRestrictedCard permissionKey="orders.view" tabLabel="Orders & Dispatch" />
        )
      )}

      {(activeTab === 'products' || activeTab === 'inventory') && (
        canViewCatalog ? (
          <CatalogView
            initialFilterStatus={catalogFilter}
            onNavigateTab={handleNavigateFromHome}
          />
        ) : (
          <AccessRestrictedCard permissionKey="catalog.view" tabLabel="Catalog & Inventory" />
        )
      )}

      {activeTab === 'returns' && (
        canViewOrders ? (
          <ReturnsView onSelectOrder={handleSelectOrder} />
        ) : (
          <AccessRestrictedCard permissionKey="orders.view" tabLabel="Order Returns" />
        )
      )}

      {activeTab === 'earnings' && (
        canViewEarnings ? (
          <EarningsView />
        ) : (
          <AccessRestrictedCard permissionKey="finance.view_earnings" tabLabel="Earnings & Settlements" />
        )
      )}

      {activeTab === 'analytics' && (
        canViewEarnings || canViewOrders ? (
          <AnalyticsView />
        ) : (
          <AccessRestrictedCard permissionKey="finance.view_earnings" tabLabel="Analytics & Performance" />
        )
      )}

      {activeTab === 'settings' && (
        canViewSettings ? (
          <StoreSettingsView />
        ) : (
          <AccessRestrictedCard permissionKey="admin.store_profile" tabLabel="Store Settings" />
        )
      )}
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
