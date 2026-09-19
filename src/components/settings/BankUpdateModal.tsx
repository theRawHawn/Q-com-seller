import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Building,
  CreditCard,
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';

interface BankUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankUpdateModal: React.FC<BankUpdateModalProps> = ({ isOpen, onClose }) => {
  const { currentStore, currentUser, submitBankUpdateRequest } = useAuth();

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(
    currentStore?.ownerName ? `${currentStore.name} / ${currentStore.ownerName}` : ''
  );
  const [accountType, setAccountType] = useState<'CURRENT' | 'SAVINGS'>('CURRENT');
  const [reason, setReason] = useState('Switching to new primary business current account');
  const [documentType, setDocumentType] = useState<'CANCELLED_CHEQUE' | 'BANK_PASSBOOK' | 'BANK_STATEMENT'>('CANCELLED_CHEQUE');
  const [documentFileName, setDocumentFileName] = useState('cancelled_cheque_2026.pdf');
  const [hasDeclared, setHasDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAccountMatch = accountNumber && confirmAccountNumber && accountNumber === confirmAccountNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (accountNumber !== confirmAccountNumber) {
      setErrorMsg('Account numbers do not match. Please verify carefully.');
      return;
    }

    if (!ifsc || ifsc.length < 11) {
      setErrorMsg('Please enter a valid 11-character IFSC code.');
      return;
    }

    if (!hasDeclared) {
      setErrorMsg('Please confirm the legal declaration checkbox.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitBankUpdateRequest({
        requestedBank: {
          accountNumber,
          ifsc: ifsc.toUpperCase(),
          bankName,
          accountHolderName,
          accountType,
          branchName: ifsc.startsWith('ICIC') ? 'Koramangala Branch' : 'Main Branch',
        },
        reason,
        documentType,
        documentFileName,
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Payout Bank Account Update"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-Fraud Security Notice */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>Marketplace Payout Security Protocol</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            To prevent account hijacking and payout diversion, bank changes require verification by our Platform Compliance Desk. 
            A mandatory <strong>24-hour security cooling period</strong> applies, during which existing settlements continue safely to your current account.
          </p>
        </div>

        {/* Current Verified Signatory */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Authorized Signatory</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span className="text-slate-600 text-[11px]"> ({currentUser.phone})</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Primary Store Owner
          </span>
        </div>

        {/* Current Active Account Summary */}
        <div className="text-xs bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-medium block mb-1">Current Active Settlement Account:</span>
          <div className="font-semibold text-slate-800">
            {currentStore?.bankAccount.bankName} •••• {currentStore?.bankAccount.accountNumber.slice(-4)}
          </div>
          <div className="text-slate-500 text-[11px]">
            IFSC: {currentStore?.bankAccount.ifsc} • Beneficiary: {currentStore?.bankAccount.accountHolderName}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 pt-1">
          <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-700" />
            New Bank Account Details
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. ICICI Bank, State Bank of India"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                placeholder="e.g. ICIC0000047"
                value={ifsc}
                onChange={e => setIfsc(e.target.value.toUpperCase())}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white uppercase font-semibold tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Account Number
              </label>
              <input
                type="password"
                placeholder="Enter new account number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Re-Enter Account Number
              </label>
              <input
                type="text"
                placeholder="Confirm account number"
                value={confirmAccountNumber}
                onChange={e => setConfirmAccountNumber(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border tabular-nums ${
                  confirmAccountNumber && !isAccountMatch
                    ? 'border-rose-400 bg-rose-50/40 text-rose-900'
                    : 'border-slate-200 text-slate-900 bg-white focus:border-emerald-600'
                }`}
                required
              />
              {confirmAccountNumber && !isAccountMatch && (
                <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                  Account numbers do not match
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Holder Name (Matches GST/PAN)
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={e => setAccountHolderName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={e => setAccountType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:border-emerald-600 text-slate-900"
              >
                <option value="CURRENT">Current Account (Enterprise/LLP)</option>
                <option value="SAVINGS">Savings Account (Individual Proprietor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Updating Bank Details
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:border-emerald-600 text-slate-900"
            >
              <option value="Switching to new primary business current account">
                Switching to new primary business current account
              </option>
              <option value="Previous bank account closing/transitioned">
                Previous bank account closing / transitioned
              </option>
              <option value="Bank branch consolidation / IFSC change">
                Bank branch consolidation / IFSC change
              </option>
              <option value="Change of enterprise structure">
                Change of enterprise structure
              </option>
            </select>
          </div>

          {/* Document Upload Proof */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Mandatory Proof of Account Ownership
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDocumentType('CANCELLED_CHEQUE')}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium ${
                  documentType === 'CANCELLED_CHEQUE'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Cancelled Cheque
              </button>
              <button
                type="button"
                onClick={() => setDocumentType('BANK_PASSBOOK')}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium ${
                  documentType === 'BANK_PASSBOOK'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Bank Passbook
              </button>
              <button
                type="button"
                onClick={() => setDocumentType('BANK_STATEMENT')}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium ${
                  documentType === 'BANK_STATEMENT'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Bank Statement
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-dashed border-slate-300">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-xs font-medium text-slate-900 block">{documentFileName}</span>
                  <span className="text-[10px] text-slate-500">PDF / JPG • Verified Signatory Match</span>
                </div>
              </div>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Attached
              </span>
            </div>
          </div>

          {/* Legal Owner Declaration */}
          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={hasDeclared}
                onChange={e => setHasDeclared(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-600"
              />
              <span>
                I, <strong>{currentUser.name}</strong>, declare that I am the authorized legal signatory for{' '}
                <strong>{currentStore?.name}</strong>. I certify that this bank account belongs to our registered
                entity and authorize QCOM Platform to conduct penny-drop verification.
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            disabled={!hasDeclared || !isAccountMatch || !bankName}
          >
            Submit for Platform Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
};
