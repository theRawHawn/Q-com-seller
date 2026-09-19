import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SellerStore,
  UserRole,
  StoreUser,
  BankUpdateRequest,
  FraudSecuritySettings,
  BankAccountDetails,
  PermissionKey,
  PermissionDefinition,
  StoreStaffMember,
} from '../types/seller';
import { sellerService } from '../services/sellerService';
import { useToast } from './ToastContext';

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Orders & Dispatch
  {
    key: 'orders.view',
    label: 'View Order Pipeline',
    category: 'Orders & Dispatch',
    description: 'Monitor real-time incoming, picking, and packed order queues.',
  },
  {
    key: 'orders.accept_pack',
    label: 'Pick & Pack Orders',
    category: 'Orders & Dispatch',
    description: 'Transition orders through item verification, bagging, and tamper-sealing.',
  },
  {
    key: 'orders.rider_handover',
    label: 'Rider Handover & OTP',
    category: 'Orders & Dispatch',
    description: 'Verify courier delivery partner OTP and authorize crate dispatch.',
  },
  {
    key: 'orders.cancel_reject',
    label: 'Order Cancellation & Rejection',
    category: 'Orders & Dispatch',
    description: 'Reject unserviceable orders or cancel before rider pickup (triggers penalty checks).',
  },

  // Inventory & Pricing
  {
    key: 'catalog.view',
    label: 'View Catalog & Stock',
    category: 'Inventory & Pricing',
    description: 'Inspect product listings, bin locations, and inventory counts.',
  },
  {
    key: 'catalog.stock_update',
    label: 'Quick Stock Count Adjustments',
    category: 'Inventory & Pricing',
    description: 'Adjust shelf inventory counts and mark items in/out of stock.',
  },
  {
    key: 'catalog.price_edit',
    label: 'Modify Selling Prices & MRP',
    category: 'Inventory & Pricing',
    description: 'Change selling prices and discounts (protected by price-floor safety).',
  },
  {
    key: 'catalog.add_product',
    label: 'Create & Edit Product SKUs',
    category: 'Inventory & Pricing',
    description: 'Add new SKUs, barcode mappings, and category assignments.',
  },
  {
    key: 'inventory.write_off',
    label: 'Damaged Stock Write-offs',
    category: 'Inventory & Pricing',
    description: 'Record shrinkage, damaged, or expired stock with manager authorization.',
  },

  // Finance & Payouts
  {
    key: 'finance.view_earnings',
    label: 'View Earnings & Settlements',
    category: 'Finance & Payouts',
    description: 'Access daily sales, commission breakdowns, and payout history.',
  },
  {
    key: 'finance.manage_bank',
    label: 'Bank Account Modification',
    category: 'Finance & Payouts',
    description: 'Submit bank payout changes with official KYC documentation (Store Owner Exclusive).',
    ownerOnly: true,
  },

  // Store Admin & Security
  {
    key: 'admin.store_profile',
    label: 'Store Profile & Operational Timings',
    category: 'Store Admin & Security',
    description: 'Update physical address, GPS pin, opening hours, and prep SLA.',
  },
  {
    key: 'admin.rbac_manage',
    label: 'Manage Team Roles & Permissions',
    category: 'Store Admin & Security',
    description: 'Invite staff members, assign roles, and configure responsibility matrices.',
    ownerOnly: true,
  },
  {
    key: 'admin.fraud_controls',
    label: 'Anti-Fraud & Security Policy',
    category: 'Store Admin & Security',
    description: 'Configure rider OTP mandates, tamper seal rules, and return dispute shield.',
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  STORE_OWNER: [
    'orders.view',
    'orders.accept_pack',
    'orders.rider_handover',
    'orders.cancel_reject',
    'catalog.view',
    'catalog.stock_update',
    'catalog.price_edit',
    'catalog.add_product',
    'inventory.write_off',
    'finance.view_earnings',
    'finance.manage_bank',
    'admin.store_profile',
    'admin.rbac_manage',
    'admin.fraud_controls',
  ],
  STORE_MANAGER: [
    'orders.view',
    'orders.accept_pack',
    'orders.rider_handover',
    'orders.cancel_reject',
    'catalog.view',
    'catalog.stock_update',
    'catalog.add_product',
    'inventory.write_off',
    'finance.view_earnings',
    'admin.store_profile',
    'admin.fraud_controls',
  ],
  STAFF_PACKER: [
    'orders.view',
    'orders.accept_pack',
    'orders.rider_handover',
    'catalog.view',
    'catalog.stock_update',
  ],
};

