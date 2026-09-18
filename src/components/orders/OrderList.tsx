import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { SellerOrder, OrderStatus } from '../../types/seller';
import {
  Search,
  ShoppingBag,
  Clock,
  PackageCheck,
  Truck,
  MapPin,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Zap,
  Lock,
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { OrderDetailModal } from './OrderDetailModal';

interface OrderListProps {
  initialFilter?: OrderStatus | 'all';
  selectedOrderId?: string | null;
  onClearSelectedOrder?: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  initialFilter = 'all',
  selectedOrderId,
  onClearSelectedOrder,
}) => {
  const {
    orders,
    isLoadingOrders,
    acceptOrder,
    markOrderReady,
    markOrderHandedOver,
    newOrdersCount,
    pickingCount,
    packedCount,
  } = useStore();

  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOrder, setModalOrder] = useState<SellerOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Sync incoming selectedOrderId prop
  React.useEffect(() => {
    if (selectedOrderId) {
      const match = orders.find(o => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
      if (match) {
        setModalOrder(match);
        setIsModalOpen(true);
      }
    }
  }, [selectedOrderId, orders]);

  const tabs: { id: OrderStatus | 'all'; label: string; count?: number }[] = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'placed', label: 'New', count: newOrdersCount },
    { id: 'picking', label: 'Preparing', count: pickingCount },
    { id: 'packed', label: 'Ready', count: packedCount },
    { id: 'out_for_delivery', label: 'In Transit' },
    { id: 'delivered', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeTab !== 'all') {
      result = result.filter(o => o.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.jobSite.address.toLowerCase().includes(q) ||
          o.items.some(i => i.productName.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, activeTab, searchQuery]);

  const handleOpenDetail = (order: SellerOrder) => {
    setModalOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setModalOrder(null);
    if (onClearSelectedOrder) onClearSelectedOrder();
  };

  const handleQuickAccept = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setProcessingId(orderId);
    await acceptOrder(orderId);
    setProcessingId(null);
  };

  const handleQuickReady = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setProcessingId(orderId);
    await markOrderReady(orderId);
    setProcessingId(null);
  };

  const handleQuickHandover = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setProcessingId(orderId);
    await markOrderHandedOver(orderId);
    setProcessingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer, site, item..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-slate-200/90 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Operational Filter Tabs with Counter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.id === 'placed'
                      ? 'bg-amber-100 text-amber-800 font-bold'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6" />}
          title={searchQuery ? 'No matching orders found' : 'No orders in this queue'}
          description={
            searchQuery
              ? `No orders matching query "${searchQuery}". Try clearing search.`
              : activeTab === 'placed'
              ? 'All new orders have been accepted and moved to preparation.'
              : 'You are all caught up for this stage of fulfillment.'
          }
          actionLabel={searchQuery ? 'Clear Search' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              onClick={() => handleOpenDetail(order)}
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Order Header & Items Summary */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <OrderStatusBadge status={order.status} size="md" />
                    <span className="font-mono font-bold text-sm text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-emerald-800">
                      ₹{order.total.toFixed(0)} ({order.paymentMethod})
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 truncate">
                        {order.customer.name}
                        {order.customer.businessName ? ` (${order.customer.businessName})` : ''}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Masked Contact</span>
                      </span>
                    </div>
                    <p className="text-slate-500 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{order.jobSite.deliveryLocality || order.jobSite.address}</span>
                    </p>
                  </div>

                  {/* Items Strip */}
                  <div className="mt-2.5 text-xs text-slate-700 truncate">
                    <span className="text-slate-400 font-medium mr-1.5">Items:</span>
                    {order.items.map((item, idx) => (
                      <span key={item.productId || idx}>
                        {idx > 0 && <span className="text-slate-300 mx-1.5">·</span>}
                        <span className="font-bold text-slate-900 mr-1">{item.quantity}×</span>
                        <span>{item.productName}</span>
                        {item.binLocation && (
                          <span className="text-[11px] text-slate-400 font-mono ml-1">
                            ({item.binLocation.split('•')[0].trim()})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button based on operational state */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {order.status === 'placed' && (
                    <Button
                      variant="primary"
                      size="md"
                      isLoading={processingId === order.id}
                      onClick={e => handleQuickAccept(e, order.id)}
                      className="w-full sm:w-auto"
                    >
                      Accept Order
                    </Button>
                  )}

                  {order.status === 'picking' && (
                    <Button
                      variant="primary"
                      size="md"
                      isLoading={processingId === order.id}
                      onClick={e => handleQuickReady(e, order.id)}
                      className="w-full sm:w-auto"
                    >
                      <PackageCheck className="w-4 h-4 mr-1.5" />
                      <span>Mark as Ready</span>
                    </Button>
                  )}

                  {order.status === 'packed' && (
                    <Button
                      variant="primary"
                      size="md"
                      isLoading={processingId === order.id}
                      onClick={e => handleQuickHandover(e, order.id)}
                      className="w-full sm:w-auto"
                    >
                      <Truck className="w-4 h-4 mr-1.5" />
                      <span>Hand Over</span>
                    </Button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 px-3 py-2 bg-purple-50 rounded-xl border border-purple-200">
                      <Truck className="w-4 h-4" />
                      <span>With Rider ({order.rider?.etaMinutes || 6}m ETA)</span>
                    </span>
                  )}

                  {order.status === 'delivered' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Delivered</span>
                    </span>
                  )}

                  <div className="p-2 text-slate-400 group-hover:text-slate-700 rounded-lg group-hover:bg-slate-100 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={modalOrder}
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
