import React from 'react';
import { OrderStatus, ProductStockStatus } from '../../types/seller';
import { Clock, PackageCheck, Truck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface OrderBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const OrderStatusBadge: React.FC<OrderBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-xs px-3 py-1.5 gap-2 font-semibold',
  }[size];

  switch (status) {
    case 'placed':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>New Order</span>
        </span>
      );
    case 'picking':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-blue-600" />
          <span>Preparing</span>
        </span>
      );
    case 'packed':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 ${sizeClasses}`}
        >
          <PackageCheck className="w-3 h-3 text-emerald-600" />
          <span>Ready for Pickup</span>
        </span>
      );
    case 'out_for_delivery':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-md bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}
        >
          <Truck className="w-3 h-3 text-purple-600" />
          <span>Out for Delivery</span>
        </span>
      );
    case 'arriving':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}
        >
          <Truck className="w-3 h-3 text-indigo-600" />
          <span>Rider Arriving</span>
        </span>
      );
    case 'delivered':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    case 'cancelled':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <XCircle className="w-3 h-3 text-rose-500" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

interface StockBadgeProps {
  status: ProductStockStatus;
  count?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StockStatusBadge: React.FC<StockBadgeProps> = ({ status, count, unit = 'units', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  if (status === 'OUT_OF_STOCK' || count === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-medium bg-rose-50 text-rose-700 border border-rose-200 ${sizeClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Out of Stock</span>
      </span>
    );
  }

  if (status === 'LOW_STOCK') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-medium bg-amber-50 text-amber-800 border border-amber-200 ${sizeClass}`}>
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Low Stock {count !== undefined ? `· ${count} ${unit}` : ''}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>In Stock {count !== undefined ? `· ${count} ${unit}` : ''}</span>
    </span>
  );
};

export const ReturnStatusBadge: React.FC<{ status: 'PENDING_INSPECTION' | 'APPROVED_REFUNDED' | 'REJECTED_DISPUTED' | 'PICKUP_SCHEDULED'; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'PENDING_INSPECTION':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${sizeClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Pending Inspection</span>
        </span>
      );
    case 'APPROVED_REFUNDED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClass}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Refund Approved</span>
        </span>
      );
    case 'REJECTED_DISPUTED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-rose-50 text-rose-800 border border-rose-200 ${sizeClass}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Disputed / Rejected</span>
        </span>
      );
    case 'PICKUP_SCHEDULED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-blue-50 text-blue-800 border border-blue-200 ${sizeClass}`}>
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>Pickup Scheduled</span>
        </span>
      );
    default:
      return <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 ${sizeClass}`}>{status}</span>;
  }
};
