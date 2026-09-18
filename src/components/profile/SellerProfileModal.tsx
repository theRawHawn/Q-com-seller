import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  Clock,
  LogOut,
  Settings,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSettings: () => void;
  onOpenStoreSwitcher: () => void;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSettings,
  onOpenStoreSwitcher,
}) => {
  const { currentStore, logout } = useAuth();

  if (!currentStore) return null;

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleGoToSettings = () => {
    onClose();
    onNavigateToSettings();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Merchant Profile & Operations"
      subtitle={`Account ID: ${currentStore.id}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Merchant Header Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
              {currentStore.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{currentStore.name}</h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{currentStore.ownerName} (Registered Partner)</p>
              <p className="text-xs text-slate-500 mt-0.5">{currentStore.locality}, {currentStore.city}</p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenStoreSwitcher();
            }}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
          >
            Switch Outlet
          </button>
        </div>

        {/* Business & Tax Identity */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Tax & Business Registration
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500">GSTIN</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{currentStore.gstin}</p>
            </div>
            <div>
              <span className="text-slate-500">PAN</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{currentStore.panNumber}</p>
            </div>
            <div>
              <span className="text-slate-500">Registered Phone</span>
              <p className="font-mono text-slate-800 mt-0.5">{currentStore.phone}</p>
            </div>
            <div>
              <span className="text-slate-500">Merchant Email</span>
              <p className="text-slate-800 mt-0.5 truncate">{currentStore.email}</p>
            </div>
          </div>
        </div>

        {/* Bank Settlement Account */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Settlement Bank Account
            </h5>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Weekly Auto-NEFT
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Bank Name</span>
              <p className="font-medium text-slate-800 mt-0.5">{currentStore.bankAccount.bankName}</p>
            </div>
            <div>
              <span className="text-slate-500">Account Number</span>
              <p className="font-mono font-medium text-slate-800 mt-0.5">
                •••• •••• {currentStore.bankAccount.accountNumber.slice(-4)}
              </p>
            </div>
            <div>
              <span className="text-slate-500">IFSC Code</span>
              <p className="font-mono font-medium text-slate-800 mt-0.5">{currentStore.bankAccount.ifsc}</p>
            </div>
            <div>
              <span className="text-slate-500">Account Holder</span>
              <p className="font-medium text-slate-800 mt-0.5">{currentStore.bankAccount.accountHolderName}</p>
            </div>
          </div>
        </div>

        {/* Operations & Address */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs">
          <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Physical Dispatch Bay
          </h5>
          <p className="text-slate-700">{currentStore.address}</p>
          <div className="flex items-center gap-4 pt-1 text-slate-500">
            <span>Operating Hours: {currentStore.operatingHours.openTime} – {currentStore.operatingHours.closeTime}</span>
            <span>Prep SLA: {currentStore.basePrepMins} mins</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleGoToSettings}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Store Settings</span>
          </button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            icon={<LogOut className="w-3.5 h-3.5 text-rose-600" />}
          >
            Log Out
          </Button>
        </div>
      </div>
    </Modal>
  );
};
