import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { SellerAnalyticsMetrics } from '../../types/seller';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Award,
  Zap,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AnalyticsView: React.FC = () => {
  const [metrics, setMetrics] = useState<SellerAnalyticsMetrics | null>(null);
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    analyticsService.getAnalytics(period).then(res => {
      setMetrics(res.data);
      setIsLoading(false);
    });
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Time Period Selector Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Performance & Fulfillment SLA</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational speed benchmarks and commerce velocity
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          {(['TODAY', 'WEEK', 'MONTH'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'TODAY' ? 'Today' : p === 'WEEK' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* SLA & Operational Speed Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* SLA Adherence */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">15-Min Prep SLA</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold font-mono tracking-tight text-emerald-700 mt-2">
            {metrics?.slaAdherencePercent || 98.4}%
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${metrics?.slaAdherencePercent || 98.4}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Top 5% among hardware sellers in Bengaluru</p>
        </div>

        {/* Average Pick Time */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg Store Pick Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            {metrics?.avgPreparationMinutes || 4.2} <span className="text-base font-bold text-slate-500">mins</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-3">
            ↓ 1.1m faster than zone target
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Time from order placed to packed in bay</p>
        </div>

        {/* Cancellation Rate */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Merchant Cancellation</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            {metrics?.cancellationRatePercent || 0.4}%
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-3">
            Below platform threshold (3.0%)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">High catalog stock reliability</p>
        </div>
      </div>

      {/* Hourly Order Heatmap / Velocity */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Today's Hourly Order Velocity</h4>
            <p className="text-xs text-slate-500">Order count distribution across store business hours</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            Peak: 11 AM - 1 PM
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {(metrics?.hourlyVolume || []).map(h => (
            <div key={h.hour} className="flex flex-col items-center">
              <div className="h-24 w-full bg-slate-50 rounded-lg flex items-end p-1 border border-slate-100">
                <div
                  className="w-full rounded bg-emerald-700 transition-all duration-300 hover:bg-emerald-800"
                  style={{
                    height: `${Math.max(12, (h.orders / 5) * 100)}%`,
                  }}
                  title={`${h.hour}: ${h.orders} orders (₹${h.sales})`}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1.5">{h.hour}</span>
              <span className="text-[11px] font-mono font-bold text-slate-800">{h.orders}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Velocity Hardware SKUs */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Top Selling Hardware Items</h4>
        <div className="divide-y divide-slate-100">
          {metrics?.topProducts.map((p, idx) => (
            <div key={p.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-5 font-mono font-bold text-slate-400 text-center">{idx + 1}</span>
                <div>
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{p.unitsSold} units delivered today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-slate-900">₹{p.revenue.toLocaleString()}</p>
                <span className="text-emerald-700 font-semibold text-[10px]">High Velocity</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
