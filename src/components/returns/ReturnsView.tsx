import React, { useState, useEffect, useMemo, useRef } from 'react';
import { returnsService } from '../../services/returnsService';
import { SellerReturnOrder, ReturnStatus } from '../../types/seller';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Boxes,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  Truck,
  ChevronRight,
  FileText,
  User,
  ShoppingBag,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  X,
  Upload,
  MessageSquare,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { ReturnStatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

interface ReturnsViewProps {
  onSelectOrder?: (orderId: string) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({ onSelectOrder }) => {
  const [returns, setReturns] = useState<SellerReturnOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<ReturnStatus | 'all'>('all');

  // Modal inspection & rejection states
  const [selectedReturn, setSelectedReturn] = useState<SellerReturnOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Photo Lightbox & Photo Upload modal states
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [uploadingForReturnId, setUploadingForReturnId] = useState<string | null>(null);
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();
  const { refreshOrders } = useStore();

  const loadReturns = async () => {
    try {
      setIsLoading(true);
      const res = await returnsService.getReturns();
      setReturns(res.data);
    } catch (err: any) {
      showToast('Error', 'Failed to load return requests.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const counts = useMemo(() => {
    const pending = returns.filter(r => r.status === 'requested' || r.status === 'pending_inspection').length;
    const restocked = returns.filter(r => r.status === 'restocked').length;
    const approved = returns.filter(r => r.status === 'approved').length;
    const rejected = returns.filter(r => r.status === 'rejected').length;
    const totalRefunded = returns
      .filter(r => r.status === 'approved' || r.status === 'restocked')
      .reduce((acc, r) => acc + r.totalRefundAmount, 0);

    return { pending, restocked, approved, rejected, total: returns.length, totalRefunded };
  }, [returns]);

  const filteredReturns = useMemo(() => {
    let list = [...returns];

    if (activeStatusFilter !== 'all') {
      if (activeStatusFilter === 'requested') {
        list = list.filter(r => r.status === 'requested' || r.status === 'pending_inspection');
      } else {
        list = list.filter(r => r.status === activeStatusFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        r =>
          r.returnNumber.toLowerCase().includes(q) ||
          r.originalOrderNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerReasonNote?.toLowerCase().includes(q) ||
          r.reasonDescription.toLowerCase().includes(q) ||
          r.items.some(i => i.productName.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [returns, activeStatusFilter, searchQuery]);

  const handleRestockAndApprove = async (returnId: string) => {
    try {
      setProcessingId(returnId);
      const res = await returnsService.approveAndRestock(returnId);
      setReturns(prev => prev.map(r => (r.id === returnId ? res.data : r)));
      if (selectedReturn?.id === returnId) setSelectedReturn(res.data);
      refreshOrders();
      showToast('Return Restocked', `Items verified and restocked to shelf. Refund initiated.`, 'success');
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleWriteOffAndApprove = async (returnId: string) => {
    try {
      setProcessingId(returnId);
      const res = await returnsService.approveAndWriteOff(returnId);
      setReturns(prev => prev.map(r => (r.id === returnId ? res.data : r)));
      if (selectedReturn?.id === returnId) setSelectedReturn(res.data);
      showToast('Refund Approved', `Return marked as written off/damaged. Refund processed.`, 'info');
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (ret: SellerReturnOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedReturn(ret);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedReturn || !rejectReason.trim()) return;
    try {
      setProcessingId(selectedReturn.id);
      const res = await returnsService.rejectReturn(selectedReturn.id, rejectReason.trim());
      setReturns(prev => prev.map(r => (r.id === selectedReturn.id ? res.data : r)));
      setSelectedReturn(res.data);
      showToast('Return Rejected', `Return #${res.data.returnNumber} was rejected.`, 'warning');
      setIsRejectModalOpen(false);
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenAddPhoto = (ret: SellerReturnOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUploadingForReturnId(ret.id);
    setNewPhotoInput('');
    setIsAddPhotoOpen(true);
  };

  const handleAttachPhoto = async (photoUrl: string) => {
    if (!uploadingForReturnId || !photoUrl.trim()) return;
    try {
      setIsUploadingPhoto(true);
      const res = await returnsService.addInspectionPhoto(uploadingForReturnId, photoUrl.trim());
      setReturns(prev => prev.map(r => (r.id === uploadingForReturnId ? res.data : r)));
      if (selectedReturn?.id === uploadingForReturnId) {
        setSelectedReturn(res.data);
      }
      showToast('Photo Attached', 'Inspection verification image added.', 'success');
      setIsAddPhotoOpen(false);
      setNewPhotoInput('');
    } catch (err: any) {
      showToast('Upload Error', err.message, 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleAttachPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openLightbox = (url: string, caption: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoUrl(url);
    setPhotoCaption(caption);
  };

  return (
    <div className="space-y-6">
      {/* 1. RETURNS SUMMARY METRICS STRIP - Matching Home Section Theme */}
      <section id="returns-summary-strip">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveStatusFilter('requested')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              activeStatusFilter === 'requested'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : counts.pending > 0
                ? 'border-amber-300'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Awaiting Review</span>
              {counts.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {counts.pending}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Physical inspection pending</p>
          </button>

          <button
            onClick={() => setActiveStatusFilter('restocked')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              activeStatusFilter === 'restocked'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Restocked to Shelf</span>
              <Boxes className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {counts.restocked}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Good condition returned</p>
          </button>

          <button
            onClick={() => setActiveStatusFilter('approved')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              activeStatusFilter === 'approved'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Refunded / Written Off</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {counts.approved}
            </p>
          </button>

          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              activeStatusFilter === 'all'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Total Refund Value</span>
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              ₹{counts.totalRefunded.toLocaleString()}
            </p>
          </button>
        </div>
      </section>

      {/* 2. SEARCH & FILTER TABS */}
      <section id="returns-filters" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Return #, Order #, customer note, SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Returns' },
              { id: 'requested', label: 'Awaiting Review', count: counts.pending },
              { id: 'restocked', label: 'Restocked', count: counts.restocked },
              { id: 'approved', label: 'Written Off', count: counts.approved },
              { id: 'rejected', label: 'Rejected', count: counts.rejected },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeStatusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeStatusFilter === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. RETURNS ORDER LIST - Matching Home Order Card Design */}
      <section id="returns-list" className="space-y-3">
        {filteredReturns.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-2 shadow-2xs">
            <RotateCcw className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No return requests in this view</p>
            <p className="text-xs text-slate-500">All customer return inspections are currently up-to-date.</p>
          </div>
        ) : (
          filteredReturns.map(ret => {
            const isPending = ret.status === 'requested' || ret.status === 'pending_inspection';
            const allPhotos = [
              ...(ret.customerPhotos || []),
              ...(ret.inspectionPhotos || []),
            ];

            return (
              <div
                key={ret.id}
                onClick={() => {
                  setSelectedReturn(ret);
                  setIsDetailOpen(true);
                }}
                className={`p-3.5 sm:p-4 rounded-xl bg-white border transition-all cursor-pointer shadow-2xs ${
                  isPending
                    ? 'border-amber-300 hover:border-amber-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header: Badge, IDs, Customer, Refund */}
                <div className="flex items-center justify-between gap-3 flex-wrap pb-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <ReturnStatusBadge status={ret.status} size="sm" />
                    <span className="font-mono font-bold text-xs text-slate-900">
                      #{ret.returnNumber}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-600">
                      Order #{ret.originalOrderNumber}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ₹{ret.totalRefundAmount} Refund
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate">
                    {ret.customerName}
                  </p>
                </div>

                {/* Returned items list stacked vertically */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                  {ret.items.map((item, idx) => (
                    <div
                      key={item.productId || idx}
                      className="flex items-center justify-between gap-2 text-xs text-slate-700"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          {item.quantity}×
                        </span>
                        <span className="truncate font-medium">{item.productName}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium border ${
                            item.condition === 'UNOPENED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.condition === 'DAMAGED' || item.condition === 'DEFECTIVE'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.condition}
                        </span>
                        {item.binLocation && (
                          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                            {item.binLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real Human Customer Reason Note */}
                <div className="mt-3 p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                      <span>Customer Message ({ret.customerName.split(' ')[0]}):</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-700/80">
                      {new Date(ret.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-normal">
                    {ret.customerReasonNote || ret.reasonDescription}
                  </p>
                </div>

                {/* Attached Pictures Preview Row */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      <span>Evidence Photos ({allPhotos.length}):</span>
                    </span>

                    {allPhotos.map((photo, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={e => openLightbox(photo, `Return #${ret.returnNumber} Evidence Photo ${pIdx + 1}`, e)}
                        className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-600 transition-all shrink-0 bg-slate-100"
                        title="Click to zoom picture"
                      >
                        <img
                          src={photo}
                          alt="Return photo"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={e => handleOpenAddPhoto(ret, e)}
                      className="px-2 py-1.5 h-10 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Attach seller inspection photo"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Add Photo</span>
                    </button>
                  </div>

                  {/* Operational Decision Action Buttons */}
                  <div className="shrink-0 flex items-center gap-2 justify-end ml-auto" onClick={e => e.stopPropagation()}>
                    {isPending ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={e => handleOpenReject(ret, e)}
                        >
                          Decline
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          isLoading={processingId === ret.id}
                          onClick={() => handleWriteOffAndApprove(ret.id)}
                        >
                          Write Off
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Boxes className="w-3.5 h-3.5" />}
                          isLoading={processingId === ret.id}
                          onClick={() => handleRestockAndApprove(ret.id)}
                        >
                          Restock to Shelf
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <span>{ret.resolutionNote || 'Resolved'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* RETURN INSPECTION DETAIL & VERIFICATION MODAL */}
      {selectedReturn && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Return Inspection #${selectedReturn.returnNumber}`}
          subtitle={`Original Order #${selectedReturn.originalOrderNumber} · ${selectedReturn.customerName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Status & Commercials */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <ReturnStatusBadge status={selectedReturn.status} />
                <p className="text-xs text-slate-500 mt-1.5">
                  Requested {new Date(selectedReturn.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Refund Claim</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  ₹{selectedReturn.totalRefundAmount}
                </span>
              </div>
            </div>

            {/* Customer Reason Note Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>Customer's Written Statement:</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                  Category: {selectedReturn.reasonCategory}
                </span>
              </div>
              <p className="text-slate-800 leading-relaxed font-normal italic pl-1 border-l-2 border-amber-400">
                {selectedReturn.customerReasonNote || selectedReturn.reasonDescription}
              </p>
            </div>

            {/* Customer & Courier Details */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Name</span>
                <span className="font-semibold text-slate-800">{selectedReturn.customerName}</span>
              </div>
              {selectedReturn.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone Contact</span>
                  <span className="font-mono text-slate-800">{selectedReturn.customerPhone}</span>
                </div>
              )}
              {selectedReturn.pickupRider && (
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Return Pickup Courier</span>
                  <span className="text-emerald-700 font-medium">{selectedReturn.pickupRider.name} ({selectedReturn.pickupRider.vehicle})</span>
                </div>
              )}
            </div>

            {/* Evidence Photos Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>Item & Packaging Photos</span>
                </h4>
                <button
                  onClick={() => handleOpenAddPhoto(selectedReturn)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Inspection Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(selectedReturn.customerPhotos || []).map((photo, i) => (
                  <div
                    key={`cust-${i}`}
                    onClick={() => openLightbox(photo, `Customer Upload #${i + 1} - ${selectedReturn.items[0]?.productName || ''}`)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer aspect-square"
                  >
                    <img
                      src={photo}
                      alt="Customer proof"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium truncate backdrop-blur-xs">
                      Buyer Photo #{i + 1}
                    </span>
                  </div>
                ))}

                {(selectedReturn.inspectionPhotos || []).map((photo, i) => (
                  <div
                    key={`insp-${i}`}
                    onClick={() => openLightbox(photo, `Seller Warehouse Inspection Photo #${i + 1}`)}
                    className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 cursor-pointer aspect-square"
                  >
                    <img
                      src={photo}
                      alt="Inspection photo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-emerald-800/80 text-white text-[9px] font-medium truncate backdrop-blur-xs">
                      Store Verification #{i + 1}
                    </span>
                  </div>
                ))}

                {/* Quick Add photo tile */}
                <button
                  onClick={() => handleOpenAddPhoto(selectedReturn)}
                  className="rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 flex flex-col items-center justify-center gap-1.5 p-3 text-slate-500 hover:text-emerald-700 transition-colors aspect-square"
                >
                  <Camera className="w-5 h-5 text-slate-400" />
                  <span className="text-[11px] font-medium text-center">Add Proof Photo</span>
                </button>
              </div>
            </div>

            {/* Returned SKU Items */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Returned SKU Items
              </h4>
              <div className="space-y-2">
                {selectedReturn.items.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.quantity}× {item.productName}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        SKU: {item.sku} · Location: {item.binLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">₹{item.refundAmount}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-600">{item.condition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedReturn.rejectionReason && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs">
                <span className="font-bold text-rose-900 block mb-0.5">Decline Justification:</span>
                <p className="text-rose-800">{selectedReturn.rejectionReason}</p>
              </div>
            )}

            {selectedReturn.resolutionNote && (
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Resolution Note:</span>
                <p>{selectedReturn.resolutionNote}</p>
              </div>
            )}

            {/* Action buttons if pending */}
            {(selectedReturn.status === 'requested' || selectedReturn.status === 'pending_inspection') && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenReject(selectedReturn)}>
                  Decline Return
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={processingId === selectedReturn.id}
                  onClick={() => handleWriteOffAndApprove(selectedReturn.id)}
                >
                  Write Off & Refund
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Boxes className="w-3.5 h-3.5" />}
                  isLoading={processingId === selectedReturn.id}
                  onClick={() => handleRestockAndApprove(selectedReturn.id)}
                >
                  Restock & Refund
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* REJECT RETURN REASON MODAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Decline Customer Return"
        subtitle={`Return #${selectedReturn?.returnNumber} · Original Order #${selectedReturn?.originalOrderNumber}`}
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            State the inspection reason why this return cannot be accepted (e.g. seal tampered, item used, physical damage not reported on delivery).
          </p>

          <textarea
            rows={3}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Product warranty seal is broken and serial number does not match dispatch unit..."
            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectReason.trim()}
              isLoading={processingId === selectedReturn?.id}
              onClick={handleConfirmReject}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>

      {/* ATTACH INSPECTION PHOTO MODAL */}
      <Modal
        isOpen={isAddPhotoOpen}
        onClose={() => setIsAddPhotoOpen(false)}
        title="Attach Verification Photo"
        subtitle={`Upload photo for Return #${returns.find(r => r.id === uploadingForReturnId)?.returnNumber || ''}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Attach photo proof of item packaging, seal condition, barcode, or defect verification for audit records.
          </p>

          {/* Preset quick samples */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Quick Evidence Presets:</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: 'Box Seal Verified Intact',
                  url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
                },
                {
                  label: 'Barcode & Serial Tag',
                  url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
                },
                {
                  label: 'Transit Scratch / Fracture',
                  url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
                },
                {
                  label: 'Tamper Seal Broken',
                  url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
                },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewPhotoInput(preset.url)}
                  className={`p-2 rounded-lg border text-left text-[11px] font-medium transition-all ${
                    newPhotoInput === preset.url
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload or URL */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">
              Or Paste Image URL / Upload File:
            </label>
            <input
              type="text"
              value={newPhotoInput}
              onChange={e => setNewPhotoInput(e.target.value)}
              placeholder="https://... or select file below"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Local Photo from Device</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddPhotoOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newPhotoInput.trim() || isUploadingPhoto}
              isLoading={isUploadingPhoto}
              onClick={() => handleAttachPhoto(newPhotoInput)}
            >
              Attach Photo
            </Button>
          </div>
        </div>
      </Modal>

      {/* FULL PHOTO LIGHTBOX MODAL */}
      {activePhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4"
          onClick={() => setActivePhotoUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-white">
              <span className="text-xs font-semibold truncate pr-2">{photoCaption || 'Evidence Photo Preview'}</span>
              <button
                onClick={() => setActivePhotoUrl(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
              <img
                src={activePhotoUrl}
                alt="Enlarged evidence"
                referrerPolicy="no-referrer"
                className="max-h-[68vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>High Resolution Inspection Proof</span>
              <button
                onClick={() => setActivePhotoUrl(null)}
                className="text-xs font-semibold text-white hover:underline"
              >
                Close (ESC)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
