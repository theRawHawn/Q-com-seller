import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Save,
  Truck,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button';

export const StoreSettingsView: React.FC = () => {
  const { currentStore, updateStoreDetails } = useAuth();

  const [name, setName] = useState(currentStore?.name || '');
  const [address, setAddress] = useState(currentStore?.address || '');
  const [pickupNotes, setPickupNotes] = useState(currentStore?.pickupNotes || '');
  const [basePrepMins, setBasePrepMins] = useState(currentStore?.basePrepMins || 5);
  const [openTime, setOpenTime] = useState(currentStore?.operatingHours?.openTime || '07:30 AM');
  const [closeTime, setCloseTime] = useState(currentStore?.operatingHours?.closeTime || '09:30 PM');
  const [phone, setPhone] = useState(currentStore?.phone || '+91 98450 14299');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateStoreDetails({
      name,
      address,
      pickupNotes,
      basePrepMins: Number(basePrepMins),
      operatingHours: {
        openTime,
        closeTime,
        daysOpen: currentStore?.operatingHours?.daysOpen || 'Mon - Sat',
      },
      phone,
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-base font-bold text-slate-900">Store Operations & Dispatch Settings</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure how quick commerce riders locate your store and pickup crates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Store Profile Card */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">Store Profile & Tax Identity</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store / Outlet Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN (Tax Verification)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentStore?.gstin || ''}
                  disabled
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Merchant Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Physical Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>
        </div>

        {/* Courier Rider Pickup Instructions */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Truck className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">Courier Rider Handover Guidelines</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatch Bay Instructions (Visible on QCOM Rider App)
            </label>
            <textarea
              rows={3}
              value={pickupNotes}
              onChange={e => setPickupNotes(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
              placeholder="e.g. Enter through rear warehouse bay on 5th Cross. Crates kept on Counter 2."
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Helps EV riders park and locate your order crate within 60 seconds of arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Prep Time (Mins)
              </label>
              <input
                type="number"
                value={basePrepMins}
                onChange={e => setBasePrepMins(Number(e.target.value))}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Opens At
              </label>
              <input
                type="text"
                value={openTime}
                onChange={e => setOpenTime(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Closes At
              </label>
              <input
                type="text"
                value={closeTime}
                onChange={e => setCloseTime(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Operations Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
