import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Phone, ArrowRight, ShieldCheck, Store, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const LoginView: React.FC = () => {
  const { login, availableStores, switchStore } = useAuth();
  const [phone, setPhone] = useState('9845014299');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(phone, pin);
      if (!success) {
        setError('Invalid phone number or 4-digit PIN. Please try again.');
      }
    } catch {
      setError('An error occurred while signing in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (storeId: string, storePhone: string) => {
    setPhone(storePhone.replace(/[^0-9]/g, '').slice(-10));
    setPin('1234');
    setIsLoading(true);
    await switchStore(storeId);
    await login(storePhone, '1234');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-700 text-white font-bold text-lg shadow-sm mb-4">
          QC
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          QCOM Seller Partner
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to manage your store, active orders, and inventory
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-2xl shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-medium border-r border-slate-200 pr-2 my-2">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9845014299"
                  className="w-full pl-16 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                4-Digit Merchant PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full pl-3 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-mono tracking-widest text-center text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full justify-center"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          {/* Quick Demo Login Switcher for Seamless Review */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Demo Profiles</span>
            </div>
            <div className="space-y-2">
              {availableStores.slice(0, 3).map(store => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(store.id, store.phone)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{store.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{store.locality} · {store.ownerName}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GSTIN Verified QCOM Seller Gateway</span>
        </div>
      </div>
    </div>
  );
};
