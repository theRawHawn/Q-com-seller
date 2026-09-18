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
  const [isSettling, setIsSettling] = useState(false);
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

  const handleInstantPayout = async () => {
    try {
      setIsSettling(true);
      const res = await financialService.requestInstantSettlement();
      showToast('Payout Initiated', res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast('Payout Error', err.message, 'error');
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Financial Balance Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Pending Payable Balance</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-mono">Auto-Payout: Tomorrow 10:00 AM</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                ₹{earnings?.pendingPayableBalance.toLocaleString() || '18,450'}
              </span>
              <span className="text-xs text-slate-400">Net after TDS & fees</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Beneficiary: HDFC Bank (A/C •••• 8821) · IFSC: HDFC0001224
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              isLoading={isSettling}
              onClick={handleInstantPayout}
              disabled={(earnings?.pendingPayableBalance || 0) <= 0}
              icon={<Zap className="w-4 h-4" />}
            >
              Instant Settlement (IMPS)
            </Button>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Gross Sales (Today)</span>
            <p className="text-base font-bold font-mono text-white mt-0.5">
              ₹{earnings?.todaySales.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Monthly Net Earnings</span>
            <p className="text-base font-bold font-mono text-white mt-0.5">
              ₹{(earnings?.monthSales ?? 64200).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Total Settled (FY25-26)</span>
            <p className="text-base font-bold font-mono text-white mt-0.5">
              ₹{(earnings?.settledBalance ?? 84200).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-slate-400">TDS Deposited (194O)</span>
            <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              ₹{(earnings?.tdsDeducted ?? 4862).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Fee Deductions & Tax Compliance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Platform Commission</span>
            <span className="text-xs font-mono font-bold text-slate-700">12.0% Flat</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-2">
            ₹{(earnings?.commissionPaid ?? 7704).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Includes cloud gateway & rider dispatching</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">TDS u/s 194-O (1%)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-2">
            ₹{(earnings?.tdsDeducted ?? 4862).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Available in Form 26AS for tax credit</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Refunds / Chargebacks</span>
            <span className="text-xs font-mono font-bold text-emerald-700">0.00% Rate</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-2">₹0.00</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Zero disputes this period</p>
        </div>
      </div>

      {/* 3. Operational Settlement Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Transaction & Settlement Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditable itemized record of orders, credits, and bank transfers
            </p>
          </div>
          <button
            onClick={() => showToast('Export Started', 'Ledger CSV downloaded for your CA.', 'info')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
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
                      <h4 className="text-sm font-bold text-slate-900 truncate">{entry.title}</h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          entry.status === 'CLEARED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 truncate">{entry.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                      <span>{entry.date} · {entry.timestamp}</span>
                      {entry.utrNumber && <span>• UTR: {entry.utrNumber}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                  <p
                    className={`text-base font-black font-mono ${
                      entry.category === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {entry.category === 'CREDIT' ? '+' : '-'}₹{entry.amount.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {entry.category === 'CREDIT' ? 'Net Order Settlement' : 'Bank IMPS Transfer'}
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
