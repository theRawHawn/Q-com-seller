/**
 * QCOM Seller Platform — Authoritative Frontend Contracts & Domain Types
 * Synchronized with QCOM Customer App and QCOM Admin Panel architectures.
 */

export type OrderStatus =
  | 'placed'
  | 'picking'
  | 'packed'
  | 'out_for_delivery'
  | 'arriving'
  | 'delivered'
  | 'cancelled';

export type ProductStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BankAccountDetails {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  accountType?: 'CURRENT' | 'SAVINGS';
  branchName?: string;
  isVerified?: boolean;
  verifiedAt?: string;
}

export type UserRole = 'STORE_OWNER' | 'STORE_MANAGER' | 'STAFF_PACKER';

export type PermissionKey =
  | 'orders.view'
  | 'orders.accept_pack'
  | 'orders.rider_handover'
  | 'orders.cancel_reject'
  | 'catalog.view'
  | 'catalog.stock_update'
  | 'catalog.price_edit'
  | 'catalog.add_product'
  | 'inventory.write_off'
  | 'finance.view_earnings'
  | 'finance.manage_bank'
  | 'admin.store_profile'
  | 'admin.rbac_manage'
  | 'admin.fraud_controls';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: 'Orders & Dispatch' | 'Inventory & Pricing' | 'Finance & Payouts' | 'Store Admin & Security';
  description: string;
  ownerOnly?: boolean;
}

export interface StoreStaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
  lastActive?: string;
  customPermissions?: PermissionKey[];
}

export interface StoreUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface BankUpdateRequest {
  id: string;
  storeId: string;
  submittedAt: string;
  submittedBy: {
    userId: string;
    name: string;
    role: UserRole;
    phone: string;
  };
  currentBank: BankAccountDetails;
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
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  coolingPeriodEndsAt: string; // ISO string 24h from submission
  verificationNotes?: string;
  pennyDropStatus?: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  rejectionReason?: string;
}

export interface FraudSecuritySettings {
  // 1. Rider Handover Security (Swiggy/Blinkit style)
  riderHandoverOtpRequired: boolean;
  riderHandoverMinAmount: number; // e.g. 0 (all) or 500
  mandatoryTamperSealLogging: boolean;
  tamperSealMinOrderValue: number; // e.g. 1000
  geofencedPickupEnforced: boolean; // 50m geofence radius check

  // 2. Returns & Dispute Shield (Meesho/Flipkart/Amazon style)
  returnDeliveryOtpRequired: boolean;
  unboxingVideoMandatoryForHighValue: boolean;
  highValueReturnThreshold: number; // e.g. 1000
  highRiskCustomerCodBlock: boolean; // Auto-block COD/Trade Credit for high return/cancellation customers
  mismatchDisputeWindowHours: number; // 48h to claim swapped/missing items

  // 3. Account & Pricing Protection (Amazon Seller Central style)
  payoutAccountLockEnabled: boolean; // Enforce Platform Verification & 24h cooling on bank changes
  priceFloorProtectionEnabled: boolean; // Disallow accidental drops below 50% MRP
  priceFloorPercentage: number; // 50%
  bulkHoardingCapEnabled: boolean; // Max quantity per order for critical SKUs
  bulkMaxUnitsPerOrder: number; // 10 units

  // 4. Staff Roles & Action Logging
  requireManagerPinForWriteOffs: boolean;
  requireManagerPinForCancellations: boolean;
  activeManagerPin: string; // "4821"
  securityAuditLogging: boolean;
}

export interface VerificationDocuments {
  gstVerified: boolean;
  panVerified: boolean;
  bankVerified: boolean;
  tradeLicenseVerified: boolean;
  tradeLicenseNumber?: string;
}

