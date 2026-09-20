import React, { useState, useEffect, useMemo } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { SellerAnalyticsMetrics, AnalyticsPeriod } from '../../types/seller';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Download,
  ShoppingBag,
  PackageCheck,
  IndianRupee,
  Calendar,
  Zap,
  Percent,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const AnalyticsView: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('WEEK');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-18');
  const [metrics, setMetrics] = useState<SellerAnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDonutValues, setShowDonutValues] = useState(true);
  const [hoveredOrderIdx, setHoveredOrderIdx] = useState<number | null>(3);
  const [hoveredRevIdx, setHoveredRevIdx] = useState<number | null>(3);
  const [channelView, setChannelView] = useState<'WEEKLY' | 'DAILY'>('WEEKLY');
  const { showToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    analyticsService.getAnalytics(period, customStartDate, customEndDate).then(res => {
      setMetrics(res.data);
      // Reset hover index to a valid point in the new data array
      const trendLen = res.data.weeklyOrderTrend.length;
      if (trendLen > 0) {
        setHoveredOrderIdx(Math.min(3, trendLen - 1));
      }
      const revLen = res.data.revenueComparison.length;
      if (revLen > 0) {
        setHoveredRevIdx(Math.min(3, revLen - 1));
      }
      setIsLoading(false);
    });
  }, [period, customStartDate, customEndDate]);

  const handleExportReport = () => {
    showToast(
      'Report Exported',
      `Analytics summary for ${metrics?.periodLabel || 'Selected Period'} generated (CSV & PDF).`,
      'success'
    );
  };

  // Helper calculation for smooth SVG Bézier paths
  const generateSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  // Dynamic Order Trend Points Mapping
  const trendData = metrics?.weeklyOrderTrend || [];
  const maxTrendOrder = useMemo(() => {
    if (trendData.length === 0) return 10;
    const maxVal = Math.max(...trendData.map(d => d.orders), 1);
    return Math.ceil(maxVal * 1.25);
  }, [trendData]);

  const trendWidth = 600;
  const trendHeight = 190;
  const trendPadX = 35;
  const trendPadY = 25;

  const trendPoints = useMemo(() => {
    return trendData.map((d, i) => {
      const x =
        trendPadX +
        (trendData.length > 1 ? (i / (trendData.length - 1)) * (trendWidth - trendPadX * 2) : trendWidth / 2);
      const y =
        trendHeight - trendPadY - (d.orders / Math.max(1, maxTrendOrder)) * (trendHeight - trendPadY * 2);
      return { x, y, data: d, index: i };
    });
  }, [trendData, maxTrendOrder]);

  const trendLinePath = useMemo(() => generateSmoothPath(trendPoints), [trendPoints]);
  const trendAreaPath = useMemo(() => {
    if (trendPoints.length === 0) return '';
    return `${trendLinePath} L ${trendPoints[trendPoints.length - 1].x} ${trendHeight - trendPadY} L ${trendPoints[0].x} ${trendHeight - trendPadY} Z`;
  }, [trendPoints, trendLinePath]);

  // Dynamic Multi-Period Revenue Comparison Points Mapping
  const revData = metrics?.revenueComparison || [];
  const maxRev = useMemo(() => {
    if (revData.length === 0) return 1000;
    const maxVal = Math.max(...revData.flatMap(d => [d.currentYear, d.previousYear]), 1);
    return Math.ceil(maxVal * 1.2);
  }, [revData]);

  const revWidth = 650;
  const revHeight = 210;
  const revPadX = 45;
  const revPadY = 25;

  const revCurrentPoints = useMemo(() => {
    return revData.map((d, i) => {
      const x =
        revPadX +
        (revData.length > 1 ? (i / (revData.length - 1)) * (revWidth - revPadX * 2) : revWidth / 2);
      const y =
        revHeight - revPadY - (d.currentYear / Math.max(1, maxRev)) * (revHeight - revPadY * 2);
      return { x, y, val: d.currentYear, month: d.month };
    });
  }, [revData, maxRev]);

  const revPreviousPoints = useMemo(() => {
    return revData.map((d, i) => {
      const x =
        revPadX +
        (revData.length > 1 ? (i / (revData.length - 1)) * (revWidth - revPadX * 2) : revWidth / 2);
      const y =
        revHeight - revPadY - (d.previousYear / Math.max(1, maxRev)) * (revHeight - revPadY * 2);
      return { x, y, val: d.previousYear, month: d.month };
    });
  }, [revData, maxRev]);

  const revCurrentPath = useMemo(() => generateSmoothPath(revCurrentPoints), [revCurrentPoints]);
  const revPreviousPath = useMemo(() => generateSmoothPath(revPreviousPoints), [revPreviousPoints]);

  // Customer Map Bar Distribution
  const barData = metrics?.customerMapDistribution || [];
  const maxBarVal = useMemo(() => {
    if (barData.length === 0) return 10;
    const maxVal = Math.max(...barData.flatMap(b => [b.instantOrders, b.scheduledOrders]), 1);
    return Math.ceil(maxVal * 1.15);
  }, [barData]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Dashboard & Analytics</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Active Period Date Tag */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{metrics?.dateRangeText || 'Live'}</span>
          </div>

          {/* Period Filter Selector Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  period === p.id
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Date Selector inputs when CUSTOM is active */}
      {period === 'CUSTOM' && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 flex-wrap text-xs text-slate-700 shadow-2xs">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Custom Date Filter:
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

      {/* 2. Top 4 KPI Summary Cards (Synchronized with Seller Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Orders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {metrics?.totalOrders ?? 0}
            </p>
            <p className="text-xs font-bold text-slate-600 truncate">Total Orders</p>
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+{metrics?.totalOrdersGrowthPercent ?? 4.2}%</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Delivered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-700">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {metrics?.totalDelivered ?? 0}
            </p>
            <p className="text-xs font-bold text-slate-600 truncate">Total Delivered</p>
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+{metrics?.totalDeliveredGrowthPercent ?? 4.8}% SLA</span>
            </p>
          </div>
        </div>

        {/* Card 3: Total Canceled */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {metrics?.totalCanceled ?? 0}
            </p>
            <p className="text-xs font-bold text-slate-600 truncate">Total Canceled</p>
            <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 mt-0.5">
              <span>{metrics?.totalCanceledPercent ?? 1.2}% low rate</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
              ₹{(metrics?.totalRevenue ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs font-bold text-slate-600 truncate">Total Revenue</p>
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+{metrics?.totalRevenueGrowthPercent ?? 11.2}% pacing</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Donut Performance Gauges & Order Area Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Donut Gauges */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fulfillment & Conversion Gauges</h3>
              <p className="text-[11px] text-slate-500">Live SLA targets & buyer metrics</p>
            </div>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDonutValues}
                onChange={e => setShowDonutValues(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Show Values</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2 py-5">
            {/* Gauge 1: Total Order Fulfillment */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    className="stroke-slate-100 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    className="stroke-rose-500 fill-none transition-all duration-700 ease-out"
                    strokeWidth="8"
                    strokeDasharray={226.2}
                    strokeDashoffset={226.2 - (226.2 * (metrics?.gauges.totalOrderCompletion ?? 80)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                    {showDonutValues ? `${metrics?.gauges.totalOrderCompletion ?? 80}%` : '•••'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">Total Order</span>
              <span className="text-[10px] text-slate-500">Fulfillment SLA</span>
            </div>

            {/* Gauge 2: Customer Growth */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    className="stroke-slate-100 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    className="stroke-emerald-600 fill-none transition-all duration-700 ease-out"
                    strokeWidth="8"
                    strokeDasharray={226.2}
                    strokeDashoffset={226.2 - (226.2 * (metrics?.gauges.customerGrowth ?? 22)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                    {showDonutValues ? `${metrics?.gauges.customerGrowth ?? 22}%` : '•••'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">Customer Growth</span>
              <span className="text-[10px] text-slate-500">Repeat buyers</span>
            </div>

            {/* Gauge 3: Total Revenue Target */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    className="stroke-slate-100 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    className="stroke-sky-500 fill-none transition-all duration-700 ease-out"
                    strokeWidth="8"
                    strokeDasharray={226.2}
                    strokeDashoffset={226.2 - (226.2 * (metrics?.gauges.revenueTargetAchieved ?? 62)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                    {showDonutValues ? `${metrics?.gauges.revenueTargetAchieved ?? 62}%` : '•••'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">Total Revenue</span>
              <span className="text-[10px] text-slate-500">Target quota</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Overall store efficiency</span>
            <span className="font-bold text-emerald-700">Optimal (Zone Tier 1)</span>
          </div>
        </div>

        {/* Right: Order Trend Area Curve */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{metrics?.orderTrendTitle || 'Chart Order'}</h3>
              <p className="text-[11px] text-slate-500">{metrics?.orderTrendSubtitle || 'Completed order volume'}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              className="gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Report</span>
            </Button>
          </div>

          {/* SVG Smooth Area Curve */}
          <div className="relative pt-3 overflow-hidden">
            <svg
              viewBox={`0 0 ${trendWidth} ${trendHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible"
            >
              <defs>
                <linearGradient id="orderTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = trendHeight - trendPadY - ratio * (trendHeight - trendPadY * 2);
                return (
                  <line
                    key={idx}
                    x1={trendPadX}
                    y1={y}
                    x2={trendWidth - trendPadX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Gradient Fill Area */}
              {trendAreaPath && (
                <path d={trendAreaPath} fill="url(#orderTrendGradient)" />
              )}

              {/* Primary Curve Stroke */}
              {trendLinePath && (
                <path
                  d={trendLinePath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Points */}
              {trendPoints.map((pt, idx) => {
                const isHovered = hoveredOrderIdx === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredOrderIdx(idx)}
                    onClick={() => setHoveredOrderIdx(idx)}
                  >
                    {/* Hover target hit area */}
                    <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="10"
                        className="fill-sky-400/30 animate-pulse"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5.5 : 4}
                      className={isHovered ? 'fill-sky-600 stroke-white' : 'fill-white stroke-sky-600'}
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay Callout */}
            {hoveredOrderIdx !== null && trendPoints[hoveredOrderIdx] && (
              <div
                className="absolute -top-1 pointer-events-none transform -translate-x-1/2 transition-all duration-150"
                style={{
                  left: `${(trendPoints[hoveredOrderIdx].x / trendWidth) * 100}%`,
                }}
              >
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-lg border border-slate-700 text-center whitespace-nowrap">
                  <p className="font-bold">{trendPoints[hoveredOrderIdx].data.orders} Orders</p>
                  <p className="text-[10px] text-slate-300">
                    {trendPoints[hoveredOrderIdx].data.fullDate} • ₹{trendPoints[hoveredOrderIdx].data.sales.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* X-Axis Day/Interval Labels */}
          <div
            className="grid text-center pt-2 border-t border-slate-100 text-[10px] sm:text-xs font-semibold text-slate-500"
            style={{ gridTemplateColumns: `repeat(${Math.max(1, trendData.length)}, minmax(0, 1fr))` }}
          >
            {trendData.map((d, idx) => (
              <button
                key={d.day + idx}
                type="button"
                onClick={() => setHoveredOrderIdx(idx)}
                className={`truncate py-1 px-0.5 rounded transition-colors cursor-pointer ${
                  hoveredOrderIdx === idx ? 'text-sky-700 font-bold bg-sky-50' : 'hover:text-slate-900'
                }`}
              >
                {d.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Total Revenue Multi-Period Curve & Customer Channel Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Total Revenue Curve */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Total Revenue</h3>
              <p className="text-[11px] text-slate-500">Comparative revenue pacing (INR)</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>{metrics?.revenueCurrentLabel || 'Current Period'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{metrics?.revenuePreviousLabel || 'Previous Period'}</span>
              </div>
            </div>
          </div>

          {/* Dual Line SVG */}
          <div className="relative pt-4 overflow-hidden">
            <svg
              viewBox={`0 0 ${revWidth} ${revHeight}`}
              className="w-full h-48 sm:h-56 overflow-visible"
            >
              {/* Y-Axis Value Grid */}
              {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = revHeight - revPadY - ratio * (revHeight - revPadY * 2);
                const val = Math.round(ratio * maxRev);
                return (
                  <g key={idx}>
                    <line
                      x1={revPadX}
                      y1={y}
                      x2={revWidth - revPadX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={revPadX - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[9px] font-semibold"
                    >
                      {val >= 1000 ? `₹${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k` : `₹${val}`}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Crosshair Line when hovered */}
              {hoveredRevIdx !== null && revCurrentPoints[hoveredRevIdx] && (
                <line
                  x1={revCurrentPoints[hoveredRevIdx].x}
                  y1={revPadY}
                  x2={revCurrentPoints[hoveredRevIdx].x}
                  y2={revHeight - revPadY}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  strokeWidth="1.25"
                />
              )}

              {/* Previous Period (Rose Line) */}
              {revPreviousPath && (
                <path
                  d={revPreviousPath}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Current Period (Sky Blue Line) */}
              {revCurrentPath && (
                <path
                  d={revCurrentPath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Key Milestone Nodes */}
              {revCurrentPoints.map((pt, idx) => {
                const isHovered = hoveredRevIdx === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredRevIdx(idx)}
                    onClick={() => setHoveredRevIdx(idx)}
                  >
                    <circle cx={pt.x} cy={pt.y} r="15" fill="transparent" />
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        className="fill-sky-400/30"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3.5}
                      className={isHovered ? 'fill-sky-600 stroke-white' : 'fill-white stroke-sky-600'}
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Banner */}
            {hoveredRevIdx !== null && revCurrentPoints[hoveredRevIdx] && revData[hoveredRevIdx] && (
              <div
                className="absolute top-1 pointer-events-none transform -translate-x-1/2 transition-all duration-150"
                style={{
                  left: `${(revCurrentPoints[hoveredRevIdx].x / revWidth) * 100}%`,
                }}
              >
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-lg border border-slate-700 text-center whitespace-nowrap">
                  <p className="font-bold text-slate-100">{revData[hoveredRevIdx].month} Pacing</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-sky-300 font-semibold">
                      Current: ₹{revData[hoveredRevIdx].currentYear.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-rose-300 font-semibold">
                      Prior: ₹{revData[hoveredRevIdx].previousYear.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* X-Axis Labels */}
          <div
            className="grid text-center pt-2 border-t border-slate-100 text-[9px] sm:text-[11px] font-semibold text-slate-500"
            style={{ gridTemplateColumns: `repeat(${Math.max(1, revData.length)}, minmax(0, 1fr))` }}
          >
            {revData.map((d, idx) => (
              <button
                key={d.month + idx}
                type="button"
                onClick={() => setHoveredRevIdx(idx)}
                className={`py-1 rounded transition-colors cursor-pointer truncate ${
                  hoveredRevIdx === idx ? 'text-sky-700 font-bold bg-sky-50' : 'hover:text-slate-900'
                }`}
              >
                {d.month}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Customer Demand & Channel Map Bar Chart */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Map</h3>
              <p className="text-[11px] text-slate-500">Volume by order stream</p>
            </div>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setChannelView('WEEKLY')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  channelView === 'WEEKLY' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setChannelView('DAILY')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  channelView === 'DAILY' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Daily
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 flex items-end justify-between gap-1.5 h-44 sm:h-52 px-1">
            {barData.map((item, idx) => {
              const h1 = Math.max(8, (item.instantOrders / Math.max(1, maxBarVal)) * 100);
              const h2 = Math.max(6, (item.scheduledOrders / Math.max(1, maxBarVal)) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Bar 1: Amber/Gold (Instant) */}
                    <div
                      className="w-2.5 sm:w-3.5 bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:bg-amber-500"
                      style={{ height: `${h1}%` }}
                      title={`${item.day} Instant: ${item.instantOrders} orders`}
                    />
                    {/* Bar 2: Rose/Coral (Scheduled) */}
                    <div
                      className="w-2.5 sm:w-3.5 bg-rose-500 rounded-t-sm transition-all duration-300 group-hover:bg-rose-600"
                      style={{ height: `${h2}%` }}
                      title={`${item.day} Scheduled: ${item.scheduledOrders} orders`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 truncate">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bar Legend */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Instant 10-Min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Scheduled B2B</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Financial Breakdown Payout Summary (Aligned 1:1 with Home Overview) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Financial Breakdown & Settlement</h3>
            <p className="text-[11px] text-slate-500">Gross customer bill vs platform fees, statutory taxes and net payout</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {metrics?.periodLabel || 'Active Filter'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-xs font-medium text-slate-500">Gross Sales</span>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-1.5">
              ₹{(metrics?.grossSales ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total customer bill</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-slate-500">Platform Fees</span>
              <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 px-1 py-0.2 rounded">15% Min</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-rose-600 mt-1.5">
              -₹{(metrics?.commissionFee ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">QCOM Platform Take-rate</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-amber-900">TDS & TCS</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded">0.6%</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-amber-900 mt-1.5">
              -₹{(metrics?.totalTaxDeductions ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">TDS (0.1%) + TCS (0.5%)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-xs font-semibold text-emerald-900">Net After TDS & TCS</span>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-emerald-800 mt-1.5">
              ₹{(metrics?.netPayoutAfterTdsTcs ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Net Bank Deposit (84.4%)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-xs font-medium text-slate-500">Average Order Value</span>
            <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-slate-900 mt-1.5">
              ₹{(metrics?.averageOrderValue ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">AOV per fulfilled order</p>
          </div>
        </div>
      </div>

      {/* 6. SLA Adherence & Top Selling Hardware SKUs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SLA Adherence Summary */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Fulfillment Speed & SLA Adherence
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Top 5% Store
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">15-Min SLA</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1 tabular-nums">
                {metrics?.slaAdherencePercent ?? 98.4}%
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Store benchmark</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">Avg Pick Time</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {metrics?.avgPreparationMinutes ?? 3.8}m
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">↓ 1.1m faster</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">Merchant Cancel</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {metrics?.cancellationRatePercent ?? 0.4}%
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Below threshold</span>
            </div>
          </div>
        </div>

        {/* Top Selling Hardware SKUs */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Top Selling Hardware SKUs</h3>
            <span className="text-xs font-medium text-slate-500">By revenue volume</span>
          </div>

          <div className="divide-y divide-slate-100">
            {(metrics?.topProducts || []).slice(0, 4).map((p, idx) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="w-5 font-bold tabular-nums text-slate-400 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {p.unitsSold.toLocaleString('en-IN')} units delivered
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold tabular-nums text-slate-900">₹{p.revenue.toLocaleString('en-IN')}</p>
                  <span className="text-emerald-700 font-semibold text-[10px]">{p.badge || 'High Velocity'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
