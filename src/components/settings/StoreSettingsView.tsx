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
  Sliders,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { StoreLocationMap } from './StoreLocationMap';

export const StoreSettingsView: React.FC = () => {
  const { currentStore, updateStoreDetails } = useAuth();
  const { showToast } = useToast();

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

  // 3. Bank Account
  const [bankName, setBankName] = useState(currentStore?.bankAccount?.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(
    currentStore?.bankAccount?.accountNumber || '50200039208821'
  );
  const [ifsc, setIfsc] = useState(currentStore?.bankAccount?.ifsc || 'HDFC0001224');
  const [accountHolderName, setAccountHolderName] = useState(
    currentStore?.bankAccount?.accountHolderName || 'Venkateshwara Hardware'
  );
  const [accountType, setAccountType] = useState<'CURRENT' | 'SAVINGS'>('CURRENT');

  // 4. Operations & Dispatch Rules
  const [pickupNotes, setPickupNotes] = useState(
    currentStore?.pickupNotes || 'Rider entrance on 8th Main Rear Gate. Order crates kept at Counter 2.'
  );
  const [basePrepMins, setBasePrepMins] = useState(currentStore?.basePrepMins || 5);
  const [openTime, setOpenTime] = useState(currentStore?.operatingHours?.openTime || '07:30 AM');
  const [closeTime, setCloseTime] = useState(currentStore?.operatingHours?.closeTime || '09:30 PM');
  const [daysOpen, setDaysOpen] = useState(currentStore?.operatingHours?.daysOpen || 'Mon - Sat');
  const [minOrderValue, setMinOrderValue] = useState(currentStore?.minOrderValue || 0);
  const [autoAccept, setAutoAccept] = useState(currentStore?.autoAcceptOrders ?? true);

  // 5. Verification Documents
  const [tradeLicense, setTradeLicense] = useState('BLR/KA/TL-99482/2025');

  const [isSaving, setIsSaving] = useState(false);

  const handleLocationMapChange = (newLat: number, newLng: number, formattedAddress?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (formattedAddress) {
      setAddress(formattedAddress);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        bankAccount: {
          accountNumber,
          ifsc,
          bankName,
          accountHolderName,
        },
      });

      showToast('Settings Saved', 'Your store profile and location have been updated.', 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Unable to update store profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Clean Header without subtext */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Store Settings & Profile</h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Store Identity Verified
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. STORE LOCATION & GPS MAP (CRITICAL) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">Store Entrance & GPS Map Location</h4>
            </div>
            <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
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
                Full Physical Address (Street, Building & Door No)
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium text-slate-900 bg-white transition-colors shadow-2xs"
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-medium focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                required
              />
            </div>
          </div>
        </div>

        {/* 2. BUSINESS PROFILE & TAX IDENTITY */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">Business Profile & Tax Registration</h4>
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-bold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 transition-colors shadow-2xs font-medium"
              >
                <option value="Electrical & Plumbing Hardware">Electrical & Plumbing Hardware</option>
                <option value="Power Tools & Fasteners">Power Tools & Fasteners</option>
                <option value="Sanitaryware & Fittings">Sanitaryware & Fittings</option>
                <option value="Paints & Construction Chemicals">Paints & Construction Chemicals</option>
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
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white uppercase transition-colors shadow-2xs"
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
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white uppercase transition-colors shadow-2xs"
                  required
                />
                <ShieldCheck className="w-4 h-4 text-emerald-700 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. BANK ACCOUNT & SETTLEMENT DETAILS */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">Bank Account & Payout Settlement</h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              NEFT Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={e => setAccountHolderName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white font-medium transition-colors shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white transition-colors shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={e => setIfsc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white uppercase transition-colors shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={e => setAccountType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-medium transition-colors shadow-2xs"
              >
                <option value="CURRENT">Current Account (Business)</option>
                <option value="SAVINGS">Savings Account (Proprietor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. STORE OPERATIONS & DISPATCH RULES */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Truck className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">Courier Rider Handover & Dispatch Guidelines</h4>
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs"
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs"
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Auto-Accept Incoming Orders
              </label>
              <p className="text-[11px] text-slate-500">
                Automatically transition new orders into picking queue without manual click
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoAccept(!autoAccept)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoAccept ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  autoAccept ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 5. DOCUMENTS & LICENSES */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">Compliance & Business Licenses</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">GST Certificate</span>
                <span className="text-[11px] text-slate-500">Active • Verified on GST Portal</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                VERIFIED
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Trade License</span>
                <span className="text-[11px] text-slate-500">{tradeLicense}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
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
            Save Profile & Operational Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