export interface SellerStore {
  id: string;
  name: string;
  ownerName: string;
  hubType: string;
  categories: string[];
  phone: string;
  email: string;
  address: string;
  locality: string;
  areaName: string;
  city: string;
  pincode: string;
  coordinates: Coordinates;
  accessibleEntranceCoords?: Coordinates;
  pickupNotes?: string;
  gstin: string;
  panNumber: string;
  bankAccount: BankAccountDetails;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED';
  isStoreOnline: boolean;
  canReceiveOrders: boolean;
  isOrderingEnabled: boolean;
  isPaused: boolean;
  pauseReason?: string;
  commissionRatePercent: number;
  rating: number;
  reviewsCount: number;
  basePrepMins: number;
  minOrderValue?: number;
  autoAcceptOrders?: boolean;
  slaAdherencePercent: number;
  joinedDate: string;
  documents: VerificationDocuments;
  fraudSettings?: FraudSecuritySettings;
  pendingBankUpdateRequest?: BankUpdateRequest | null;
  operatingHours: {
    openTime: string; // e.g. "07:30"
    closeTime: string; // e.g. "21:30"
    daysOpen: string; // e.g. "Mon - Sun"
  };
}

export interface SellerOrderItem {
  productId: string;
  productName: string;
  brand: string;
  category: string;
  subcategory?: string;
  unit: string;
  price: number;
  mrp: number;
  quantity: number;
  binLocation: string;
  image?: string;
  isPacked: boolean;
  hsnCode?: string;
  gstRatePercent: number;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  estimatedDeliveryAt: string;
  deliveredAt?: string;
  items: SellerOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  handlingFee: number;
  total: number;
  // Transparent Seller Commercials
  sellerEarnings: number;
  commissionAmount: number;
  commissionRatePercent: number;
  tdsAmount: number;
  tcsAmount: number;
  // Customer & Site details
  customer: {
    id?: string;
    name: string; // e.g. "Rajesh M." (masked first name + initial)
    phone: string;
    maskedPhone?: string; // e.g. "+91 98XXX-XX891 (Masked via QCOM IVR)"
    isMasked?: boolean;
    virtualProxyNumber?: string;
    accountType?: 'electrician' | 'plumber' | 'contractor' | 'individual';
    businessName?: string;
    gstin?: string;
  };
  jobSite: {
    address: string;
    deliveryLocality?: string;
    landmark?: string;
    floorUnit?: string;
    gateCode?: string;
    siteContactName: string;
    sitePhone: string;
    tradeType?: string;
    jobTag?: string;
    coordinates?: Coordinates;
  };
  // Fleet Assignment
  rider?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    etaMinutes: number;
    photo?: string;
    currentSpeedKmH?: number;
    distanceMeters?: number;
  };
  deliveryOtp: string;
  paymentMethod: 'Instant UPI' | 'Corporate Card' | 'Pay on Delivery' | 'Pay on Jobsite' | 'Trade Credit (Net 30)';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  clientInvoiceNeeded: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
  notes?: string[];
  preparationStartTime?: string;
  packedTime?: string;
  slaTargetMinutes?: number;
}

export interface SellerProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  mrp: number;
  packingCharges?: number;
  otherCharges?: number;
  platformCommissionPercent?: number;
  gstOnCommissionPercent?: number;
  netSellerRevenue?: number;
  finalListingPrice?: number;
  unit: string;
  stockCount: number;
  minStockAlert: number;
  inStock: boolean;
  status: ProductStockStatus;
  binLocation: string;
  description: string;
  specs: Record<string, string>;
  hsnCode: string;
  gstRatePercent: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  image?: string;
  images?: string[];
  badge?: string;
  tags: string[];
  updatedAt: string;
}

export interface SellerEarningsSummary {
  todaySales: number;
  todayOrders: number;
  todayNetEarnings: number;
  averageOrderValue: number;
  growthVsYesterdayPercent: number;
  pendingPayableBalance: number;
  settledBalance: number;
  totalLifetimeSales: number;
  totalLifetimeEarnings: number;
  monthSales?: number;
  tdsDeducted?: number;
  commissionPaid?: number;
  nextPayoutDate: string;
  totalCommissionDeducted: number;
  totalTdsDeducted: number;
  pendingPayoutCount: number;
}

