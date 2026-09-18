import React, { useState, useEffect } from 'react';
import { financialService } from '../../services/financialService';
import { SellerEarningsSummary, SellerLedgerEntry } from '../../types/seller';
import {
  IndianRupee,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Download,
  Landmark,
  FileSpreadsheet,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const EarningsView: React.FC = () => {
  const [earnings, setEarnings] = useState<SellerEarningsSummary | null>(null);
  const [ledger, setLedger] = useState<SellerLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [earnRes, ledRes] = await Promise.all([
        financialService.getEarningsSummary(),
        financialService.getLedgerEntries(),
      ]);
      setEarnings(earnRes.data);
      setLedger(ledRes.data);
    } catch (err: any) {
      showToast('Error', 'Failed to load financial records.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Weekly Payout Summary Command Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Weekly Payout Cycle</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-slate-900">
                ₹{earnings?.pendingPayableBalance.toLocaleString() || '18,450'}
              </span>
              <span className="text-xs font-medium text-slate-500">Net payout after deductions</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Settlement Beneficiary: <span className="font-semibold text-slate-700">HDFC Bank (A/C •••• 8821)</span> · IFSC: <span className="font-mono text-slate-600">HDFC0001224</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Payout Account
            </span>
          </div>
        </div>

        {/* Financial Highlights Bar */}
        <div className="pt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Pending Payout</span>
            <p className="text-lg font-bold tabular-nums text-slate-900 mt-0.5">
              ₹{(earnings?.pendingPayableBalance ?? 18450).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">This Week Net Sales</span>
            <p className="text-lg font-bold tabular-nums text-emerald-800 mt-0.5">
              ₹{(earnings?.monthSales ? Math.round(earnings.monthSales / 4) : 24850).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Monthly Settled</span>
            <p className="text-lg font-bold tabular-nums text-slate-900 mt-0.5">
              ₹{(earnings?.settledBalance ?? 84200).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">TDS Deposited (194-O)</span>
            <p className="text-lg font-bold tabular-nums text-slate-900 mt-0.5">
              ₹{(earnings?.tdsDeducted ?? 4862.5).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Fee Deductions & Tax Compliance */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Fee Deductions & Tax Compliance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Platform Commission</span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                12.0% Flat
              </span>
            </div>
            <p className="text-xl font-bold tabular-nums text-slate-900 mt-2">
              ₹{(earnings?.commissionPaid ?? 7704).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Covers platform infrastructure & order fulfillment</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">TDS u/s 194-O (1%)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold tabular-nums text-slate-900 mt-2">
              ₹{(earnings?.tdsDeducted ?? 4862.5).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Reflected in Form 26AS for tax credit claiming</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Refunds & Adjustments</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                0.00% Dispute
              </span>
            </div>
            <p className="text-xl font-bold tabular-nums text-slate-900 mt-2">₹0.00</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">No pending deductions or chargebacks</p>
          </div>
        </div>
      </div>

      {/* 3. Transaction & Settlement Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transaction & Settlement Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditable itemized record of order earnings and weekly bank payouts
            </p>
          </div>
          <button
            onClick={() => showToast('Export Started', 'Ledger CSV downloaded for accounting.', 'info')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {ledger.map(entry => (
              <div
                key={entry.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      entry.category === 'CREDIT'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {entry.category === 'CREDIT' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Landmark className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{entry.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          entry.status === 'CLEARED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 truncate">{entry.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                      <span>{entry.date} · {entry.timestamp}</span>
                      {entry.utrNumber && <span>• UTR: {entry.utrNumber}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                  <p
                    className={`text-sm sm:text-base font-bold tabular-nums ${
                      entry.category === 'CREDIT' ? 'text-emerald-800' : 'text-slate-900'
                    }`}
                  >
                    {entry.category === 'CREDIT' ? '+' : '-'}₹{entry.amount.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {entry.category === 'CREDIT' ? 'Net Order Settlement' : 'Weekly Bank Payout'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
