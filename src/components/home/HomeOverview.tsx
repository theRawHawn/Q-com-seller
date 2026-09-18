import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  PauseCircle,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Clock,
  PackageCheck,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Truck,
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { financialService } from '../../services/financialService';
import { SellerEarningsSummary } from '../../types/seller';

interface HomeOverviewProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onSelectOrder: (orderId: string) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigateTab,
  onSelectOrder,
}) => {
  const { currentStore, toggleStoreStatus } = useAuth();
  const {
    orders,
    newOrdersCount,
    pickingCount,
    packedCount,
    lowStockCount,
    outOfStockCount,
    acceptOrder,
    markOrderReady,
    markOrderHandedOver,
  } = useStore();

  const [earnings, setEarnings] = useState<SellerEarningsSummary | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'placed' | 'picking' | 'packed' | 'all'>('placed');

  // Auto-switch tab if no new orders but preparing orders exist
  useEffect(() => {
    if (newOrdersCount === 0 && pickingCount > 0 && activeTabFilter === 'placed') {
      setActiveTabFilter('picking');
    }
  }, [newOrdersCount, pickingCount]);

  useEffect(() => {
    financialService.getEarningsSummary().then(res => setEarnings(res.data));
  }, []);

  const handleQuickAccept = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setProcessingOrderId(orderId);
    try {
      await acceptOrder(orderId);
      setActiveTabFilter('picking');
      // Automatically open the order detail in packing mode so the seller knows exactly what to pack
      onSelectOrder(orderId);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleQuickReady = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setProcessingOrderId(orderId);
    try {
      await markOrderReady(orderId);
      setActiveTabFilter('packed');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleQuickHandover = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setProcessingOrderId(orderId);
    try {
      await markOrderHandedOver(orderId);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const activeOrdersToDisplay = orders.filter(o => {
    if (activeTabFilter === 'all') return ['placed', 'picking', 'packed'].includes(o.status);
    return o.status === activeTabFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. STORE OPERATIONAL STATUS STRIP - Clean, Professional Admin Style */}
      <section
        id="section-store-status"
        className="bg-white border border-slate-200 rounded-xl p-3 sm:px-4 flex items-center justify-between gap-2.5 sm:gap-4 shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentStore?.isStoreOnline ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
            {currentStore?.isStoreOnline && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute inset-0 animate-ping opacity-75" />
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
              {currentStore?.isStoreOnline ? 'Store is Open' : 'Store is Paused'}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md border whitespace-nowrap hidden xs:inline-block ${
                currentStore?.isStoreOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {currentStore?.isStoreOnline ? 'Accepting Orders' : currentStore?.pauseReason || 'Paused'}
            </span>
          </div>
        </div>

        <button
          onClick={() => toggleStoreStatus(!currentStore?.isStoreOnline)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
            currentStore?.isStoreOnline
              ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              : 'text-white bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          {currentStore?.isStoreOnline ? (
            <>
              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Pause Store</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Open Store</span>
            </>
          )}
        </button>
      </section>

      {/* 2. LIVE ACTIVE ORDERS - Clean Admin Tally */}
      <section id="section-active-orders" className="space-y-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Active Orders</h3>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {newOrdersCount + pickingCount + packedCount}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>View Orders</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 3 Unified Clean Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTabFilter('placed')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              activeTabFilter === 'placed'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : newOrdersCount > 0
                ? 'border-amber-400/90'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">New Orders</span>
              {newOrdersCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {newOrdersCount}
            </p>
          </button>

          <button
            onClick={() => setActiveTabFilter('picking')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              activeTabFilter === 'picking'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : pickingCount > 0
                ? 'border-slate-300'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Preparing</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {pickingCount}
            </p>
          </button>

          <button
            onClick={() => setActiveTabFilter('packed')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              activeTabFilter === 'packed'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : packedCount > 0
                ? 'border-slate-300'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Ready</span>
              <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {packedCount}
            </p>
          </button>
        </div>

        {/* Active Orders List with Visible Item Details */}
        <div className="space-y-2 mt-3">
          {activeOrdersToDisplay.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              {activeTabFilter === 'placed'
                ? 'No new orders awaiting acceptance.'
                : activeTabFilter === 'picking'
                ? 'No orders currently being prepared.'
                : 'No orders ready for pickup.'}
            </div>
          ) : (
            activeOrdersToDisplay.map(order => {
              const packedItemsCount = order.items.filter(i => i.isPacked).length;
              const totalItemsCount = order.items.length;

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className={`p-3.5 rounded-xl bg-white border transition-all cursor-pointer shadow-2xs ${
                    order.status === 'placed'
                      ? 'border-amber-300 hover:border-amber-400'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap pb-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <OrderStatusBadge status={order.status} size="sm" />
                      <span className="font-mono font-bold text-xs text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-600">
                        {order.items.length} items
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        ₹{order.total.toFixed(0)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate">
                      {order.customer.name}
                    </p>
                  </div>

                  {/* Compact Space-Efficient Item Summary */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1 truncate text-slate-700">
                      <span className="text-slate-400 font-medium mr-1.5">Items:</span>
                      {order.items.map((item, idx) => (
                        <span key={item.productId || idx}>
                          {idx > 0 && <span className="text-slate-300 mx-1.5">·</span>}
                          <span className="font-bold text-slate-900 mr-1">{item.quantity}×</span>
                          <span>{item.productName}</span>
                          {item.binLocation && (
                            <span className="text-[11px] text-slate-400 font-mono ml-1">
                              ({item.binLocation.split('•')[0].trim()})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                    {order.status === 'picking' && (
                      <span className="text-[11px] font-semibold text-emerald-800 shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {packedItemsCount}/{totalItemsCount} packed
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{order.jobSite.deliveryLocality || order.jobSite.address}</span>
                    </span>

                    <div className="shrink-0 flex items-center gap-2">
                      {order.status === 'placed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={processingOrderId === order.id}
                          onClick={e => handleQuickAccept(e, order.id)}
                        >
                          Accept Order
                        </Button>
                      )}

                      {order.status === 'picking' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={processingOrderId === order.id}
                          onClick={e => handleQuickReady(e, order.id)}
                        >
                          <PackageCheck className="w-3.5 h-3.5 mr-1" />
                          <span>Mark Ready</span>
                        </Button>
                      )}

                      {order.status === 'packed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={processingOrderId === order.id}
                          onClick={e => handleQuickHandover(e, order.id)}
                        >
                          <Truck className="w-3.5 h-3.5 mr-1" />
                          <span>Hand Over</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 3. TODAY'S BUSINESS OVERVIEW - Clean Financial Cards */}
      <section id="section-today-snapshot">
        <h3 className="text-sm font-bold text-slate-900 mb-2.5">Today's Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Sales</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              ₹{earnings?.todaySales.toLocaleString() || '3,106'}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              +14.8% vs yesterday
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Orders</span>
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              {earnings?.todayOrders || 5}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Delivered & In Transit
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Average Order</span>
              <span className="text-xs font-mono text-slate-400">AOV</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              ₹{earnings?.averageOrderValue.toFixed(0) || '621'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Per fulfilled basket
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Settlement</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Daily
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              ₹{earnings?.pendingPayableBalance.toLocaleString() || '18,450'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Next payout tomorrow 10 AM
            </p>
          </div>
        </div>
      </section>

      {/* 4. ACTION REQUIRED - Clean, Concise Alert Rows */}
      <section id="section-action-required">
        <h3 className="text-sm font-bold text-slate-900 mb-2.5">Action Required</h3>
        <div className="space-y-2">
          {outOfStockCount > 0 && (
            <div
              onClick={() => onNavigateTab('inventory', 'OUT_OF_STOCK')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <Boxes className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {outOfStockCount} items out of stock
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Currently hidden from catalog search. Update stock to resume sales.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          )}

          {lowStockCount > 0 && (
            <div
              onClick={() => onNavigateTab('inventory', 'LOW_STOCK')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {lowStockCount} items low in stock
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Below minimum buffer count. Restock recommended.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          )}

          {pickingCount > 0 && (
            <div
              onClick={() => onNavigateTab('orders', 'picking')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {pickingCount} {pickingCount === 1 ? 'order' : 'orders'} in packing
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Pack items from warehouse bin and mark ready for courier pickup.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          )}

          {outOfStockCount === 0 && lowStockCount === 0 && pickingCount === 0 && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              All clear. No immediate actions pending.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
