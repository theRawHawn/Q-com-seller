import React from 'react';
import {
  Package,
  RotateCcw,
  IndianRupee,
  BarChart3,
  Settings,
  Store,
  Zap,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MobileMoreMenu: React.FC<MobileMoreMenuProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { currentStore, logout } = useAuth();
  const { simulateIncomingOrder } = useStore();

  const handleSelect = (tab: string) => {
    onNavigateTab(tab);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Store Operational Menu"
      subtitle={`${currentStore?.name} · ${currentStore?.locality}`}
      maxWidth="sm"
    >
      <div className="space-y-3">
        {/* Merchant Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">{currentStore?.ownerName}</p>
            <p className="text-[11px] text-slate-500 font-mono">Merchant ID: {currentStore?.id}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            GST Active
          </span>
        </div>

        {/* Navigation list */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => handleSelect('earnings')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <IndianRupee className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Earnings & Payouts</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleSelect('analytics')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Analytics & SLA Fulfillment</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleSelect('settings')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Store & Dispatch Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Controls: Simulation */}
        <div className="pt-1">
          <button
            onClick={async () => {
              await simulateIncomingOrder();
              onClose();
              onNavigateTab('orders');
            }}
            className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Simulate Customer Order</span>
          </button>
        </div>

        {/* Sign out */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Store Account</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
