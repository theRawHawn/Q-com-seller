import React, { useState, useEffect } from 'react';
import { OrderStatus, ProductStockStatus, ReturnStatus, SellerOrder } from '../../types/seller';
import {
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Boxes,
  ShieldAlert,
} from 'lucide-react';

interface OrderBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  order?: SellerOrder;
  preparationStartTime?: string;
  slaTargetMinutes?: number;
}

export const OrderStatusBadge: React.FC<OrderBadgeProps> = ({
  status,
  size = 'md',
  order,
  preparationStartTime,
  slaTargetMinutes,
}) => {
  const [, setTick] = useState(0);

  // Live countdown tick for preparing orders
  useEffect(() => {
    if (status !== 'picking') return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

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
    case 'picking': {
      const startTime = order?.preparationStartTime || preparationStartTime || order?.placedAt;
      const targetMins = order?.slaTargetMinutes || slaTargetMinutes || 3;

      let timerStr: string | null = null;
      let isBreached = false;
      let isWarning = false;

      if (startTime) {
        const startMs = new Date(startTime).getTime();
        const elapsedSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        const totalSecs = Math.round(targetMins * 60);
        const remSecs = totalSecs - elapsedSecs;

        if (remSecs < 0) {
          isBreached = true;
          const abs = Math.abs(remSecs);
          const m = Math.floor(abs / 60);
          const s = abs % 60;
          timerStr = `+${m}:${s.toString().padStart(2, '0')}`;
        } else {
          if (remSecs <= 60) isWarning = true;
          const m = Math.floor(remSecs / 60);
          const s = remSecs % 60;
          timerStr = `${m}:${s.toString().padStart(2, '0')}`;
        }
      }

      if (isBreached) {
        return (
          <span
            id={`badge-status-${status}`}
            title={`SLA Breached by ${timerStr?.replace('+', '')} (Target: ${targetMins} mins)`}
            className={`inline-flex items-center rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
          >
            <Clock className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>Preparing</span>
            {timerStr && (
              <>
                <span className="text-rose-300">•</span>
                <span className="font-mono tabular-nums font-bold">{timerStr}</span>
              </>
            )}
          </span>
        );
      }

      if (isWarning) {
        return (
          <span
            id={`badge-status-${status}`}
            title={`Under 1 minute left on standard ${targetMins}m packing SLA`}
            className={`inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}
          >
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Preparing</span>
            {timerStr && (
              <>
                <span className="text-amber-300">•</span>
                <span className="font-mono tabular-nums font-bold">{timerStr}</span>
              </>
            )}
          </span>
        );
      }

      return (
        <span
          id={`badge-status-${status}`}
          title={`Standard Fulfillment SLA (${targetMins} mins)`}
          className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-blue-600" />
          <span>Preparing</span>
          {timerStr && (
            <>
              <span className="text-blue-300">•</span>
              <span className="font-mono tabular-nums font-semibold">{timerStr}</span>
            </>
          )}
        </span>
      );
    }
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
}

export const StockStatusBadge: React.FC<StockBadgeProps> = ({ status, count, unit = 'units' }) => {
  if (status === 'OUT_OF_STOCK' || count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Out of Stock</span>
      </span>
    );
  }

  if (status === 'LOW_STOCK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Low Stock · {count} {unit}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>In Stock {count !== undefined ? `· ${count}` : ''}</span>
    </span>
  );
};

interface ReturnBadgeProps {
  status: ReturnStatus;
  size?: 'sm' | 'md';
}

export const ReturnStatusBadge: React.FC<ReturnBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  }[size];

  switch (status) {
    case 'requested':
    case 'pending_inspection':
      return (
        <span
          id={`badge-return-${status}`}
          className={`inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Awaiting Review</span>
        </span>
      );
    case 'restocked':
      return (
        <span
          id={`badge-return-${status}`}
          className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 ${sizeClasses}`}
        >
          <Boxes className="w-3 h-3 text-emerald-600" />
          <span>Restocked to Shelf</span>
        </span>
      );
    case 'approved':
      return (
        <span
          id={`badge-return-${status}`}
          className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          <span>Refunded (Written Off)</span>
        </span>
      );
    case 'rejected':
      return (
        <span
          id={`badge-return-${status}`}
          className={`inline-flex items-center rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          <span>Rejected</span>
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