export const INITIAL_STAFF_MEMBERS: StoreStaffMember[] = [
  {
    id: 'usr-owner',
    name: 'Ramesh Kumar',
    phone: '+91 98450 14299',
    email: 'ramesh.kumar@vhardware.in',
    role: 'STORE_OWNER',
    status: 'ACTIVE',
    joinedDate: '2024-01-15',
    lastActive: 'Active now',
  },
  {
    id: 'usr-mgr',
    name: 'Vikram Sharma',
    phone: '+91 98450 55678',
    email: 'vikram.s@vhardware.in',
    role: 'STORE_MANAGER',
    status: 'ACTIVE',
    joinedDate: '2024-06-10',
    lastActive: '10 mins ago',
  },
  {
    id: 'usr-packer',
    name: 'Anand Gowda',
    phone: '+91 98450 99112',
    email: 'anand.g@vhardware.in',
    role: 'STAFF_PACKER',
    status: 'ACTIVE',
    joinedDate: '2024-09-01',
    lastActive: '25 mins ago',
  },
  {
    id: 'usr-packer-2',
    name: 'Sunita Patel',
    phone: '+91 98450 77334',
    email: 'sunita.p@vhardware.in',
    role: 'STAFF_PACKER',
    status: 'ACTIVE',
    joinedDate: '2025-02-18',
    lastActive: '1 hour ago',
  },
];

export const DEFAULT_FRAUD_SETTINGS: FraudSecuritySettings = {
  // 1. Rider Handover Security (Swiggy / Blinkit)
  riderHandoverOtpRequired: true,
  riderHandoverMinAmount: 0,
  mandatoryTamperSealLogging: true,
  tamperSealMinOrderValue: 1000,
  geofencedPickupEnforced: true,

  // 2. Returns & Dispute Shield (Meesho / Flipkart / Amazon)
  returnDeliveryOtpRequired: true,
  unboxingVideoMandatoryForHighValue: true,
  highValueReturnThreshold: 1000,
  highRiskCustomerCodBlock: true,
  mismatchDisputeWindowHours: 48,

  // 3. Account & Pricing Protection (Amazon Seller Central)
  payoutAccountLockEnabled: true,
  priceFloorProtectionEnabled: true,
  priceFloorPercentage: 50,
  bulkHoardingCapEnabled: true,
  bulkMaxUnitsPerOrder: 10,

  // 4. Staff Roles & Action Logging
  requireManagerPinForWriteOffs: true,
  requireManagerPinForCancellations: true,
  activeManagerPin: '4821',
  securityAuditLogging: true,
};

export const AVAILABLE_USERS: StoreUser[] = [
  {
    id: 'usr-owner',
    name: 'Ramesh Kumar',
    phone: '+91 98450 14299',
    role: 'STORE_OWNER',
  },
  {
    id: 'usr-mgr',
    name: 'Vikram Sharma',
    phone: '+91 98450 55678',
    role: 'STORE_MANAGER',
  },
  {
    id: 'usr-packer',
    name: 'Anand Gowda',
    phone: '+91 98450 99112',
    role: 'STAFF_PACKER',
  },
];

