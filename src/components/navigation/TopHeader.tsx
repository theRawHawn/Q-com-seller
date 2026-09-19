import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Menu,
  Volume2,
  Bell,
  Zap,
  CheckCircle2,
  RefreshCw,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SellerProfileModal } from '../profile/SellerProfileModal';

interface TopHeaderProps {
  onOpenNotifications: () => void;
  onOpenSideMenu: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabTitles: Record<string, string> = {
  home: 'Overview',
  orders: 'Orders',
  products: 'Catalog & Inventory',
  returns: 'Order Returns',
  inventory: 'Catalog & Inventory',
  earnings: 'Earnings & Payouts',
  analytics: 'Analytics',
  settings: 'Store Settings',
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenNotifications,
  onOpenSideMenu,
  activeTab,
  setActiveTab,
}) => {
  const { currentStore, availableStores, switchStore } = useAuth();
  const {
    unreadNotifCount,
    openSoundsModal,
    simulateIncomingOrder,
    refreshOrders,
    isLoadingOrders,
    newOrdersCount,
  } = useStore();

  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    await simulateIncomingOrder();
    setIsSimulating(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-3 sm:px-6 h-14 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Side Menu Bar Button & Brand vs Desktop Section Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Only: Side Menu Bar Button */}
          <button
            onClick={onOpenSideMenu}
            className="md:hidden w-9 h-9 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center shrink-0 shadow-2xs"
            title="Open Side Menu Bar"
            aria-label="Open Side Menu Bar"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* Mobile Only: Clean Brand Mark */}
          <div className="md:hidden flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              QCOM
            </span>
          </div>

          {/* Desktop Only: Active Section Title */}
          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900">
              {tabTitles[activeTab] || 'Overview'}
            </h1>
          </div>
        </div>

        {/* Right: Operational Actions (Test Order, Audio, Refresh, Notifications, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Simulate New Order button (Desktop / Tablet) */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
            title="Simulate incoming order from customer app"
          >
            <Zap className={`w-3.5 h-3.5 text-emerald-600 ${isSimulating ? 'animate-bounce' : ''}`} />
            <span>Test Order</span>
            {newOrdersCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px]">
                {newOrdersCount}
              </span>
            )}
          </button>

          {/* Mandatory Status Sounds Catalog / Preview */}
          <button
            type="button"
            onClick={openSoundsModal}
            className="h-9 px-2.5 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Mandatory Audio Alerts • Click to listen to sounds for each status"
            aria-label="Mandatory order audio alerts"
          >
            <Volume2 className="w-4 h-4 text-emerald-700" />
            <span className="hidden xl:inline text-xs font-semibold text-slate-800">Status Sounds</span>
          </button>

          {/* Refresh Orders */}
          <button
            onClick={() => refreshOrders()}
            disabled={isLoadingOrders}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Refresh orders"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin text-emerald-700' : ''}`} />
          </button>

          {/* Notifications Center */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden xs:block" />

          {/* Seller Profile Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 border border-slate-200/90 transition-colors bg-white shadow-2xs"
            title="Seller Profile & Account"
            aria-label="Seller Profile & Account"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Seller Profile Modal */}
      <SellerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigateToSettings={() => setActiveTab('settings')}
        onOpenStoreSwitcher={() => setIsStoreSwitcherOpen(true)}
      />

      {/* Store Switcher Modal */}
      <Modal
        isOpen={isStoreSwitcherOpen}
        onClose={() => setIsStoreSwitcherOpen(false)}
        title="Switch Operating Store"
        subtitle="Select the merchant outlet you are currently operating"
        maxWidth="sm"
      >
        <div className="space-y-2.5">
          {availableStores.map(store => {
            const isSelected = store.id === currentStore?.id;
            return (
              <button
                key={store.id}
                onClick={() => {
                  switchStore(store.id);
                  setIsStoreSwitcherOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{store.name}</h4>
                    {isSelected && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-700 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{store.address}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span className="font-mono">GSTIN: {store.gstin}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold">{store.rating} ★</span>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </Modal>
    </header>
  );
};
