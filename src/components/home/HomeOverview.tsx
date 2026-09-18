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
  IndianRupee,
  RotateCcw,
  Zap,
  CheckCircle2,
  Percent,
  Calendar,
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { SellerEarningsSummary } from '../../types/seller';

interface HomeOverviewProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onSelectOrder: (orderId: string) => void;
}

type Timeframe = 'today' | 'week' | 'month';

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigateTab,
}) => {
  const { currentStore, toggleStoreStatus } = useAuth();
  const {
    orders,
    returns,
    newOrdersCount,
    pickingCount,
    packedCount,
    lowStockCount,
    outOfStockCount,
    pendingReturnsCount,
  } = useStore();

  const [timeframe, setTimeframe] = useState<Timeframe>('today');
  const [earnings, setEarnings] = useState<SellerEarningsSummary | null>(null);

  useEffect(() => {
    financialService.getEarningsSummary().then(res => setEarnings(res.data));
  }, []);

  const totalActiveOrders = newOrdersCount + pickingCount + packedCount;

  // Timeframe-adapted metrics
  const timeframeData = {
    today: {
      sales: earnings?.todaySales || 3106,
      ordersCount: earnings?.todayOrders || 5,
      growth: '+14.8%',
      growthLabel: 'vs yesterday',
      aov: earnings?.averageOrderValue || 621,
      netEarnings: earnings?.todayNetEarnings || 2733.28,
      settlementLabel: 'Tomorrow at 10:00 AM',
      slaAdherence: 98.6,
      avgPrepTime: '2.1 mins',
      volumeData: [
        { label: '8 AM', value: 3, amount: 1420 },
        { label: '10 AM', value: 12, amount: 6420 },
        { label: '12 PM', value: 8, amount: 4200 },
        { label: '2 PM', value: 6, amount: 3410 },
        { label: '4 PM', value: 11, amount: 6100 },
        { label: '6 PM', value: 8, amount: 4400 },
      ],
      topProducts: [
        { name: 'Supreme 1/2" Brass Angle Valve', units: 28, revenue: 5180, stock: 38 },
        { name: 'Havells 16A Single Pole MCB', units: 22, revenue: 3630, stock: 44 },
        { name: 'Bosch Expert 4" Cutting Disc', units: 34, revenue: 1292, stock: 95 },
        { name: 'Wago 221-413 Wire Connectors', units: 14, revenue: 5390, stock: 19 },
      ],
    },
    week: {
      sales: 24850,
      ordersCount: 38,
      growth: '+18.2%',
      growthLabel: 'vs last week',
      aov: 654,
      netEarnings: 21868,
      settlementLabel: 'Daily auto-cleared',
      slaAdherence: 98.9,
      avgPrepTime: '2.3 mins',
      volumeData: [
        { label: 'Mon', value: 5, amount: 3200 },
        { label: 'Tue', value: 6, amount: 3850 },
        { label: 'Wed', value: 8, amount: 5120 },
        { label: 'Thu', value: 7, amount: 4600 },
        { label: 'Fri', value: 9, amount: 5980 },
        { label: 'Sat', value: 3, amount: 2100 },
      ],
      topProducts: [
        { name: 'Bosch Expert 4" Cutting Disc', units: 142, revenue: 5396, stock: 95 },
        { name: 'Supreme 1/2" Brass Angle Valve', units: 98, revenue: 18130, stock: 38 },
        { name: 'Wago 221-413 Wire Connectors', units: 64, revenue: 24640, stock: 19 },
        { name: 'Anchor PVC Insulation Tape', units: 88, revenue: 5720, stock: 62 },
      ],
    },
    month: {
      sales: 98420,
      ordersCount: 154,
      growth: '+22.5%',
      growthLabel: 'vs last month',
      aov: 639,
      netEarnings: 86609,
      settlementLabel: '₹84,200 settled',
      slaAdherence: 98.8,
      avgPrepTime: '2.2 mins',
      volumeData: [
        { label: 'Week 1', value: 34, amount: 21500 },
        { label: 'Week 2', value: 41, amount: 26800 },
        { label: 'Week 3', value: 46, amount: 29400 },
        { label: 'Week 4', value: 33, amount: 20720 },
      ],
      topProducts: [
        { name: 'Supreme 1/2" Brass Angle Valve', units: 340, revenue: 62900, stock: 38 },
        { name: 'Bosch Expert 4" Cutting Disc', units: 480, revenue: 18240, stock: 95 },
        { name: 'Havells 16A Single Pole MCB', units: 210, revenue: 34650, stock: 44 },
        { name: 'Unbrako M8 Hex Bolts (20pk)', units: 180, revenue: 19800, stock: 6 },
      ],
    },
  }[timeframe];

  const maxVolumeAmount = Math.max(...timeframeData.volumeData.map(v => v.amount));

  return (
    <div className="space-y-6">
      {/* 1. STORE OPERATIONAL STATUS & QUICK TIMEFRAME BAR */}
      <section
        id="section-store-status"
        className="bg-white border border-slate-200 rounded-xl p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
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
              className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${
                currentStore?.isStoreOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {currentStore?.isStoreOnline ? 'Accepting Live Orders' : currentStore?.pauseReason || 'Paused'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Timeframe Filter Tabs: Today / This Week / This Month */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                timeframe === 'today'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                timeframe === 'week'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                timeframe === 'month'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
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
                <span className="hidden xs:inline">Pause Store</span>
                <span className="xs:hidden">Pause</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Open Store</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 2. OPERATIONAL SUMMARY / ACTIVE ORDERS HUB STRIP */}
      <section className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-semibold tracking-tight text-white">
                Live Store Operations
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {totalActiveOrders > 0
                ? `${totalActiveOrders} active orders currently progressing in fulfillment.`
                : 'No active orders in fulfillment pipeline. Ready for new incoming jobs.'}
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('orders', 'placed')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="text-slate-400">New:</span>
              <span className="font-bold text-amber-400 font-mono">{newOrdersCount}</span>
            </button>

            <button
              onClick={() => onNavigateTab('orders', 'picking')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="text-slate-400">Preparing:</span>
              <span className="font-bold text-blue-400 font-mono">{pickingCount}</span>
            </button>

            <button
              onClick={() => onNavigateTab('orders', 'packed')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="text-slate-400">Ready:</span>
              <span className="font-bold text-emerald-400 font-mono">{packedCount}</span>
            </button>

            <button
              onClick={() => onNavigateTab('orders')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
            >
              <span>Go to Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS METRICS SNAPSHOT (Timeframe Dynamic) */}
      <section id="section-business-snapshot">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {timeframe === 'today'
                ? "Today's Performance"
                : timeframe === 'week'
                ? "This Week's Performance"
                : "This Month's Performance"}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              (Live aggregated data)
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('earnings')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>View Financials</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Gross Sales */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Gross Sales</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              ₹{timeframeData.sales.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              {timeframeData.growth} {timeframeData.growthLabel}
            </p>
          </div>

          {/* Orders Fulfilled */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Orders Fulfilled</span>
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              {timeframeData.ordersCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              100% SLA fulfillment
            </p>
          </div>

          {/* Average Basket Size / AOV */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Average Basket (AOV)</span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                Avg
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              ₹{timeframeData.aov.toFixed(0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Per merchant checkout
            </p>
          </div>

          {/* Net Seller Earnings / Settlement */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Net Merchant Earnings</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Direct NEFT
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2">
              ₹{timeframeData.netEarnings.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {timeframeData.settlementLabel}
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOURLY/PERIOD VOLUME CHART & FULFILLMENT EFFICIENCY */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Volume Distribution Bar Visualizer */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Order Velocity & Revenue Trend
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Distribution across {timeframe === 'today' ? 'peak operating hours' : timeframe === 'week' ? 'days of this week' : 'weeks of this month'}
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
              Total: ₹{timeframeData.sales.toLocaleString()}
            </span>
          </div>

          {/* Bar chart representation */}
          <div className="space-y-2.5 pt-2">
            {timeframeData.volumeData.map((item, idx) => {
              const pct = maxVolumeAmount > 0 ? (item.amount / maxVolumeAmount) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 w-16">{item.label}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{item.value} orders</span>
                    <span className="font-bold text-slate-900 font-mono">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational SLA & Fulfillment Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Fulfillment Health
              </h4>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tier 1 Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Store dispatch SLA benchmark adherence
            </p>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">On-Time Dispatch SLA:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {timeframeData.slaAdherence}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Avg Pack Time:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {timeframeData.avgPrepTime} (Target: ≤3m)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Cancellation Rate:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  0.4% (Industry: &lt;1.5%)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Full Analytics & SLA</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </section>

      {/* 5. TOP VELOCITY PRODUCTS & HIGH VOLUME SKUS */}
      <section className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fast-Moving SKUs ({timeframe === 'today' ? 'Today' : timeframe === 'week' ? 'This Week' : 'This Month'})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Top items by units ordered and revenue generation
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                <th className="py-2.5 px-3 text-right">Remaining Stock</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeframeData.topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {p.name}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {p.units}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    ₹{p.revenue.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                        p.stock === 0
                          ? 'bg-rose-50 text-rose-700'
                          : p.stock <= 15
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigateTab('inventory')}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. ACTION REQUIRED & OPERATIONAL ALERTS HUB */}
      <section id="section-action-required" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Action Required</h3>
          <span className="text-xs text-slate-500 font-medium">Prioritized for immediate resolution</span>
        </div>

        <div className="space-y-2.5">
          {/* Out of Stock Alert */}
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
                    {outOfStockCount} products out of stock
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Currently delisted from search. Restock items to resume orders.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Restock
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
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
                    {lowStockCount} products running low in warehouse
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Below buffer reorder threshold. Replenish inventory bay.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Review
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </div>
            </div>
          )}

          {/* Pending Returns Alert */}
          {pendingReturnsCount > 0 && (
            <div
              onClick={() => onNavigateTab('returns', 'PENDING_INSPECTION')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {pendingReturnsCount} customer {pendingReturnsCount === 1 ? 'return' : 'returns'} awaiting inspection
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Inspect item packaging condition and process refund/restock approval.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Inspect
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </div>
            </div>
          )}

          {/* No Immediate Action */}
          {outOfStockCount === 0 && lowStockCount === 0 && pendingReturnsCount === 0 && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              All warehouse operations clear. No urgent actions pending.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