interface AuthContextType {
  currentStore: SellerStore | null;
  availableStores: SellerStore[];
  currentUser: StoreUser;
  availableUsers: StoreUser[];
  staffMembers: StoreStaffMember[];
  rolePermissions: Record<UserRole, PermissionKey[]>;
  isOwner: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  switchStore: (storeId: string) => Promise<void>;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  assignStaffRole: (staffId: string, role: UserRole) => boolean;
  updateRolePermissions: (role: UserRole, permissions: PermissionKey[]) => boolean;
  addStaffMember: (member: Omit<StoreStaffMember, 'id' | 'joinedDate' | 'lastActive'>) => boolean;
  removeStaffMember: (staffId: string) => boolean;
  toggleStaffStatus: (staffId: string, status: 'ACTIVE' | 'INACTIVE') => boolean;
  hasPermission: (permission: PermissionKey) => boolean;
  toggleStoreStatus: (isOnline: boolean, pauseReason?: string) => Promise<void>;
  updateStoreDetails: (partial: Partial<SellerStore>) => Promise<void>;
  fraudSettings: FraudSecuritySettings;
  updateFraudSettings: (partial: Partial<FraudSecuritySettings>) => Promise<void>;
  bankUpdateRequest: BankUpdateRequest | null;
  submitBankUpdateRequest: (payload: {
    requestedBank: {
      accountNumber: string;
      ifsc: string;
      bankName: string;
      accountHolderName: string;
      accountType: 'CURRENT' | 'SAVINGS';
      branchName?: string;
    };
    reason: string;
    documentType: 'CANCELLED_CHEQUE' | 'BANK_PASSBOOK' | 'BANK_STATEMENT';
    documentFileName: string;
  }) => Promise<boolean>;
  cancelBankUpdateRequest: () => void;
  approveBankUpdateRequest: () => Promise<void>;
  login: (phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<SellerStore | null>(null);
  const [availableStores, setAvailableStores] = useState<SellerStore[]>([]);
  const [staffMembers, setStaffMembers] = useState<StoreStaffMember[]>(() => {
    const saved = localStorage.getItem('qcom_store_staff_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_STAFF_MEMBERS;
      }
    }
    return INITIAL_STAFF_MEMBERS;
  });
  const [currentUser, setCurrentUser] = useState<StoreUser>(() => {
    const owner = INITIAL_STAFF_MEMBERS[0];
    return {
      id: owner.id,
      name: owner.name,
      phone: owner.phone,
      role: owner.role,
    };
  });
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, PermissionKey[]>>(() => {
    const saved = localStorage.getItem('qcom_role_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ROLE_PERMISSIONS;
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default logged in for smooth merchant operations
  const [fraudSettings, setFraudSettings] = useState<FraudSecuritySettings>(() => {
    const saved = localStorage.getItem('qcom_fraud_settings');
    if (saved) {
      try {
        return { ...DEFAULT_FRAUD_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_FRAUD_SETTINGS;
      }
    }
    return DEFAULT_FRAUD_SETTINGS;
  });
  const [bankUpdateRequest, setBankUpdateRequest] = useState<BankUpdateRequest | null>(() => {
    const saved = localStorage.getItem('qcom_bank_update_request');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const { showToast } = useToast();

  const isOwner = currentUser.role === 'STORE_OWNER';

  const availableUsers: StoreUser[] = useMemo(() => {
    return staffMembers.map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      role: m.role,
    }));
  }, [staffMembers]);

  const loadStores = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await sellerService.getAllStores();
      setAvailableStores(res.data);
      if (res.data.length > 0) {
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

  const switchRole = (role: UserRole) => {
    const found = staffMembers.find(u => u.role === role) || staffMembers[0];
    setCurrentUser({
      id: found.id,
      name: found.name,
      phone: found.phone,
      role: found.role,
    });
    showToast('Role Switched', `Operating as ${found.name} (${role.replace('_', ' ')})`, 'info');
  };

  const switchUser = (userId: string) => {
    const found = staffMembers.find(m => m.id === userId);
    if (!found) return;
    setCurrentUser({
      id: found.id,
      name: found.name,
      phone: found.phone,
      role: found.role,
    });
    showToast('Active User Switched', `Operating as ${found.name} (${found.role.replace('_', ' ')})`, 'info');
  };

  const assignStaffRole = (staffId: string, newRole: UserRole): boolean => {
    if (currentUser.role !== 'STORE_OWNER') {
      showToast('Permission Denied', 'Only the Primary Store Owner can assign or modify staff roles.', 'error');
      return false;
    }
    setStaffMembers(prev => {
      const updated = prev.map(m => (m.id === staffId ? { ...m, role: newRole } : m));
      localStorage.setItem('qcom_store_staff_members', JSON.stringify(updated));
      return updated;
    });
    if (currentUser.id === staffId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
    showToast('Staff Role Assigned', `Role updated to ${newRole.replace('_', ' ')}.`, 'success');
    return true;
  };

  const updateRolePermissions = (role: UserRole, permissions: PermissionKey[]): boolean => {
    if (currentUser.role !== 'STORE_OWNER') {
      showToast('Permission Denied', 'Only the Primary Store Owner can configure role responsibilities.', 'error');
      return false;
    }
    setRolePermissions(prev => {
      const updated = { ...prev, [role]: permissions };
      localStorage.setItem('qcom_role_permissions', JSON.stringify(updated));
      return updated;
    });
    showToast('Responsibilities Saved', `Permissions for ${role.replace('_', ' ')} updated.`, 'success');
    return true;
  };

  const addStaffMember = (member: Omit<StoreStaffMember, 'id' | 'joinedDate' | 'lastActive'>): boolean => {
    if (currentUser.role !== 'STORE_OWNER') {
      showToast('Permission Denied', 'Only the Primary Store Owner can add or invite new staff.', 'error');
      return false;
    }
    const newStaff: StoreStaffMember = {
      id: `usr-staff-${Date.now().toString().slice(-4)}`,
      ...member,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Added just now',
    };
    setStaffMembers(prev => {
      const updated = [...prev, newStaff];
      localStorage.setItem('qcom_store_staff_members', JSON.stringify(updated));
      return updated;
    });
    showToast('Staff Member Added', `${member.name} assigned as ${member.role.replace('_', ' ')}.`, 'success');
    return true;
  };

  const removeStaffMember = (staffId: string): boolean => {
    if (currentUser.role !== 'STORE_OWNER') {
      showToast('Permission Denied', 'Only the Primary Store Owner can remove staff members.', 'error');
      return false;
    }
    const target = staffMembers.find(m => m.id === staffId);
    if (target?.role === 'STORE_OWNER') {
      showToast('Action Prohibited', 'Cannot remove the primary Store Owner account.', 'error');
      return false;
    }
    setStaffMembers(prev => {
      const updated = prev.filter(m => m.id !== staffId);
      localStorage.setItem('qcom_store_staff_members', JSON.stringify(updated));
      return updated;
    });
    showToast('Staff Removed', `${target?.name || 'Staff member'} removed from store directory.`, 'info');
    return true;
  };

  const toggleStaffStatus = (staffId: string, status: 'ACTIVE' | 'INACTIVE'): boolean => {
    if (currentUser.role !== 'STORE_OWNER') {
      showToast('Permission Denied', 'Only the Primary Store Owner can modify staff status.', 'error');
      return false;
    }
    setStaffMembers(prev => {
      const updated = prev.map(m => (m.id === staffId ? { ...m, status } : m));
      localStorage.setItem('qcom_store_staff_members', JSON.stringify(updated));
      return updated;
    });
    showToast('Status Updated', `Staff status changed to ${status}.`, 'info');
    return true;
  };

  const hasPermission = useCallback(
    (permission: PermissionKey): boolean => {
      if (currentUser.role === 'STORE_OWNER') return true;
      const permissions = rolePermissions[currentUser.role] || [];
      return permissions.includes(permission);
    },
    [currentUser.role, rolePermissions]
  );

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

  const updateFraudSettings = async (partial: Partial<FraudSecuritySettings>) => {
    const updated = { ...fraudSettings, ...partial };
    setFraudSettings(updated);
    localStorage.setItem('qcom_fraud_settings', JSON.stringify(updated));
    showToast('Security Updated', 'Anti-fraud and store security rules updated.', 'success');
  };

  const submitBankUpdateRequest = async (payload: {
    requestedBank: {
      accountNumber: string;
      ifsc: string;
      bankName: string;
      accountHolderName: string;
      accountType: 'CURRENT' | 'SAVINGS';
      branchName?: string;
    };
    reason: string;
    documentType: 'CANCELLED_CHEQUE' | 'BANK_PASSBOOK' | 'BANK_STATEMENT';
    documentFileName: string;
  }): Promise<boolean> => {
    if (currentUser.role !== 'STORE_OWNER') {
      showToast(
        'Permission Denied',
        'Only the Primary Store Owner / Authorized Signatory can submit bank modification requests.',
        'error'
      );
      return false;
    }

    if (!currentStore) return false;

    const coolingEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const newReq: BankUpdateRequest = {
      id: `REQ-BNK-${Math.floor(10000 + Math.random() * 90000)}`,
      storeId: currentStore.id,
      submittedAt: new Date().toISOString(),
      submittedBy: {
        userId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        phone: currentUser.phone,
      },
      currentBank: { ...currentStore.bankAccount },
      requestedBank: payload.requestedBank,
      reason: payload.reason,
      documentType: payload.documentType,
      documentFileName: payload.documentFileName,
      status: 'PENDING_VERIFICATION',
      coolingPeriodEndsAt: coolingEnd,
      pennyDropStatus: 'PENDING',
      verificationNotes: 'Pending platform compliance audit and penny-drop confirmation.',
    };

    setBankUpdateRequest(newReq);
    localStorage.setItem('qcom_bank_update_request', JSON.stringify(newReq));
    showToast(
      'Bank Update Request Submitted',
      `Request ${newReq.id} received. 24h cooling period and platform verification initiated.`,
      'success'
    );
    return true;
  };

  const cancelBankUpdateRequest = () => {
    setBankUpdateRequest(null);
    localStorage.removeItem('qcom_bank_update_request');
    showToast('Request Cancelled', 'Bank account modification request has been withdrawn.', 'info');
  };

  const approveBankUpdateRequest = async () => {
    if (!bankUpdateRequest || !currentStore) return;

    const newBank: BankAccountDetails = {
      accountNumber: bankUpdateRequest.requestedBank.accountNumber,
      ifsc: bankUpdateRequest.requestedBank.ifsc,
      bankName: bankUpdateRequest.requestedBank.bankName,
      accountHolderName: bankUpdateRequest.requestedBank.accountHolderName,
      accountType: bankUpdateRequest.requestedBank.accountType,
      branchName: bankUpdateRequest.requestedBank.branchName,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    };

    await updateStoreDetails({ bankAccount: newBank });
    setBankUpdateRequest(null);
    localStorage.removeItem('qcom_bank_update_request');
    showToast(
      'Bank Account Verified & Updated',
      `Payout account switched to ${newBank.bankName} (${newBank.accountNumber.slice(-4)})`,
      'success'
    );
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
        currentUser,
        availableUsers,
        staffMembers,
        rolePermissions,
        isOwner,
        isLoading,
        isAuthenticated,
        switchStore,
        switchRole,
        switchUser,
        assignStaffRole,
        updateRolePermissions,
        addStaffMember,
        removeStaffMember,
        toggleStaffStatus,
        hasPermission,
        toggleStoreStatus,
        updateStoreDetails,
        fraudSettings,
        updateFraudSettings,
        bankUpdateRequest,
        submitBankUpdateRequest,
        cancelBankUpdateRequest,
        approveBankUpdateRequest,
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

