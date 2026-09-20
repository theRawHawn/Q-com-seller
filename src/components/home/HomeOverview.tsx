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
import { getSellerAnalyticsData } from '../../services/analyticsService';
import { SellerEarningsSummary, AnalyticsPeriod } from '../../types/seller';

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
  const [overviewPeriod, setOverviewPeriod] = useState<AnalyticsPeriod>('TODAY');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-18');

  useEffect(() => {
    financialService.getEarningsSummary().then(res => setEarnings(res.data));
  }, []);

  // Compute metrics dynamically from the single source of truth analytics engine
  const activeSellerMetrics = useMemo(() => {
    return getSellerAnalyticsData(overviewPeriod, customStartDate, customEndDate);
  }, [overviewPeriod, customStartDate, customEndDate]);

  const financialMetrics = useMemo(() => {
    return {
      periodLabel: activeSellerMetrics.periodLabel,
      sales: activeSellerMetrics.grossSales,
      commissionFee: activeSellerMetrics.commissionFee,
      tdsAmount: activeSellerMetrics.tdsAmount ?? +(activeSellerMetrics.grossSales * 0.01).toFixed(1),
      tcsAmount: activeSellerMetrics.tcsAmount ?? +(activeSellerMetrics.grossSales * 0.005).toFixed(1),
      totalTaxDeductions: activeSellerMetrics.totalTaxDeductions ?? +(activeSellerMetrics.grossSales * 0.006).toFixed(1),
      netPayoutAfterTdsTcs: activeSellerMetrics.netPayoutAfterTdsTcs ?? +(activeSellerMetrics.grossSales * 0.874).toFixed(1),
      netProfit: activeSellerMetrics.netProfit,
      marginPercent: activeSellerMetrics.marginPercent,
      ordersCount: activeSellerMetrics.totalOrders,
      fulfilledOrders: activeSellerMetrics.totalDelivered,
      cancelledOrders: activeSellerMetrics.totalCanceled,
      aov: activeSellerMetrics.averageOrderValue,
    };
  }, [activeSellerMetrics]);

  // Top selling items directly derived from active seller metrics
  const topSellingItems = useMemo(() => {
    return activeSellerMetrics.topProducts;
  }, [activeSellerMetrics]);

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
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full sm:w-auto">
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
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Gross Sales</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              ₹{financialMetrics.sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">
              Total customer bill
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-slate-500">Platform Fees</span>
              <span
                className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap leading-none"
                title="15% minimum platform commission rate is centrally configured and managed via QCOM Admin Panel"
              >
                15% Min
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-rose-600 mt-2">
              -₹{financialMetrics.commissionFee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p
              className="text-[10px] text-slate-400 font-medium mt-1 truncate"
              title="Platform rate is non-negotiable by seller; managed directly via QCOM Platform Admin Panel"
            >
              Managed by QCOM Admin
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-amber-900">TDS & TCS</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                0.6% Total
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-amber-900 mt-2">
              -₹{financialMetrics.totalTaxDeductions.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            </p>
            <p className="text-[10px] text-amber-700 font-medium mt-1 truncate">
              TDS (0.1%) + TCS (0.5%)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Net After TDS & TCS</span>
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-emerald-800 mt-2">
              ₹{financialMetrics.netPayoutAfterTdsTcs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-1 truncate">
              Net bank credit (84.4%)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Average Order</span>
              <Percent className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-2">
              ₹{financialMetrics.aov.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">
              AOV per completed order
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


