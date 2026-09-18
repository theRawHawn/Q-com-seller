import React from 'react';
import {
  Home,
  ShoppingBag,
  Package,
  RotateCcw,
  IndianRupee,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

interface DesktopSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { logout } = useAuth();
  const { newOrdersCount, activeOrdersCount, pendingReturnsCount } = useStore();

  const primaryNavItems = [
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
      badge: newOrdersCount > 0 ? `${newOrdersCount}` : activeOrdersCount > 0 ? `${activeOrdersCount}` : null,
      badgeColor: newOrdersCount > 0 ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' : 'bg-amber-500 text-white border-amber-600 shadow-2xs',
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
      badge: pendingReturnsCount > 0 ? `${pendingReturnsCount}` : null,
      badgeColor: 'bg-rose-600 text-white border-rose-700 shadow-2xs',
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
    <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-white border-r border-slate-200 shrink-0 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            QC
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-sm tracking-tight">QCOM</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Seller
            </span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {primaryNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors group ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-bold border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Action: Easy Account Log Out */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer group shadow-2xs"
          title="Sign out of seller account"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
