import React, { useState } from 'react';
import { DesktopSidebar } from '../navigation/DesktopSidebar';
import { TopHeader } from '../navigation/TopHeader';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { NotificationsDrawer } from '../notifications/NotificationsDrawer';
import { SideMenuDrawer } from '../navigation/SideMenuDrawer';
import { SellerProfileModal } from '../profile/SellerProfileModal';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const { currentStore, availableStores, switchStore } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleMobileNavTab = (tab: string) => {
    if (tab === 'more') {
      setIsSideMenuOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col md:flex-row text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Desktop Persistent Sidebar */}
      <DesktopSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
        {/* Top Header */}
        <TopHeader
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleMobileNavTab}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab, _filter) => setActiveTab(tab)}
      />

      {/* Side Menu Bar Drawer (Opened from circled hamburger button or bottom nav More) */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStoreSwitcher={() => setIsStoreSwitcherOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Global Seller Profile Modal */}
      <SellerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigateToSettings={() => setActiveTab('settings')}
        onOpenStoreSwitcher={() => setIsStoreSwitcherOpen(true)}
      />

      {/* Global Store Switcher Modal */}
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
    </div>
  );
};
