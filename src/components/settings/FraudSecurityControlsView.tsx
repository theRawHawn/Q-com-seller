import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  RotateCcw,
  Tag,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const FraudSecurityControlsView: React.FC = () => {
  const {
    currentUser,
    isOwner,
    fraudSettings,
    updateFraudSettings,
  } = useAuth();
  const { showToast } = useToast();

  const [showPin, setShowPin] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [newPin, setNewPin] = useState(fraudSettings.activeManagerPin || '4821');

  const handleToggle = (key: keyof typeof fraudSettings, value: boolean) => {
    if (!isOwner) {
      showToast('Permission Denied', 'Only the Primary Store Owner can change store security settings.', 'error');
      return;
    }
    updateFraudSettings({ [key]: value });
  };

  const handleSavePin = () => {
    if (!isOwner) {
      showToast('Permission Denied', 'Only the Primary Store Owner can change authorization PINs.', 'error');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      showToast('Invalid PIN', 'Security PIN must be exactly 4 digits.', 'error');
      return;
    }
    updateFraudSettings({ activeManagerPin: newPin });
    setEditingPin(false);
    showToast('PIN Updated', 'Store Manager Authorization PIN updated.', 'success');
  };

  return (
    <div className="space-y-4">
      {/* 1. RIDER HANDOVER SECURITY */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">Courier Rider Handover Protection</h4>
          </div>
          {!isOwner && (
            <span className="text-[11px] text-amber-700 font-semibold">Read-Only</span>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {/* Rider OTP */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                Mandatory Rider Handover OTP
              </span>
              <p className="text-xs text-slate-500">
                Delivery rider must present a dynamic 4-digit verification code before order status moves to out for delivery. Prevents mistaken or ghost pickups.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => handleToggle('riderHandoverOtpRequired', !fraudSettings.riderHandoverOtpRequired)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.riderHandoverOtpRequired ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle Rider Handover OTP"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.riderHandoverOtpRequired ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Tamper Seal Barcode Logging */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                Tamper-Evident Bag Seal Verification
              </span>
              <p className="text-xs text-slate-500">
                Requires packing personnel to scan the unique security seal barcode on the dispatched package prior to rider handoff.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => handleToggle('mandatoryTamperSealLogging', !fraudSettings.mandatoryTamperSealLogging)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.mandatoryTamperSealLogging ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle Tamper-Evident Bag Seal Verification"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.mandatoryTamperSealLogging ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Geofenced GPS Pickup Verification */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                50m Geofenced GPS Pickup Verification
              </span>
              <p className="text-xs text-slate-500">
                Ensures the rider's device GPS matches your registered store entrance coordinates before allowing pickup confirmation.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => handleToggle('geofencedPickupEnforced', !fraudSettings.geofencedPickupEnforced)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.geofencedPickupEnforced ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle Geofenced GPS Pickup Verification"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.geofencedPickupEnforced ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 2. RETURNS & CUSTOMER DISPUTE PROTECTION */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <RotateCcw className="w-4 h-4 text-emerald-700" />
          <h4 className="text-sm font-bold text-slate-900">Customer Returns &amp; Dispute Protection</h4>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Return Delivery OTP */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                Return Delivery Confirmation OTP
              </span>
              <p className="text-xs text-slate-500">
                Merchant provides the completion OTP to the return courier only after physically opening and verifying the returned parcel.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => handleToggle('returnDeliveryOtpRequired', !fraudSettings.returnDeliveryOtpRequired)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.returnDeliveryOtpRequired ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle Return Delivery Confirmation OTP"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.returnDeliveryOtpRequired ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Inspection Photos for High Value */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                Mandatory Return Inspection Photos (&gt; ₹1,000)
              </span>
              <p className="text-xs text-slate-500">
                Returns with refund values above ₹1,000 require photographic evidence of item condition and serial number prior to approval.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() =>
                handleToggle('unboxingVideoMandatoryForHighValue', !fraudSettings.unboxingVideoMandatoryForHighValue)
              }
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.unboxingVideoMandatoryForHighValue ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle Mandatory Return Inspection Photos"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.unboxingVideoMandatoryForHighValue ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High-RTO Customer Restriction */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                High-Return Customer COD Restriction
              </span>
              <p className="text-xs text-slate-500">
                Automatically blocks Cash-on-Delivery payment options for buyers with return/cancellation rates above 40%.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => handleToggle('highRiskCustomerCodBlock', !fraudSettings.highRiskCustomerCodBlock)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.highRiskCustomerCodBlock ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle High-Return Customer COD Restriction"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.highRiskCustomerCodBlock ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 3. PRICING SAFEGUARDS */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Tag className="w-4 h-4 text-emerald-700" />
          <h4 className="text-sm font-bold text-slate-900">Pricing Safeguards &amp; Anti-Hoarding</h4>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Price Floor Protection */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                Price Floor Protection (50% MRP Safeguard)
              </span>
              <p className="text-xs text-slate-500">
                Blocks accidental pricing typos (e.g. ₹15 instead of ₹150). Prevents price adjustments lower than 50% of MRP without confirmation.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => handleToggle('priceFloorProtectionEnabled', !fraudSettings.priceFloorProtectionEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.priceFloorProtectionEnabled ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle Price Floor Protection"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.priceFloorProtectionEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Bulk Hoarding Cap */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block">
                Per-Order Quantity Cap (Max 10 Units)
              </span>
              <p className="text-xs text-slate-500">
                Limits single-order item quantities to prevent predatory inventory exhaustion during peak demand surges.
              </p>
            </div>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => handleToggle('bulkHoardingCapEnabled', !fraudSettings.bulkHoardingCapEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                fraudSettings.bulkHoardingCapEnabled ? 'bg-emerald-700' : 'bg-slate-200'
              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Toggle Per-Order Quantity Cap"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  fraudSettings.bulkHoardingCapEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 4. MANAGER AUTHORIZATION PIN */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <KeyRound className="w-4 h-4 text-emerald-700" />
          <h4 className="text-sm font-bold text-slate-900">Manager Authorization PIN</h4>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-900 block">
              4-Digit Operational PIN
            </span>
            <p className="text-xs text-slate-500">
              Required when floor staff performs inventory shrinkage write-offs or order cancellations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {editingPin ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="PIN"
                  className="w-20 text-center text-xs font-bold p-1.5 rounded-lg border border-slate-300 bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-600 tabular-nums"
                />
                <Button size="sm" variant="primary" onClick={handleSavePin}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingPin(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 tabular-nums">
                  {showPin ? fraudSettings.activeManagerPin : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {isOwner && (
                  <Button size="sm" variant="outline" onClick={() => setEditingPin(true)}>
                    Change PIN
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
