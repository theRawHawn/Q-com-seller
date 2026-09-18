import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  Calendar,
  Zap,
  CheckCircle2,
  Star,
  ShieldCheck,
  Percent,
  ArrowUpRight,
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { SellerEarningsSummary } from '../../types/seller';

interface HomeOverviewProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onSelectOrder: (orderId: string) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigateTab,
}) => {
  const { currentStore, toggleStoreStatus } = useAuth();
  const {
    newOrdersCount,
    pickingCount,
    packedCount,
    lowStockCount,
    outOfStockCount,
    pendingReturnsCount,
  } = useStore();

  const [earnings, setEarnings] = useState<SellerEarningsSummary | null>(null);
  const [overviewPeriod, setOverviewPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'>('TODAY');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-18');

  useEffect(() => {
    financialService.getEarningsSummary().then(res => setEarnings(res.data));
  }, []);

  // Compute metrics based on selected timeframe filter
  const financialMetrics = useMemo(() => {
    let sales = 3106;
    let ordersCount = 5;
    let fulfilledOrders = 4;
    let cancelledOrders = 1;
    let commissionFee = 372.7; // 12%
    let netProfit = 2733.3;
    let periodLabel = 'Today';

    if (overviewPeriod === 'TODAY') {
      sales = earnings?.todaySales || 3106;
      ordersCount = earnings?.todayOrders || 5;
      fulfilledOrders = 4;
      cancelledOrders = 1;
      commissionFee = sales * 0.12;
      netProfit = sales - commissionFee;
      periodLabel = 'Today';
    } else if (overviewPeriod === 'WEEK') {
      sales = 24850;
      ordersCount = 38;
      fulfilledOrders = 36;
      cancelledOrders = 2;
      commissionFee = sales * 0.12;
      netProfit = sales - commissionFee;
      periodLabel = 'Last Week';
    } else if (overviewPeriod === 'MONTH') {
      sales = earnings?.monthSales || 64200;
      ordersCount = 102;
      fulfilledOrders = 98;
      cancelledOrders = 4;
      commissionFee = sales * 0.12;
      netProfit = sales - commissionFee;
      periodLabel = 'This Month';
    } else if (overviewPeriod === 'YEAR') {
      sales = earnings?.totalLifetimeSales || 486250;
      ordersCount = 780;
      fulfilledOrders = 762;
      cancelledOrders = 18;
      commissionFee = sales * 0.12;
      netProfit = sales - commissionFee;
      periodLabel = 'This Year';
    } else {
      // CUSTOM RANGE
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      sales = daysCount * 3200;
      ordersCount = daysCount * 5;
      fulfilledOrders = Math.round(ordersCount * 0.96);
      cancelledOrders = ordersCount - fulfilledOrders;
      commissionFee = sales * 0.12;
      netProfit = sales - commissionFee;
      periodLabel = `${daysCount} Days Selected`;
    }

    const marginPercent = sales > 0 ? ((netProfit / sales) * 100).toFixed(1) : '88.0';
    const aov = ordersCount > 0 ? Math.round(sales / ordersCount) : 0;

    return {
      periodLabel,
      sales,
      commissionFee,
      netProfit,
      marginPercent,
      ordersCount,
      fulfilledOrders,
      cancelledOrders,
      aov,
    };
  }, [overviewPeriod, customStartDate, customEndDate, earnings]);

  // Top selling items based on time period using exact Analytics UI pattern
  const topSellingItems = useMemo(() => {
    const periodMultiplier =
      overviewPeriod === 'TODAY'
        ? 1
        : overviewPeriod === 'WEEK'
        ? 7
        : overviewPeriod === 'MONTH'
        ? 24
        : overviewPeriod === 'YEAR'
        ? 180
        : 10;

    return [
      {
        id: 'PLM-ANG-01',
        name: 'Ceramic Disc Brass Angle Valve 1/2" Chrome',
        unitsSold: 28 * periodMultiplier,
        revenue: 28 * 285 * periodMultiplier,
        badge: 'High Velocity',
      },
      {
        id: 'PLM-TEF-03',
        name: 'SealLock High-Density Teflon PTFE Tape (Pack of 3)',
        unitsSold: 42 * periodMultiplier,
        revenue: 42 * 45 * periodMultiplier,
        badge: 'High Velocity',
      },
      {
        id: 'ELE-WIR-02',
        name: 'Polycab Optima 2.5 sq mm FR PVC Wire (90m Box)',
        unitsSold: 12 * periodMultiplier,
        revenue: 12 * 2150 * periodMultiplier,
        badge: 'High Velocity',
      },
      {
        id: 'PTL-GRN-01',
        name: 'Bosch GWS 600 Professional Angle Grinder (100mm)',
        unitsSold: 8 * periodMultiplier,
        revenue: 8 * 2450 * periodMultiplier,
        badge: 'High Velocity',
      },
    ];
  }, [overviewPeriod]);

  return (
    <div className="space-y-6">
      {/* 1. STORE OPERATIONAL STATUS STRIP */}
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

      {/* 2. LIVE ACTIVE ORDERS TALLY */}
      <section id="section-active-orders" className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Active Orders</h3>
            <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {newOrdersCount + pickingCount + packedCount}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>View Orders Tab</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 3 Unified Clean Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigateTab('orders', 'placed')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              newOrdersCount > 0
                ? 'border-amber-400/90 ring-1 ring-amber-400/20'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">New Orders</span>
              {newOrdersCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 mt-2">
              {newOrdersCount}
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('orders', 'picking')}
            className="p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Preparing</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 mt-2">
              {pickingCount}
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('orders', 'packed')}
            className="p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Ready</span>
              <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 mt-2">
              {packedCount}
            </p>
          </button>
        </div>
      </section>

      {/* 3. ACTION REQUIRED */}
      <section id="section-action-required">
        <h3 className="text-sm font-bold text-slate-900 mb-2.5">Action Required</h3>
        <div className="space-y-2">
          {pendingReturnsCount > 0 && (
            <div
              onClick={() => onNavigateTab('returns', 'requested')}
              className="p-3.5 rounded-xl bg-white border border-amber-300 hover:border-amber-400 transition-colors flex items-center justify-between gap-3 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                  <RotateCcw className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {pendingReturnsCount} {pendingReturnsCount === 1 ? 'return request' : 'return requests'} awaiting review
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          )}

          {outOfStockCount > 0 && (
            <div
              onClick={() => onNavigateTab('products', 'OUT_OF_STOCK')}
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
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          )}

          {lowStockCount > 0 && (
            <div
              onClick={() => onNavigateTab('products', 'LOW_STOCK')}
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
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          )}

          {pendingReturnsCount === 0 && outOfStockCount === 0 && lowStockCount === 0 && pickingCount === 0 && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              All clear. No immediate actions pending.
            </div>
          )}
        </div>
      </section>

      {/* 4. FINANCIAL BREAKDOWN (Sales vs Net Profit) WITH TIMEFRAME FILTERS */}
      <section id="section-financial-breakdown" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <h3 className="text-sm font-bold text-slate-900">Financial Breakdown</h3>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 flex-wrap">
            {(
              [
                { id: 'TODAY', label: 'Today' },
                { id: 'WEEK', label: 'Last Week' },
                { id: 'MONTH', label: 'Month' },
                { id: 'YEAR', label: 'Year' },
                { id: 'CUSTOM', label: 'Manual Range' },
              ] as const
            ).map(p => (
              <button
                key={p.id}
                onClick={() => setOverviewPeriod(p.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  overviewPeriod === p.id
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Date Selector inputs when CUSTOM is active */}
        {overviewPeriod === 'CUSTOM' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 flex-wrap text-xs text-slate-700 shadow-2xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Custom Range:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-500">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-500">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Financial Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Gross Sales</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              ₹{financialMetrics.sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Platform Fees</span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                12% Commission
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              -₹{financialMetrics.commissionFee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Net Profit</span>
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-emerald-800 mt-2">
              ₹{financialMetrics.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Net Margin</span>
              <Percent className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              {financialMetrics.marginPercent}%
            </p>
          </div>
        </div>
      </section>

      {/* 4. TOTAL ORDERS BREAKDOWN */}
      <section id="section-total-orders" className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Total Orders Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Orders</span>
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              {financialMetrics.ordersCount}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Fulfilled Orders</span>
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              {financialMetrics.fulfilledOrders}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Average Order Value</span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                AOV
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              ₹{financialMetrics.aov.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Cancelled / Returned</span>
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              {financialMetrics.cancelledOrders}
            </p>
          </div>
        </div>
      </section>

      {/* 5. ORDER ACCURACY & QUALITY SCORE */}
      <section id="section-quality-score" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Order Accuracy & Quality Score</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Fulfillment Accuracy</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              99.2%
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Store Rating</span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              4.85 <span className="text-xs font-normal text-slate-500">/ 5.0</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Return Rate</span>
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              1.15%
            </p>
          </div>
        </div>
      </section>

      {/* 6. TOP SELLING ITEMS */}
      <section id="section-top-selling-items" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Top selling items</h3>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>View Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="divide-y divide-slate-100">
            {topSellingItems.map((p, idx) => (
              <div key={p.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="w-5 font-bold tabular-nums text-slate-400 text-center shrink-0">{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{p.unitsSold.toLocaleString()} units delivered</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold tabular-nums text-slate-900">₹{p.revenue.toLocaleString('en-IN')}</p>
                  <span className="text-emerald-700 font-semibold text-[10px]">{p.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