export interface SellerLedgerEntry {
  id: string;
  date: string;
  timestamp: string;
  type: 'PRODUCT_SALE' | 'COMMISSION_DEDUCTION' | 'TDS_DEDUCTION' | 'PAYOUT_SETTLED' | 'REFUND_ADJUSTMENT';
  category: 'CREDIT' | 'DEBIT';
  title: string;
  description: string;
  amount: number;
  orderNumber?: string;
  status: 'CLEARED' | 'PENDING' | 'PROCESSING';
  utrNumber?: string;
  payoutMode?: 'NEFT' | 'IMPS' | 'UPI';
}

export interface SellerNotification {
  id: string;
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'RIDER_ARRIVED' | 'PAYOUT_RELEASED' | 'STORE_STATUS';
  title: string;
  message: string;
  context: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'NORMAL' | 'URGENT';
  actionLabel?: string;
  actionTab?: string;
  referenceId?: string;
}

export type AnalyticsPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';

export interface SellerAnalyticsMetrics {
  period: AnalyticsPeriod;
  periodLabel: string;
  dateRangeText: string;

  totalOrders: number;
  totalOrdersGrowthPercent: number;
  totalDelivered: number;
  totalDeliveredGrowthPercent: number;
  totalCanceled: number;
  totalCanceledPercent: number;
  totalRevenue: number;
  totalRevenueGrowthPercent: number;

  grossSales: number;
  commissionFee: number;
  netProfit: number;
  tdsAmount?: number;
  tcsAmount?: number;
  totalTaxDeductions?: number;
  netPayoutAfterTdsTcs?: number;
  marginPercent: number;
  averageOrderValue: number;

  gauges: {
    totalOrderCompletion: number;
    customerGrowth: number;
    revenueTargetAchieved: number;
  };

  weeklyOrderTrend: {
    day: string;
    fullDate: string;
    orders: number;
    sales: number;
  }[];
  orderTrendTitle?: string;
  orderTrendSubtitle?: string;

  revenueComparison: {
    month: string;
    currentYear: number;
    previousYear: number;
  }[];
  revenueCurrentLabel?: string;
  revenuePreviousLabel?: string;

  customerMapDistribution: {
    day: string;
    instantOrders: number;
    scheduledOrders: number;
  }[];

  hourlyOrderDistribution?: { hour: string; count: number; sales: number }[];
  hourlyVolume?: { hour: string; orders: number; sales: number }[];
  categoryPerformance?: { category: string; sharePercent: number; sales: number }[];
  fulfillmentSla?: {
    avgPrepTimeMins: number;
    targetPrepTimeMins: number;
    onTimeFulfillmentPercent: number;
    handoverTimeAvgMins: number;
  };
  slaAdherencePercent: number;
  avgPreparationMinutes: number;
  cancellationRatePercent: number;
  topProducts: {
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
    stockRemaining?: number;
    badge?: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export type ReturnStatus =
  | 'requested'
  | 'pending_inspection'
  | 'approved'
  | 'restocked'
  | 'rejected';

export interface SellerReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  refundAmount: number;
  reason: string;
  condition: 'UNOPENED' | 'DAMAGED' | 'DEFECTIVE' | 'WRONG_ITEM' | 'CUSTOMER_REFUSED';
  image?: string;
  sku?: string;
  binLocation?: string;
  customerPhotos?: string[];
}

export interface SellerReturnOrder {
  id: string;
  returnNumber: string;
  originalOrderId: string;
  originalOrderNumber: string;
  customerName: string;
  customerPhone?: string;
  requestedAt: string;
  updatedAt?: string;
  status: ReturnStatus;
  items: SellerReturnItem[];
  totalRefundAmount: number;
  reasonCategory: 'DAMAGED' | 'WRONG_ITEM' | 'DEFECTIVE' | 'RTO_REFUSED' | 'NOT_NEEDED';
  reasonDescription: string;
  customerReasonNote: string;
  customerPhotos: string[];
  inspectionPhotos?: string[];
  rejectionReason?: string;
  resolutionNote?: string;
  pickupRider?: {
    name: string;
    phone: string;
    vehicle: string;
    etaMinutes?: number;
  };
  restocked: boolean;
}
