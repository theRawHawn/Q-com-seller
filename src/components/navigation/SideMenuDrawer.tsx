import React from 'react';
import {
  X,
  Home,
  ShoppingBag,
  Package,
  RotateCcw,
  IndianRupee,
  BarChart3,
  Settings,
  LogOut,
  Store,
  ChevronRight,
  Zap,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  User,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenStoreSwitcher: () => void;
  onOpenProfile: () => void;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenStoreSwitcher,
  onOpenProfile,
}) => {
  const { currentStore, logout, toggleStoreStatus } = useAuth();
  const {
    newOrdersCount,
    activeOrdersCount,
    pendingReturnsCount,
    simulateIncomingOrder,
  } = useStore();

  if (!isOpen) return null;

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge:
        newOrdersCount > 0
          ? `${newOrdersCount} New`
          : activeOrdersCount > 0
          ? `${activeOrdersCount} Active`
          : null,
      badgeClass:
        newOrdersCount > 0
          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
          : 'bg-amber-500 text-white border-amber-600 shadow-2xs',
    },
    {
      id: 'products',
      label: 'Catalog',
      icon: Package,
      badge: null,
    },
    {
      id: 'returns',
      label: 'Returns',
      icon: RotateCcw,
      badge: pendingReturnsCount > 0 ? `${pendingReturnsCount} New` : null,
      badgeClass: 'bg-rose-600 text-white border-rose-700 shadow-2xs',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: IndianRupee,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Drawer from Left */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-80 sm:w-88 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200 ease-out">
          {/* Top Section */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header: Brand & Close */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  QC
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm tracking-tight">QCOM Seller</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Live
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Merchant Operating System</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close side menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Store Information Card */}
            <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {currentStore?.name || 'QCOM Store'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {currentStore?.address || 'Bengaluru, Karnataka'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenStoreSwitcher();
                  }}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded-md bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                  title="Switch between your registered stores"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Switch</span>
                </button>
              </div>

              {/* Store Operational Status Indicator */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentStore?.isStoreOnline ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {currentStore?.isStoreOnline ? 'Store Open & Accepting' : 'Store Paused'}
                  </span>
                </div>
                <button
                  onClick={() => toggleStoreStatus(!currentStore?.isStoreOnline)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    currentStore?.isStoreOnline
                      ? 'text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                      : 'text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {currentStore?.isStoreOnline ? 'Pause' : 'Open'}
                </button>
              </div>
            </div>

            {/* Navigation Menu List */}
            <nav className="p-3 space-y-1">
              <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Menu
              </p>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          isActive ? 'bg-white/20 text-white border-white/30' : item.badgeClass
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-white/60' : 'text-slate-300'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Operations Utilities */}
            <div className="p-3 mx-3 mb-3 border-t border-slate-100 space-y-2">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Tools
              </p>
              <div>
                <button
                  onClick={() => {
                    simulateIncomingOrder();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors flex items-center gap-2.5"
                >
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">Test Order</p>
                    <p className="text-[10px] text-slate-500 truncate">Simulate incoming customer order</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer: Seller Account & Sign Out */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <button
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="flex items-center gap-2.5 min-w-0 text-left group hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {currentStore?.ownerName || 'Merchant Partner'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    ID: {currentStore?.id || 'QC-BLR'}
                  </p>
                </div>
              </button>

              <button
                onClick={logout}
                title="Sign Out of Seller Account"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
