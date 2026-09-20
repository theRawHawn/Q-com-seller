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
  CreditCard,
  FileCheck,
  Mail,
  User,
  Users,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { StoreLocationMap } from './StoreLocationMap';
import { BankPayoutSecurityCard } from './BankPayoutSecurityCard';
import { FraudSecurityControlsView } from './FraudSecurityControlsView';
import { StoreRbacView } from './StoreRbacView';

type SettingsTab = 'rbac_staff' | 'fraud_security' | 'bank_payout' | 'store_profile';

export const StoreSettingsView: React.FC = () => {
  const { currentStore, updateStoreDetails, bankUpdateRequest } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>('rbac_staff');

  // 1. Business Profile
  const [name, setName] = useState(currentStore?.name || 'Venkateshwara Hardware & Electricals');
  const [ownerName, setOwnerName] = useState(currentStore?.ownerName || 'Ramesh Kumar');
  const [category, setCategory] = useState('Electrical & Plumbing Hardware');
  const [gstin, setGstin] = useState(currentStore?.gstin || '29AABCV1234F1Z5');
  const [panNumber, setPanNumber] = useState(currentStore?.panNumber || 'AABCV1234F');
  const [email, setEmail] = useState(currentStore?.email || 'sales@vhardware.in');
  const [phone, setPhone] = useState(currentStore?.phone || '+91 98450 14299');

  // 2. Geo-Location & Physical Address
  const [address, setAddress] = useState(
    currentStore?.address || '#42/1, 8th Main, 4th Block, Jayanagar, Bengaluru - 560011'
  );
  const [locality, setLocality] = useState(currentStore?.locality || 'Jayanagar');
  const [city, setCity] = useState(currentStore?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentStore?.pincode || '560011');
  const [lat, setLat] = useState(currentStore?.coordinates?.lat || 12.9252);
  const [lng, setLng] = useState(currentStore?.coordinates?.lng || 77.5938);

  // 3. Operations & Dispatch Rules
  const [pickupNotes, setPickupNotes] = useState(
    currentStore?.pickupNotes || 'Rider entrance on 8th Main Rear Gate. Order crates kept at Counter 2.'
  );
  const [basePrepMins, setBasePrepMins] = useState(currentStore?.basePrepMins || 5);
  const [openTime, setOpenTime] = useState(currentStore?.operatingHours?.openTime || '07:30 AM');
  const [closeTime, setCloseTime] = useState(currentStore?.operatingHours?.closeTime || '09:30 PM');
  const [daysOpen, setDaysOpen] = useState(currentStore?.operatingHours?.daysOpen || 'Mon - Sat');
  const [minOrderValue, setMinOrderValue] = useState(currentStore?.minOrderValue || 0);
  const [autoAccept, setAutoAccept] = useState(currentStore?.autoAcceptOrders ?? true);

  // 4. Verification Documents
  const [tradeLicense, setTradeLicense] = useState('BLR/KA/TL-99482/2025');
  const [isSaving, setIsSaving] = useState(false);

  const handleLocationMapChange = (newLat: number, newLng: number, formattedAddress?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (formattedAddress) {
      setAddress(formattedAddress);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateStoreDetails({
        name,
        ownerName,
        address,
        locality,
        city,
        pincode,
        coordinates: { lat, lng },
        pickupNotes,
        basePrepMins: Number(basePrepMins),
        operatingHours: {
          openTime,
          closeTime,
          daysOpen,
        },
        phone,
        email,
        gstin,
        panNumber,
        minOrderValue: Number(minOrderValue),
        autoAcceptOrders: autoAccept,
      });

      showToast('Settings Saved', 'Your store profile and location have been updated.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Unable to update store profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Operational Navigation Tabs matching OrderList / ReturnsView */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'rbac_staff', label: 'Staff & Roles (RBAC)', icon: Users },
          { id: 'fraud_security', label: 'Fraud & Security', icon: ShieldCheck },
          { id: 'bank_payout', label: 'Bank & Settlements', icon: CreditCard, hasBadge: !!bankUpdateRequest },
          { id: 'store_profile', label: 'Store Profile & GPS', icon: Store },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.hasBadge && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RBAC STAFF & PERMISSIONS */}
      {activeTab === 'rbac_staff' && <StoreRbacView />}

      {/* TAB 2: ENTERPRISE FRAUD & SECURITY CONTROLS */}
      {activeTab === 'fraud_security' && <FraudSecurityControlsView />}

      {/* TAB 3: PROTECTED BANK & SETTLEMENT CONTROLS */}
      {activeTab === 'bank_payout' && (
        <div className="space-y-4">
          <BankPayoutSecurityCard />
        </div>
      )}

      {/* TAB 4: STORE PROFILE & GPS LOCATION */}
      {activeTab === 'store_profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* 1. STORE LOCATION & GPS MAP (CRITICAL) */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h4 className="text-sm font-bold text-slate-900">Store Entrance &amp; GPS Map Location</h4>
              </div>
              <span className="text-xs text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md tabular-nums">
                GPS: {lat}, {lng}
              </span>
            </div>

            {/* Interactive Leaflet Map Component */}
            <StoreLocationMap
              lat={lat}
              lng={lng}
              address={address}
              onLocationChange={handleLocationMapChange}
            />

            {/* Detailed Street Address Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Physical Address (Street, Building &amp; Door No)
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Locality / Area Name
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={e => setLocality(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Dispatch Gate Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs tabular-nums"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. BUSINESS PROFILE & TAX IDENTITY */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Store className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">Business Profile &amp; Tax Registration</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store / Outlet Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Owner / Proprietor Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hardware Specialization / Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 transition-colors shadow-2xs"
                >
                  <option value="Electrical & Plumbing Hardware">Electrical &amp; Plumbing Hardware</option>
                  <option value="Power Tools & Fasteners">Power Tools &amp; Fasteners</option>
                  <option value="Sanitaryware & Fittings">Sanitaryware &amp; Fittings</option>
                  <option value="Paints & Construction Chemicals">Paints &amp; Construction Chemicals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Merchant Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN (Tax Registration)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={gstin}
                    onChange={e => setGstin(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white uppercase transition-colors shadow-2xs tabular-nums"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-emerald-700 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PAN Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={panNumber}
                    onChange={e => setPanNumber(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white uppercase transition-colors shadow-2xs"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-emerald-700 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. STORE OPERATIONS & DISPATCH RULES */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">Courier Rider Handover &amp; Dispatch Guidelines</h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rider Handover Instructions (Visible on QCOM Courier App)
              </label>
              <textarea
                rows={2}
                value={pickupNotes}
                onChange={e => setPickupNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Packing Time (Mins)
                </label>
                <input
                  type="number"
                  value={basePrepMins}
                  onChange={e => setBasePrepMins(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs tabular-nums"
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
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs tabular-nums"
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
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs tabular-nums"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Auto-Accept Incoming Orders
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically transition new orders into picking queue without manual click
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoAccept(!autoAccept)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoAccept ? 'bg-emerald-700' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    autoAccept ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4. DOCUMENTS & LICENSES */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">Compliance &amp; Business Licenses</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">GST Certificate</span>
                  <span className="text-[11px] text-slate-500">Active • Verified on GST Portal</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Trade License</span>
                  <span className="text-[11px] text-slate-500">{tradeLicense}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                  VALID
                </span>
              </div>
            </div>
          </div>

          {/* Action Save Button */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Profile &amp; Operational Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
