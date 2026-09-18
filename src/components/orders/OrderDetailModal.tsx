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
  } = useStore();

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Item out of physical stock in warehouse');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    await rejectOrder(order.id, rejectReason);
    setIsProcessing(false);
    setIsRejectOpen(false);
    onClose();
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
                  icon={<PackageCheck className="w-4 h-4" />}
                  isLoading={isProcessing}
                  onClick={handleReady}
                >
                  Mark as Ready ({order.items.filter(i => i.isPacked).length}/{order.items.length})
                </Button>
              )}

              {order.status === 'packed' && (
                <Button
                  variant="primary"
                  size="md"
                  icon={<Truck className="w-4 h-4" />}
                  isLoading={isProcessing}
                  onClick={handleHandover}
                >
                  Hand Over to Rider
                </Button>
              )}

              <button
                onClick={() => setIsInvoiceOpen(true)}
                className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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

          {/* Items Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-bold text-slate-900">
                Items in Order ({order.items.length})
              </h4>
              {order.status === 'picking' && (
                <span className="text-xs text-slate-500">
                  Tap checkbox as you pick items into the order crate
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
                        {item.binLocation && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                            <MapPin className="w-3 h-3 text-emerald-700" />
                            <span>{item.binLocation.split('•')[0].trim()}</span>
                          </span>
                        )}
                        {item.binLocation && <span className="text-slate-300">•</span>}
                        <span className="text-slate-500">HSN: {item.hsnCode}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">GST: {item.gstRatePercent}%</span>
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

          {/* Job Site & Customer Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer & Job Site Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Job Site Destination</span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">{order.customer.name}</p>
                <p className="text-xs text-slate-500">{order.customer.businessName || 'Independent Trade Customer'}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{order.jobSite.address}</p>
                {order.jobSite.landmark && (
                  <p className="text-xs text-slate-500 mt-0.5">Landmark: {order.jobSite.landmark}</p>
                )}
                {order.customer.gstin && (
                  <p className="text-[11px] font-mono text-slate-500 mt-1">Buyer GSTIN: {order.customer.gstin}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <a
                  href={`tel:${order.customer.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Customer ({order.customer.phone})</span>
                </a>
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

      {/* Print Packing Slip / GST Invoice Modal */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Tax Invoice & Crate Packing Slip"
        subtitle={`Order #${order.orderNumber} • ${order.jobSite.address}`}
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
              <p>{order.jobSite.address}</p>
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
            <span className="text-slate-400 text-[10px]">Verified digital invoice record</span>
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
