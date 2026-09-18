import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { SellerReturnOrder, ReturnStatus } from '../../types/seller';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Boxes,
  Truck,
  Eye,
  ShieldCheck,
  ArrowRight,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { ReturnStatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';

interface ReturnsViewProps {
  initialFilterStatus?: ReturnStatus | 'ALL';
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  initialFilterStatus = 'ALL',
}) => {
  const { returns, approveReturn, rejectReturn, restockReturnItems } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'ALL'>(initialFilterStatus);

  // Inspection Modal state
  const [selectedReturn, setSelectedReturn] = useState<SellerReturnOrder | null>(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [autoRestock, setAutoRestock] = useState(true);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  const { showToast } = useToast();

  const stats = useMemo(() => {
    const pending = returns.filter(r => r.status === 'PENDING_INSPECTION').length;
    const approved = returns.filter(r => r.status === 'APPROVED_REFUNDED').length;
    const disputed = returns.filter(r => r.status === 'REJECTED_DISPUTED').length;
    const totalRefundValue = returns
      .filter(r => r.status === 'APPROVED_REFUNDED')
      .reduce((sum, r) => sum + r.refundTotal, 0);

    return { pending, approved, disputed, total: returns.length, totalRefundValue };
  }, [returns]);

  const filteredReturns = useMemo(() => {
    let list = [...returns];

    if (statusFilter !== 'ALL') {
      list = list.filter(r => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        r =>
          r.returnNumber.toLowerCase().includes(q) ||
          r.orderNumber.toLowerCase().includes(q) ||
          r.customer.name.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
      );
    }

    return list;
  }, [returns, statusFilter, searchQuery]);

  const handleOpenInspection = (ret: SellerReturnOrder) => {
    setSelectedReturn(ret);
    setAutoRestock(ret.restockedToInventory || true);
    setIsInspectOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedReturn) return;
    try {
      setIsSubmitting(true);
      await approveReturn(selectedReturn.id, autoRestock);
      setIsInspectOpen(false);
      showToast(
        'Return Approved',
        `Return ${selectedReturn.returnNumber} approved. ₹${selectedReturn.refundTotal} refunded${autoRestock ? ' & items restocked.' : '.'}`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to approve return.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDispute = async () => {
    if (!selectedReturn || !disputeReason) {
      showToast('Missing Reason', 'Please provide a dispute justification.', 'warning');
      return;
    }
    try {
      setIsSubmitting(true);
      await rejectReturn(selectedReturn.id, disputeReason);
      setIsDisputeOpen(false);
      setIsInspectOpen(false);
      showToast(
        'Return Disputed',
        `Return ${selectedReturn.returnNumber} flagged as rejected/disputed. QCOM support notified.`,
        'info'
      );
    } catch {
      showToast('Error', 'Failed to reject return.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-emerald-700" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Customer Order Returns & Claims
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inspect returned items, verify item conditions, approve customer refunds, and automatically return inventory to shelf bins.
          </p>
        </div>
      </div>

      {/* Return Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('PENDING_INSPECTION')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'PENDING_INSPECTION'
              ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${statusFilter === 'PENDING_INSPECTION' ? 'text-amber-200' : 'text-slate-500'}`}>
              Pending Inspection
            </span>
            {stats.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-bold font-mono mt-1.5 text-amber-600">
            {stats.pending}
          </p>
          <p className={`text-[11px] mt-0.5 ${statusFilter === 'PENDING_INSPECTION' ? 'text-amber-200' : 'text-amber-800 font-medium'}`}>
            Requires merchant verification
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED_REFUNDED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'APPROVED_REFUNDED'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
          }`}
        >
          <span className={`text-xs font-medium ${statusFilter === 'APPROVED_REFUNDED' ? 'text-emerald-200' : 'text-slate-500'}`}>
            Approved & Refunded
          </span>
          <p className="text-2xl font-bold font-mono mt-1.5 text-emerald-600">
            {stats.approved}
          </p>
          <p className={`text-[11px] mt-0.5 ${statusFilter === 'APPROVED_REFUNDED' ? 'text-emerald-200' : 'text-slate-500'}`}>
            Processed claims
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED_DISPUTED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'REJECTED_DISPUTED'
              ? 'bg-rose-800 text-white border-rose-800 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
          }`}
        >
          <span className={`text-xs font-medium ${statusFilter === 'REJECTED_DISPUTED' ? 'text-rose-200' : 'text-slate-500'}`}>
            Disputed / Rejected
          </span>
          <p className="text-2xl font-bold font-mono mt-1.5 text-rose-600">
            {stats.disputed}
          </p>
          <p className={`text-[11px] mt-0.5 ${statusFilter === 'REJECTED_DISPUTED' ? 'text-rose-200' : 'text-slate-500'}`}>
            Damaged or ineligible claims
          </p>
        </button>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Processed Refund Value</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
            ₹{stats.totalRefundValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Adjusted against settlement</p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Return ID (e.g. RET-09), Order ID, customer name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({returns.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_INSPECTION')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'PENDING_INSPECTION'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED_REFUNDED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'APPROVED_REFUNDED'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED_DISPUTED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'REJECTED_DISPUTED'
                  ? 'bg-white text-rose-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disputed
            </button>
          </div>
        </div>
      </div>

      {/* Returns List Table & Cards */}
      {filteredReturns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-2xs">
          <EmptyState
            icon={<RotateCcw className="w-8 h-8 text-slate-400" />}
            title="No return records found"
            description="There are currently no customer returns matching the selected criteria."
            actionLabel="View All Returns"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Return ID & Order</th>
                  <th className="py-3 px-4">Customer & Request Date</th>
                  <th className="py-3 px-4">Reason for Return</th>
                  <th className="py-3 px-4">Returned Item(s)</th>
                  <th className="py-3 px-4 text-right">Refund Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Return & Order */}
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-slate-900">{ret.returnNumber}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Order: #{ret.orderNumber}</p>
                    </td>

                    {/* Customer & Date */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{ret.customer.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(ret.requestedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Return Reason */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {ret.reason}
                      </span>
                      {ret.detailedNotes && (
                        <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
                          "{ret.detailedNotes}"
                        </p>
                      )}
                    </td>

                    {/* Items List */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {ret.items.map((item, idx) => (
                          <p key={idx} className="text-slate-800 font-medium">
                            {item.quantity}x {item.productName}
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Refund Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₹{ret.refundTotal.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <ReturnStatusBadge status={ret.status} size="sm" />
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      {ret.status === 'PENDING_INSPECTION' ? (
                        <button
                          onClick={() => handleOpenInspection(ret)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenInspection(ret)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Details</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredReturns.map(ret => (
              <div key={ret.id} className="p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{ret.returnNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{ret.orderNumber}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{ret.customer.name}</p>
                  </div>

                  <ReturnStatusBadge status={ret.status} size="sm" />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <p className="font-medium text-slate-700">
                    <span className="text-slate-500">Reason:</span> {ret.reason}
                  </p>
                  <div className="pt-1 border-t border-slate-200/60">
                    {ret.items.map((it, idx) => (
                      <p key={idx} className="text-slate-800 font-medium">
                        {it.quantity}x {it.productName}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs font-mono">
                    <span className="text-slate-500">Refund: </span>
                    <span className="font-bold text-slate-900 text-sm">₹{ret.refundTotal}</span>
                  </div>

                  <button
                    onClick={() => handleOpenInspection(ret)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs ${
                      ret.status === 'PENDING_INSPECTION'
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {ret.status === 'PENDING_INSPECTION' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSPECTION MODAL */}
      <Modal
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        title={`Inspect Return ${selectedReturn?.returnNumber || ''}`}
        subtitle={`Original Order #${selectedReturn?.orderNumber || ''} · ${selectedReturn?.customer.name || ''}`}
        maxWidth="md"
      >
        {selectedReturn && (
          <div className="space-y-4">
            {/* Status & Refund Amount header */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Refund Amount to Customer:</span>
                <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  ₹{selectedReturn.refundTotal.toLocaleString()}
                </p>
              </div>
              <ReturnStatusBadge status={selectedReturn.status} />
            </div>

            {/* Customer reason box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Customer Return Claim Reason</label>
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold">{selectedReturn.reason}</p>
                {selectedReturn.detailedNotes && (
                  <p className="text-slate-700 italic">"{selectedReturn.detailedNotes}"</p>
                )}
              </div>
            </div>

            {/* Returned Items List */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Items Under Return</label>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                {selectedReturn.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Quantity: {item.quantity} · Price: ₹{item.unitPrice} each
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{item.refundAmount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Checklist for Pending */}
            {selectedReturn.status === 'PENDING_INSPECTION' ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">Warehouse Inspection Verification</span>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span>Packaging intact and matching original SKU</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span>Item is in re-sellable condition or valid warranty defect</span>
                    </label>
                  </div>
                </div>

                {/* Restock checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={autoRestock}
                    onChange={e => setAutoRestock(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-emerald-950">Restock Returned Items to Inventory Shelf</span>
                    <p className="text-[11px] text-emerald-800">
                      Automatically increments on-hand quantity in your physical warehouse bin.
                    </p>
                  </div>
                </label>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setIsDisputeOpen(true)}
                  >
                    Dispute / Reject Claim
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsInspectOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={isSubmitting}
                      onClick={handleConfirmApproval}
                    >
                      Approve & Refund ₹{selectedReturn.refundTotal}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium">Merchant Resolution Notes:</span>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedReturn.detailedNotes || 'Claim processed and finalized.'}
                  </p>
                  {selectedReturn.resolvedAt && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Resolved on {new Date(selectedReturn.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsInspectOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* DISPUTE REASON MODAL */}
      <Modal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        title="Dispute Customer Return Claim"
        subtitle="Provide reason for rejecting the return request"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
            Rejecting this claim will notify the customer and escalate to QCOM Merchant Support for audit.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Rejection Reason *</label>
            <textarea
              rows={3}
              placeholder="e.g. Item was returned physically broken/used by customer with seal torn."
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsDisputeOpen(false)}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleConfirmDispute}
            >
              Confirm Rejection & Dispute
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
