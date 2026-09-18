import React, { useState, useEffect, useMemo } from 'react';
import { catalogService } from '../../services/catalogService';
import { SellerProduct, ProductStockStatus } from '../../types/seller';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Plus,
  Edit2,
  RotateCcw,
  Layers,
  MapPin,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { StockStatusBadge } from '../common/StatusBadge';
import { QuickStockStepper } from '../common/QuickStockStepper';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

interface InventoryListProps {
  initialFilterStatus?: ProductStockStatus | 'ALL';
}

export const InventoryList: React.FC<InventoryListProps> = ({
  initialFilterStatus = 'ALL',
}) => {
  const { updateProductStock } = useStore();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStockStatus | 'ALL'>(initialFilterStatus);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Quick Restock Modal
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [newBinLocation, setNewBinLocation] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { showToast } = useToast();

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const res = await catalogService.getProducts();
      setProducts(res.data);
    } catch {
      showToast('Error', 'Failed to load inventory levels.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.category)));
    return ['ALL', ...list];
  }, [products]);

  const stats = useMemo(() => {
    const inStock = products.filter(p => p.status === 'IN_STOCK').length;
    const lowStock = products.filter(p => p.status === 'LOW_STOCK').length;
    const outOfStock = products.filter(p => p.status === 'OUT_OF_STOCK').length;
    const totalUnits = products.reduce((acc, p) => acc + p.stockCount, 0);

    return { inStock, lowStock, outOfStock, totalUnits, total: products.length };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (statusFilter !== 'ALL') {
      list = list.filter(p => p.status === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      list = list.filter(p => p.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.binLocation.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    // Sort: Out of stock first, then low stock, then in stock
    list.sort((a, b) => {
      const order = { OUT_OF_STOCK: 0, LOW_STOCK: 1, IN_STOCK: 2 };
      const diff = order[a.status] - order[b.status];
      if (diff !== 0) return diff;
      return a.stockCount - b.stockCount;
    });

    return list;
  }, [products, statusFilter, categoryFilter, searchQuery]);

  const handleStockUpdate = async (productId: string, newCount: number) => {
    try {
      await updateProductStock(productId, newCount);
      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            const status: ProductStockStatus =
              newCount === 0 ? 'OUT_OF_STOCK' : newCount <= p.minStockAlert ? 'LOW_STOCK' : 'IN_STOCK';
            return {
              ...p,
              stockCount: newCount,
              inStock: newCount > 0,
              status,
            };
          }
          return p;
        })
      );
      showToast('Stock Updated', `Stock count updated to ${newCount}.`, 'success');
    } catch {
      showToast('Error', 'Failed to update stock count.', 'error');
    }
  };

  const handleOpenRestockModal = (p: SellerProduct) => {
    setSelectedProduct(p);
    setRestockQty(10);
    setNewBinLocation(p.binLocation || 'Bay A-01');
    setIsRestockOpen(true);
  };

  const handleSaveRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setIsUpdating(true);
      const updatedCount = selectedProduct.stockCount + restockQty;
      await catalogService.updateProduct(selectedProduct.id, {
        stockCount: updatedCount,
        binLocation: newBinLocation,
        inStock: updatedCount > 0,
        status:
          updatedCount === 0
            ? 'OUT_OF_STOCK'
            : updatedCount <= selectedProduct.minStockAlert
            ? 'LOW_STOCK'
            : 'IN_STOCK',
      });

      setProducts(prev =>
        prev.map(p =>
          p.id === selectedProduct.id
            ? {
                ...p,
                stockCount: updatedCount,
                binLocation: newBinLocation,
                inStock: updatedCount > 0,
                status:
                  updatedCount === 0
                    ? 'OUT_OF_STOCK'
                    : updatedCount <= selectedProduct.minStockAlert
                    ? 'LOW_STOCK'
                    : 'IN_STOCK',
              }
            : p
        )
      );

      setIsRestockOpen(false);
      showToast(
        'Inventory Restocked',
        `Added +${restockQty} units to ${selectedProduct.name}. New total: ${updatedCount} ${selectedProduct.unit}s.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to process restock batch.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-700" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Warehouse Inventory & Bin Stock
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time physical inventory counting, warehouse shelf bin locations, and fast stepper restock controls.
          </p>
        </div>
      </div>

      {/* Stock Health Metric Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Out of stock card */}
        <button
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-rose-800 text-white border-rose-800 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${statusFilter === 'OUT_OF_STOCK' ? 'text-rose-200' : 'text-slate-500'}`}>
              Out of Stock (Action Req.)
            </span>
            {stats.outOfStock > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-bold font-mono mt-1.5 text-rose-600">
            {stats.outOfStock}
          </p>
          <p className={`text-[11px] mt-0.5 ${statusFilter === 'OUT_OF_STOCK' ? 'text-rose-200' : 'text-rose-800 font-medium'}`}>
            Zero available units
          </p>
        </button>

        {/* Low Stock Card */}
        <button
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
          }`}
        >
          <span className={`text-xs font-medium ${statusFilter === 'LOW_STOCK' ? 'text-amber-200' : 'text-slate-500'}`}>
            Low Stock Warnings
          </span>
          <p className="text-2xl font-bold font-mono mt-1.5 text-amber-600">
            {stats.lowStock}
          </p>
          <p className={`text-[11px] mt-0.5 ${statusFilter === 'LOW_STOCK' ? 'text-amber-200' : 'text-amber-800 font-medium'}`}>
            Below threshold alerts
          </p>
        </button>

        {/* Healthy In-Stock Card */}
        <button
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'IN_STOCK'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
          }`}
        >
          <span className={`text-xs font-medium ${statusFilter === 'IN_STOCK' ? 'text-emerald-200' : 'text-slate-500'}`}>
            Healthy Stock Levels
          </span>
          <p className="text-2xl font-bold font-mono mt-1.5 text-emerald-600">
            {stats.inStock}
          </p>
          <p className={`text-[11px] mt-0.5 ${statusFilter === 'IN_STOCK' ? 'text-emerald-200' : 'text-slate-500'}`}>
            Ready for instant dispatch
          </p>
        </button>

        {/* Total Physical Units */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Physical Units On-Hand</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
            {stats.totalUnits.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all storage bays</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, item name, or bin location (e.g. Bay A-02)..."
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
              All Items ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('OUT_OF_STOCK')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'OUT_OF_STOCK'
                  ? 'bg-white text-rose-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock ({stats.outOfStock})
            </button>
            <button
              onClick={() => setStatusFilter('LOW_STOCK')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'LOW_STOCK'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock ({stats.lowStock})
            </button>
            <button
              onClick={() => setStatusFilter('IN_STOCK')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'IN_STOCK'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Stock
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table & Mobile List */}
      {isLoading ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading inventory...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <EmptyState
            icon={<Boxes className="w-8 h-8 text-slate-400" />}
            title="No inventory records found"
            description="There are no items matching your selected status or filter parameters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
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
                  <th className="py-3 px-4">Warehouse Item</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Storage Bin / Bay</th>
                  <th className="py-3 px-4 text-center">Alert Threshold</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-center">Quick Stock Adjustment</th>
                  <th className="py-3 px-4 text-right">Restock Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      p.status === 'OUT_OF_STOCK'
                        ? 'bg-rose-50/20'
                        : p.status === 'LOW_STOCK'
                        ? 'bg-amber-50/15'
                        : ''
                    }`}
                  >
                    {/* Item details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=100'}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.brand} · {p.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {p.sku}
                    </td>

                    {/* Bin Location */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-semibold">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{p.binLocation || 'Bay A-01'}</span>
                      </div>
                    </td>

                    {/* Alert Threshold */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      ≤ {p.minStockAlert} {p.unit}
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <StockStatusBadge status={p.status} size="sm" />
                    </td>

                    {/* Stepper for Quick Inventory Adjustment */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">
                        <QuickStockStepper
                          productId={p.id}
                          currentStock={p.stockCount}
                          unit={p.unit}
                          onStockChange={handleStockUpdate}
                        />
                      </div>
                    </td>

                    {/* Restock action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenRestockModal(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                className={`p-3.5 space-y-3 ${
                  p.status === 'OUT_OF_STOCK'
                    ? 'bg-rose-50/20'
                    : p.status === 'LOW_STOCK'
                    ? 'bg-amber-50/15'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=100'}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                        <span>SKU: {p.sku}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{p.binLocation || 'Bay A-01'}</span>
                      </div>
                    </div>
                  </div>

                  <StockStatusBadge status={p.status} size="sm" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <QuickStockStepper
                      productId={p.id}
                      currentStock={p.stockCount}
                      unit={p.unit}
                      onStockChange={handleStockUpdate}
                    />
                  </div>

                  <button
                    onClick={() => handleOpenRestockModal(p)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 border border-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESTOCK BATCH MODAL */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title="Inbound Restock Batch"
        subtitle={selectedProduct ? `${selectedProduct.name} (SKU: ${selectedProduct.sku})` : ''}
        maxWidth="sm"
      >
        {selectedProduct && (
          <form onSubmit={handleSaveRestock} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Current On-Hand Stock:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedProduct.stockCount} {selectedProduct.unit}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alert Min Threshold:</span>
                <span className="font-mono text-slate-700">
                  {selectedProduct.minStockAlert} {selectedProduct.unit}s
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Incoming Inbound Quantity ({selectedProduct.unit}s) *
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={e => setRestockQty(Math.max(1, Number(e.target.value)))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                New total will be {selectedProduct.stockCount + restockQty} {selectedProduct.unit}s.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Assigned Storage Bay / Bin</label>
              <input
                type="text"
                placeholder="e.g. Bay B-03"
                value={newBinLocation}
                onChange={e => setNewBinLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsRestockOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdating}
              >
                Confirm Restock (+{restockQty})
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
