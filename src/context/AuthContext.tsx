import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SellerStore } from '../types/seller';
import { sellerService } from '../services/sellerService';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentStore: SellerStore | null;
  availableStores: SellerStore[];
  isLoading: boolean;
  isAuthenticated: boolean;
  switchStore: (storeId: string) => Promise<void>;
  toggleStoreStatus: (isOnline: boolean, pauseReason?: string) => Promise<void>;
  updateStoreDetails: (partial: Partial<SellerStore>) => Promise<void>;
  login: (phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<SellerStore | null>(null);
  const [availableStores, setAvailableStores] = useState<SellerStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default logged in for smooth merchant operations
  const { showToast } = useToast();

  const loadStores = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await sellerService.getAllStores();
      setAvailableStores(res.data);
      if (res.data.length > 0) {
        // Default to first store or saved store
        const savedStoreId = localStorage.getItem('qcom_active_store_id');
        const matched = res.data.find(s => s.id === savedStoreId) || res.data[0];
        setCurrentStore(matched);
      }
    } catch (err) {
      console.error('Failed to load seller stores:', err);
      showToast('Store Load Error', 'Could not retrieve merchant account records.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const switchStore = async (storeId: string) => {
    const target = availableStores.find(s => s.id === storeId);
    if (!target) return;
    setCurrentStore(target);
    localStorage.setItem('qcom_active_store_id', storeId);
    showToast('Switched Store', `Now operating ${target.name}`, 'info');
  };

  const toggleStoreStatus = async (isOnline: boolean, pauseReason?: string) => {
    if (!currentStore) return;
    try {
      const res = await sellerService.toggleStoreOnlineStatus(currentStore.id, isOnline, pauseReason);
      setCurrentStore(res.data);
      setAvailableStores(prev => prev.map(s => (s.id === res.data.id ? res.data : s)));
      showToast(
        isOnline ? 'Store Open & Active' : 'Store Paused',
        isOnline ? 'Accepting live orders now.' : pauseReason || 'Incoming orders paused.',
        isOnline ? 'success' : 'warning'
      );
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update store status.', 'error');
    }
  };

  const updateStoreDetails = async (partial: Partial<SellerStore>) => {
    if (!currentStore) return;
    try {
      const res = await sellerService.updateStoreDetails(currentStore.id, partial);
      setCurrentStore(res.data);
      setAvailableStores(prev => prev.map(s => (s.id === res.data.id ? res.data : s)));
      showToast('Settings Saved', 'Store operational profile updated.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update store settings.', 'error');
    }
  };

  const login = async (phone: string, pin: string): Promise<boolean> => {
    if (phone.length >= 10 && pin.length >= 4) {
      setIsAuthenticated(true);
      showToast('Welcome back', `Logged in as merchant ${currentStore?.ownerName || 'Partner'}`, 'success');
      return true;
    }
    showToast('Invalid credentials', 'Please check your phone number and 4-digit PIN.', 'error');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logged Out', 'Signed out of QCOM Seller Partner session.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        currentStore,
        availableStores,
        isLoading,
        isAuthenticated,
        switchStore,
        toggleStoreStatus,
        updateStoreDetails,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
