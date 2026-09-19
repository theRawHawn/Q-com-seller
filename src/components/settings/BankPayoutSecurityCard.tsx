import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Building,
  Zap,
} from 'lucide-react';
import { Button } from '../common/Button';
import { BankUpdateModal } from './BankUpdateModal';

export const BankPayoutSecurityCard: React.FC = () => {
  const {
    currentStore,
    currentUser,
    bankUpdateRequest,
    cancelBankUpdateRequest,
    approveBankUpdateRequest,
  } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [isApprovingDemo, setIsApprovingDemo] = useState(false);

  const isOwner = currentUser.role === 'STORE_OWNER';

  const handleSimulateApproval = async () => {
    setIsApprovingDemo(true);
    try {
      await approveBankUpdateRequest();
    } finally {
      setIsApprovingDemo(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">Settlement Bank Account</h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              KYC Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct account edits are locked. Modifications require Store Owner authorization and audit review.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <span className="text-slate-500">Access:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-md border ${
              isOwner
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isOwner ? 'Store Owner' : `${currentUser.name} (${currentUser.role.replace('_', ' ')})`}
          </span>
        </div>
      </div>

      {/* ACTIVE / PENDING UPDATE REQUEST BANNER */}
      {bankUpdateRequest && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Bank Account Change In Progress ({bankUpdateRequest.id})
                </span>
                <span className="text-[11px] text-amber-800">
                  Submitted by {bankUpdateRequest.submittedBy.name} • 24h cooling period active
                </span>
              </div>
            </div>

            <span className="text-[11px] font-semibold bg-white text-amber-900 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 self-start sm:self-auto">
              <Clock className="w-3 h-3 text-amber-600" />
              Pending Review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-amber-200/70">
            <div>
              <span className="text-slate-500 text-[11px] block">Requested Settlement Account:</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {bankUpdateRequest.requestedBank.bankName}
              </span>
              <div className="text-slate-700 font-semibold text-xs mt-0.5 tabular-nums">
                •••• {bankUpdateRequest.requestedBank.accountNumber.slice(-4)} • IFSC: {bankUpdateRequest.requestedBank.ifsc}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Holder: {bankUpdateRequest.requestedBank.accountHolderName}
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Verification Checklist:</span>
              <ul className="space-y-1 text-xs text-slate-700 pt-1">
                <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Document Uploaded: {bankUpdateRequest.documentFileName}</span>
                </li>
                <li className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Penny-Drop Account Verification: Active</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Platform Compliance Officer Approval: Pending</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <p className="text-[11px] text-amber-900">
              Active daily settlements continue to {currentStore?.bankAccount.bankName} without interruption.
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={cancelBankUpdateRequest}
                className="text-xs text-rose-700 hover:text-rose-900 font-semibold px-2.5 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Withdraw Request
              </button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isApprovingDemo}
                onClick={handleSimulateApproval}
                icon={<Zap className="w-3 h-3 text-amber-300" />}
              >
                Approve (Demo)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CURRENT VERIFIED BANK DETAILS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <span className="text-slate-500 text-xs block">Bank Name</span>
          <span className="font-bold text-slate-900 block mt-1">
            {currentStore?.bankAccount.bankName || 'HDFC Bank'}
          </span>
          <span className="text-[11px] text-slate-500">Main Commercial Branch</span>
        </div>

        <div>
          <span className="text-slate-500 text-xs block">Account Number</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-bold text-slate-900 tabular-nums">
              {showFullAccount
                ? currentStore?.bankAccount.accountNumber
                : `•••• •••• •••• ${currentStore?.bankAccount.accountNumber.slice(-4)}`}
            </span>
            <button
              type="button"
              onClick={() => setShowFullAccount(!showFullAccount)}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
            >
              {showFullAccount ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="text-[11px] text-slate-500">Current Account (INR)</span>
        </div>

        <div>
          <span className="text-slate-500 text-xs block">IFSC Code</span>
          <span className="font-bold text-slate-900 block mt-1 uppercase">
            {currentStore?.bankAccount.ifsc || 'HDFC0001224'}
          </span>
          <span className="text-[11px] text-slate-500">RTGS / NEFT Enabled</span>
        </div>

        <div>
          <span className="text-slate-500 text-xs block">Account Holder</span>
          <span className="font-bold text-slate-900 block mt-1 truncate" title={currentStore?.bankAccount.accountHolderName}>
            {currentStore?.bankAccount.accountHolderName || 'Venkateshwara Hardware'}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Matches Legal GSTIN
          </span>
        </div>
      </div>

      {/* Security Note */}
      <p className="text-xs text-slate-500 leading-relaxed">
        Direct modifications to settlement accounts are restricted to protect against account takeover. Only the Store Owner can request an account change by submitting supporting bank documentation.
      </p>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div>
          {!isOwner && (
            <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Only the Store Owner ({currentStore?.ownerName}) can submit bank changes.
            </span>
          )}
        </div>

        <Button
          type="button"
          variant={isOwner ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setIsModalOpen(true)}
          disabled={!isOwner || !!bankUpdateRequest}
          icon={<CreditCard className="w-3.5 h-3.5" />}
        >
          {bankUpdateRequest
            ? 'Request Pending Audit'
            : isOwner
            ? 'Request Bank Account Update'
            : 'Bank Update Locked (Owner Only)'}
        </Button>
      </div>

      {/* Modal */}
      <BankUpdateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};
