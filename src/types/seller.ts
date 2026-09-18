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
  slaAdherencePercent: number;
  joinedDate: string;
  documents: VerificationDocuments;
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

export interface SellerAnalyticsMetrics {
  hourlyOrderDistribution: { hour: string; count: number; sales: number }[];
  hourlyVolume?: { hour: string; orders: number; sales: number }[];
  categoryPerformance: { category: string; sharePercent: number; sales: number }[];
  fulfillmentSla: {
    avgPrepTimeMins: number;
    targetPrepTimeMins: number;
    onTimeFulfillmentPercent: number;
    handoverTimeAvgMins: number;
  };
  slaAdherencePercent?: number;
  avgPreparationMinutes?: number;
  cancellationRatePercent?: number;
  topProducts: {
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
    stockRemaining: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
