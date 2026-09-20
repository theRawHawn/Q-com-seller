import React from 'react';
import { Home, ShoppingBag, Package, RotateCcw, IndianRupee } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { newOrdersCount, activeOrdersCount, pendingReturnsCount } = useStore();

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
      badge: newOrdersCount > 0 ? `${newOrdersCount}` : activeOrdersCount > 0 ? `${activeOrdersCount}` : null,
      badgeColor: newOrdersCount > 0 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white',
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
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: IndianRupee,
      badge: null,
    },
  ];

  return (
    <nav
      id="seller-mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-bottom shadow-sm"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center select-none transition-colors ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full text-[9px] font-mono font-bold flex items-center justify-center leading-none ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-700 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
