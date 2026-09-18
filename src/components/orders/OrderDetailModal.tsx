import React, { useState } from 'react';
import { SellerOrder } from '../../types/seller';
import { useStore } from '../../context/StoreContext';
import {
  Clock,
  PackageCheck,
  Truck,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  ShieldCheck,
  AlertCircle,
  Hash,
  Boxes,
  Lock,
  PhoneCall,
  PhoneForwarded,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface OrderDetailModalProps {
  order: SellerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const {
    acceptOrder,
    markOrderReady,
    markOrderHandedOver,
    toggleItemPacked,
    rejectOrder,
    updateProductStock,
  } = useStore();

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Item out of physical stock in warehouse');
  const [autoZeroStockOnReject, setAutoZeroStockOnReject] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Masked calling dialog
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isCallConnecting, setIsCallConnecting] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

  // Direct inventory update modal (seller-maintained)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<{
    productId: string;
    productName: string;
    brand: string;
    binLocation: string;
    image: string;
  } | null>(null);
  const [customStockCount, setCustomStockCount] = useState<number>(10);

  if (!order) return null;

  const handleAccept = async () => {
    setIsProcessing(true);
    await acceptOrder(order.id);
    setIsProcessing(false);
  };

  const handleReady = async () => {
    setIsProcessing(true);
    await markOrderReady(order.id);
    setIsProcessing(false);
  };

  const handleHandover = async () => {
    setIsProcessing(true);
    await markOrderHandedOver(order.id);
    setIsProcessing(false);
  };

  const handleConfirmReject = async () => {
    setIsProcessing(true);
    try {
      if (autoZeroStockOnReject && rejectReason.includes('stock') && order.items.length > 0) {
        for (const item of order.items) {
          try {
            await updateProductStock(item.productId, 0);
          } catch {
            // continue
          }
        }
      }
      await rejectOrder(order.id, rejectReason);
      setIsRejectOpen(false);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateCall = () => {
    setIsCallConnecting(true);
    setCallStatus('calling');
    setTimeout(() => {
      setIsCallConnecting(false);
      setCallStatus('connected');
    }, 1300);
  };

  const handleOpenStockModal = (item: any) => {
    setSelectedStockItem({
      productId: item.productId,
      productName: item.productName,
      brand: item.brand,
      binLocation: item.binLocation,
      image: item.image,
    });
    setCustomStockCount(12);
    setIsStockModalOpen(true);
  };

  const handleSaveStock = async (newStock: number) => {
    if (!selectedStockItem) return;
    setIsProcessing(true);
    try {
      await updateProductStock(selectedStockItem.productId, newStock);
      setIsStockModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const allItemsPacked = order.items.every(i => i.isPacked);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Order #${order.orderNumber}`}
        subtitle={`Placed at ${new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${order.paymentMethod}`}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Top Operational Status & Persistent Primary Action Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} size="lg" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Fulfillment Status</p>
                <p className="text-sm font-bold text-slate-900">
                  {order.status === 'placed' && 'Awaiting Seller Confirmation'}
                  {order.status === 'picking' && 'Items Being Packed in Store'}
                  {order.status === 'packed' && 'Packed · Waiting for Rider'}
                  {order.status === 'out_for_delivery' && 'In Transit to Job Site'}
                  {order.status === 'delivered' && 'Successfully Delivered'}
                  {order.status === 'cancelled' && 'Order Cancelled'}
                </p>
              </div>
            </div>

            {/* Quick Action Button based on operational lifecycle */}
            <div className="flex items-center gap-2">
              {order.status === 'placed' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsRejectOpen(true)}
                    disabled={isProcessing}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isProcessing}
                    onClick={handleAccept}
                  >
                    Accept & Start Packing
                  </Button>
                </>
              )}

              {order.status === 'picking' && (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isProcessing}
                  onClick={handleReady}
                >
                  <PackageCheck className="w-4 h-4 mr-1.5" />
                  <span>Mark as Ready ({order.items.filter(i => i.isPacked).length}/{order.items.length})</span>
                </Button>
              )}

              {order.status === 'packed' && (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isProcessing}
                  onClick={handleHandover}
                >
                  <Truck className="w-4 h-4 mr-1.5" />
                  <span>Hand Over to Rider</span>
                </Button>
              )}

              <button
                onClick={() => setIsInvoiceOpen(true)}
                className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                title="Print Packing Slip / GST Invoice"
                aria-label="Print Invoice"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery OTP Notice if in active handover / out for delivery */}
          {(order.status === 'packed' || order.status === 'out_for_delivery') && order.deliveryOtp && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-900">
                  Rider Handover Verification PIN:
                </span>
              </div>
              <span className="font-mono font-bold text-base tracking-widest text-emerald-900 bg-white px-2.5 py-0.5 rounded border border-emerald-300">
                {order.deliveryOtp}
              </span>
            </div>
          )}

          {/* Operational Guidance Callout */}
          {order.status === 'placed' && (
            <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-300 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                1
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-950">Review Order Details & Quantities</p>
                <p className="text-amber-800 mt-0.5">
                  Verify you have physical stock at the designated warehouse bins before accepting. Once accepted, this order immediately transitions into your <strong>Preparing & Packing checklist</strong>.
                </p>
              </div>
            </div>
          )}

          {order.status === 'picking' && (
            <div className="p-3.5 bg-blue-50/90 rounded-xl border border-blue-300 flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  2
                </div>
                <div className="text-xs">
                  <p className="font-bold text-blue-950">Step 2: Pack Items into Order Crate</p>
                  <p className="text-blue-800 mt-0.5">
                    Pick items from the listed shelf locations and check them off below as you place them into the packing crate.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  order.items.forEach(i => {
                    if (!i.isPacked) toggleItemPacked(order.id, i.productId, true);
                  });
                }}
                className="text-[11px] font-bold text-blue-700 bg-white hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 transition-colors"
              >
                Pack All Items
              </button>
            </div>
          )}

          {/* Items Checklist with Bin Locations */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Items to Pack ({order.items.length})
                </h4>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {order.items.reduce((acc, i) => acc + i.quantity, 0)} total units
                </span>
              </div>
              {order.status === 'picking' && (
                <span className="text-xs font-semibold text-blue-700">
                  {order.items.filter(i => i.isPacked).length} of {order.items.length} packed
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-xl overflow-hidden bg-white">
              {order.items.map(item => (
                <div
                  key={item.productId}
                  className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                    item.isPacked ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {order.status === 'picking' && (
                      <input
                        type="checkbox"
                        checked={item.isPacked}
                        onChange={e => toggleItemPacked(order.id, item.productId, e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        id={`check-pack-${item.productId}`}
                      />
                    )}

                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.brand}</p>
                      <h5 className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {item.productName}
                      </h5>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          <span>{item.binLocation}</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">HSN: {item.hsnCode}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">GST: {item.gstRatePercent}%</span>
                        <span className="text-slate-400">•</span>
                        <button
                          type="button"
                          onClick={() => handleOpenStockModal(item)}
                          className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-2 py-0.5 rounded transition-colors"
                          title="Merchant-only stock management"
                        >
                          <Boxes className="w-3 h-3 text-slate-500" />
                          <span>Adjust Stock</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black font-mono text-slate-900">
                      {item.quantity} × ₹{item.price}
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                      = ₹{(item.quantity * item.price).toFixed(0)}
                    </p>
                    {item.isPacked && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Picked</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Site & Customer Destination (Privacy-First Masked Pattern) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer & Job Site Details (Masked PII) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer & Destination</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  <Lock className="w-2.5 h-2.5 text-emerald-700" />
                  <span>PII Masked</span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{order.customer.name}</p>
                  <span className="text-[11px] text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {order.customer.businessName || 'Verified Trade Buyer'}
                  </span>
                </div>

                <div className="mt-2 p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{order.jobSite.deliveryLocality || 'Dispatch Locality'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5 leading-relaxed">{order.jobSite.address}</p>
                  {order.jobSite.jobTag && (
                    <p className="text-[11px] text-slate-600 pl-5 font-medium">
                      Site Note: {order.jobSite.jobTag}
                    </p>
                  )}
                </div>

                {order.customer.gstin && (
                  <p className="text-[11px] font-mono text-slate-500 mt-1.5">
                    Buyer GSTIN: {order.customer.gstin}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Proxy: {order.customer.virtualProxyNumber || '080-4890-XXXX'}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCallModalOpen(true)}
                  className="gap-1.5 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-700" />
                  <span>Call Buyer (Masked IVR)</span>
                </Button>
              </div>
            </div>

            {/* Assigned Rider Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned EV Courier Rider</span>
              </div>
              {order.rider ? (
                <div className="flex items-start gap-3">
                  <img
                    src={order.rider.photo}
                    alt={order.rider.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.rider.name}</p>
                    <p className="text-xs text-slate-600">{order.rider.vehicle}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-emerald-700 font-bold">{order.rider.rating} ★</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">ETA: {order.rider.etaMinutes} mins</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Rider will be dispatched once order is ready.</p>
              )}
              {order.rider && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <a
                    href={`tel:${order.rider.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Rider ({order.rider.phone})</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Net Seller Payout Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm pb-1 border-b border-slate-200">
              <span>Financial Settlement Breakdown</span>
              <span className="font-mono text-emerald-700">PAID via {order.paymentMethod}</span>
            </div>

            <div className="flex justify-between text-slate-600 pt-1">
              <span>Items Subtotal:</span>
              <span className="font-mono font-medium text-slate-900">₹{order.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Applicable GST (CGST + SGST):</span>
              <span className="font-mono font-medium text-slate-900">₹{order.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Handling & Packaging Fee:</span>
              <span className="font-mono font-medium text-slate-900">₹{order.handlingFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Customer Gross Paid:</span>
              <span className="font-mono font-semibold text-slate-800">₹{order.total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>QCOM Marketplace Commission ({order.commissionRatePercent}%):</span>
              <span className="font-mono font-semibold text-rose-600">-₹{order.commissionAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Govt TDS u/s 194O (1%):</span>
              <span className="font-mono font-semibold text-rose-600">-₹{order.tdsAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-300">
              <span className="text-emerald-800">Net Seller Settlement:</span>
              <span className="font-mono text-base font-black text-emerald-800">
                ₹{order.sellerEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Rejection Confirmation Dialog */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Decline Order"
        subtitle={`Order #${order.orderNumber} will be cancelled immediately.`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select decline reason:
            </label>
            <select
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="Item out of physical stock in warehouse">Item out of physical stock in warehouse</option>
              <option value="Heavy store rush, cannot meet 15-min SLA">Heavy store rush, cannot meet 15-min SLA</option>
              <option value="Damaged packaging or defective batch">Damaged packaging or defective batch</option>
              <option value="Store bay closing early">Store bay closing early</option>
            </select>
          </div>

          {rejectReason.includes('stock') && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={autoZeroStockOnReject}
                onChange={e => setAutoZeroStockOnReject(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
              />
              <div>
                <span className="font-bold">Auto-update inventory for this product</span>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Mark items in this order as 0 units (Out of Stock) in your store catalog so buyers cannot re-order.
                </p>
              </div>
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isProcessing}
              onClick={handleConfirmReject}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>

      {/* Customer Contact - Privacy Masked IVR Modal */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
          setCallStatus('idle');
        }}
        title="Customer Contact (Masked Virtual Bridge)"
        subtitle="Swiggy/Zomato privacy-compliant calling protocol"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Target Buyer:</span>
              <span className="text-sm font-bold text-slate-900">{order.customer.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Virtual Bridge Number:</span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                {order.customer.virtualProxyNumber || '080-4890-7711'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Order Reference:</span>
              <span className="text-xs font-mono font-bold text-slate-700">#{order.orderNumber}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Personal Contact Details Masked</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              To protect customer privacy and comply with marketplace data policies, buyers' direct phone numbers and emails are never shared with merchants. 
              When you dial, QCOM's automated exchange bridges your store phone with the buyer, displaying verified store caller ID.
            </p>
          </div>

          {callStatus === 'idle' && (
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCallModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isCallConnecting}
                onClick={handleInitiateCall}
                className="gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Connect Masked Call</span>
              </Button>
            </div>
          )}

          {callStatus === 'calling' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
                <PhoneForwarded className="w-4 h-4 text-amber-700" />
              </div>
              <p className="text-xs font-bold text-amber-900">Routing call via QCOM Virtual IVR...</p>
              <p className="text-[11px] text-amber-700">Connecting your merchant phone to {order.customer.name}</p>
            </div>
          )}

          {callStatus === 'connected' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-8 h-8 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">Virtual Bridge Active</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Call bridged securely through {order.customer.virtualProxyNumber || '080-4890-7711'}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCallStatus('idle');
                  setIsCallModalOpen(false);
                }}
              >
                End Bridge Session
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Seller Inventory & Stock Maintenance Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title="Update Store Inventory"
        subtitle={selectedStockItem ? `${selectedStockItem.productName} • ${selectedStockItem.brand}` : ''}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Merchant Stock Maintenance</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Stock updates are maintained directly by your store. Changing the count here immediately updates buyer search and stock reservations.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Set Available Physical Stock (Units):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="9999"
                value={customStockCount}
                onChange={e => setCustomStockCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-lg font-mono font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => setCustomStockCount(0)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
              >
                0 (Out of stock)
              </button>
              <button
                type="button"
                onClick={() => setCustomStockCount(5)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => setCustomStockCount(15)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                15
              </button>
              <button
                type="button"
                onClick={() => setCustomStockCount(50)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                50
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleSaveStock(0)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900"
            >
              Mark Out of Stock (0)
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStockModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleSaveStock(customStockCount)}
              >
                Save Stock ({customStockCount} units)
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Print Packing Slip / GST Invoice Modal */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Tax Invoice & Crate Packing Slip"
        subtitle={`Order #${order.orderNumber} • ${order.jobSite.deliveryLocality || 'Dispatch Locality'}`}
        maxWidth="md"
      >
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 text-xs font-mono text-slate-800 print:p-0">
          <div className="flex justify-between border-b pb-3">
            <div>
              <p className="font-black text-sm">QCOM QUICK COMMERCE PRIVATE LIMITED</p>
              <p className="text-[10px] text-slate-500">Merchant Fulfillment Hub: Koramangala, BLR</p>
              <p className="text-[10px] text-slate-500">Invoice #{order.orderNumber}-INV</p>
            </div>
            <div className="text-right">
              <p className="font-bold">TAX INVOICE</p>
              <p className="text-[10px] text-slate-500">{new Date(order.placedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b pb-3">
            <div>
              <p className="font-bold text-[11px]">DISPATCHED FROM (MERCHANT):</p>
              <p>Sri Lakshmi Hardware & Tools</p>
              <p>GSTIN: 29AABCS1429B1Z4</p>
            </div>
            <div>
              <p className="font-bold text-[11px]">DELIVERY DESTINATION:</p>
              <p>{order.customer.name}</p>
              <p>{order.jobSite.deliveryLocality || 'Dispatch Locality'}</p>
              <p className="text-[10px] text-slate-500">Contact: Masked Virtual Proxy</p>
              {order.customer.gstin && <p>Buyer GST: {order.customer.gstin}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-bold border-b pb-1">
              <span>Item Description</span>
              <span>Qty × Rate = Total</span>
            </div>
            {order.items.map(item => (
              <div key={item.productId} className="flex justify-between">
                <span className="truncate max-w-[240px]">{item.productName} ({item.hsnCode})</span>
                <span>{item.quantity} × ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-2 space-y-1 text-right">
            <p>Subtotal: ₹{order.subtotal.toFixed(2)}</p>
            <p>GST: ₹{order.tax.toFixed(2)}</p>
            <p className="font-bold text-sm">Total Paid: ₹{order.total.toFixed(2)}</p>
          </div>

          <div className="border-t pt-3 flex justify-between items-center no-print">
            <span className="text-slate-400 text-[10px]">Verified digital invoice record · PII Protected</span>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 mr-1" />
              <span>Print Slip</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
