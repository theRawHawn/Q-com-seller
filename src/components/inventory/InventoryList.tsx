import React, { useState, useEffect, useMemo } from 'react';
import { catalogService } from '../../services/catalogService';
import { SellerProduct, ProductStockStatus } from '../../types/seller';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Tag,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { StockStatusBadge } from '../common/StatusBadge';
import { QuickStockStepper } from '../common/QuickStockStepper';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';

interface InventoryListProps {
  initialFilterStatus?: ProductStockStatus | 'ALL';
}

export const InventoryList: React.FC<InventoryListProps> = ({
  initialFilterStatus = 'ALL',
}) => {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStockStatus | 'ALL'>(initialFilterStatus);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Edit / Add product modal states
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      const res = await catalogService.getProducts();
      setProducts(res.data);
    } catch (err: any) {
      showToast('Error', 'Failed to load catalog items.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Sync incoming filter
  useEffect(() => {
    if (initialFilterStatus) {
      setStatusFilter(initialFilterStatus);
    }
  }, [initialFilterStatus]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.category)));
    return ['ALL', ...list];
  }, [products]);

  const counts = useMemo(() => {
    const inStock = products.filter(p => p.status === 'IN_STOCK').length;
    const lowStock = products.filter(p => p.status === 'LOW_STOCK').length;
    const outOfStock = products.filter(p => p.status === 'OUT_OF_STOCK').length;
    return { inStock, lowStock, outOfStock, total: products.length };
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
          p.brand.toLowerCase().includes(q) ||
          p.binLocation.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, statusFilter, categoryFilter, searchQuery]);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const res = await catalogService.updateStock(productId, newStock);
      setProducts(prev => prev.map(p => (p.id === productId ? res.data : p)));
      showToast('Stock Updated', `${res.data.name}: ${res.data.stockCount} in stock.`, 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const handleToggleActive = async (productId: string, inStock: boolean) => {
    try {
      const res = await catalogService.toggleProductAvailability(productId, inStock);
      setProducts(prev => prev.map(p => (p.id === productId ? res.data : p)));
      showToast('Status Updated', res.message, 'info');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      const res = await catalogService.updateProduct(editingProduct.id, {
        price: Number(editingProduct.price),
        mrp: Number(editingProduct.mrp),
        minStockAlert: Number(editingProduct.minStockAlert),
        binLocation: editingProduct.binLocation,
      });
      setProducts(prev => prev.map(p => (p.id === res.data.id ? res.data : p)));
      showToast('Saved', 'Product details updated successfully.', 'success');
      setIsEditOpen(false);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Inventory Summary Metric Strip */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`p-3.5 rounded-xl border text-left transition-all shadow-2xs ${
            statusFilter === 'IN_STOCK'
              ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">In Stock</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">{counts.inStock}</span>
            <span className="text-xs text-slate-500">SKUs</span>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`p-3.5 rounded-xl border text-left transition-all shadow-2xs ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-amber-50/70 border-amber-500 ring-1 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Low Stock</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-700">{counts.lowStock}</span>
            <span className="text-xs text-slate-500">SKUs</span>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`p-3.5 rounded-xl border text-left transition-all shadow-2xs ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-rose-50/70 border-rose-500 ring-1 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Out of Stock</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-700">{counts.outOfStock}</span>
            <span className="text-xs text-slate-500">SKUs</span>
          </div>
        </button>
      </div>

      {/* 2. Search, Category Bar & Add Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, bin aisle..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-slate-200/90 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-600 shadow-2xs"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-xs font-semibold px-2.5 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white"
            >
              Reset Filter
            </button>
          )}

          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddOpen(true)}
          >
            Add SKU
          </Button>
        </div>
      </div>

      {/* 3. Product Catalog List / Responsive Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-6 h-6" />}
          title="No products found"
          description="Try adjusting your filters or search keywords."
          actionLabel="Show All Products"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
            setCategoryFilter('ALL');
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Product Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <img
                    src={product.imageUrl || product.image}
                    alt={product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-mono text-slate-500">{product.sku}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mt-0.5">
                      {product.name}
                    </h4>

                    {/* Meta tags: Bin, HSN, Tax */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{product.binLocation}</span>
                      </span>

                      <StockStatusBadge
                        status={product.status}
                        count={product.stockCount}
                        unit={product.unit}
                      />

                      <span className="text-slate-400 hidden sm:inline">•</span>
                      <span className="text-slate-500 hidden sm:inline">Alert threshold: ≤ {product.minStockAlert}</span>
                    </div>
                  </div>
                </div>

                {/* Price & Fast Stock Stepper Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Pricing Hierarchy */}
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-black font-mono text-slate-900">
                      ₹{product.price}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="line-through">₹{product.mrp}</span>
                      <span className="text-emerald-700 font-bold">
                        ₹{product.mrp - product.price} off
                      </span>
                    </div>
                  </div>

                  {/* Fast Stock Stepper */}
                  <div className="flex items-center gap-2">
                    <QuickStockStepper
                      productId={product.id}
                      currentStock={product.stockCount}
                      unit={product.unit}
                      onStockChange={handleStockUpdate}
                    />

                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditOpen(true);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="Edit Product Details"
                      aria-label="Edit product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Product Catalog Details"
        subtitle={editingProduct?.name}
        maxWidth="md"
      >
        {editingProduct && (
          <form onSubmit={handleSaveProductEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Maximum Retail Price / MRP (₹)
                </label>
                <input
                  type="number"
                  value={editingProduct.mrp}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })
                  }
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shelf / Rack Location (Optional)
                </label>
                <input
                  type="text"
                  value={editingProduct.binLocation || ''}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, binLocation: e.target.value })
                  }
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                  placeholder="e.g. Shelf A / Rack 2 (optional)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  value={editingProduct.minStockAlert}
                  onChange={e =>
                    setEditingProduct({
                      ...editingProduct,
                      minStockAlert: Number(e.target.value),
                    })
                  }
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add SKU Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Hardware SKU to Store"
        subtitle="Catalog additions are immediately verified and listed for quick commerce delivery"
        maxWidth="md"
      >
        <form
          onSubmit={async e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const name = (form.elements.namedItem('sku_name') as HTMLInputElement).value;
            const brand = (form.elements.namedItem('sku_brand') as HTMLInputElement).value;
            const category = (form.elements.namedItem('sku_cat') as HTMLSelectElement).value;
            const price = Number((form.elements.namedItem('sku_price') as HTMLInputElement).value);
            const mrp = Number((form.elements.namedItem('sku_mrp') as HTMLInputElement).value);
            const stockCount = Number((form.elements.namedItem('sku_stock') as HTMLInputElement).value);
            const binLocation = (form.elements.namedItem('sku_bin') as HTMLInputElement).value;

            try {
              setIsSubmitting(true);
              const res = await catalogService.addProduct({
                name,
                brand,
                category,
                price,
                mrp,
                stockCount,
                minStockAlert: 5,
                unit: 'Piece',
                status: stockCount > 5 ? 'IN_STOCK' : stockCount > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK',
                inStock: stockCount > 0,
                binLocation: binLocation || '',
                imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=200&auto=format&fit=crop&q=80',
                image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=200&auto=format&fit=crop&q=80',
                sku: `SKU-${Date.now().toString().slice(-5)}`,
                description: 'Quick-dispatch trade hardware SKU',
                hsnCode: '8481.80.90',
                gstRatePercent: 18,
                specs: {},
                subcategory: 'General',
                tags: ['hardware', 'trade'],
              });
              setProducts(prev => [res.data, ...prev]);
              showToast('SKU Added', `${name} listed in catalog.`, 'success');
              setIsAddOpen(false);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title</label>
            <input
              name="sku_name"
              type="text"
              placeholder="e.g. Finolex 2.5 sq mm FR PVC Insulated Wire (90m)"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
              <input
                name="sku_brand"
                type="text"
                placeholder="e.g. Finolex / Bosch"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                name="sku_cat"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white"
                required
              >
                <option value="Electrical & Lighting">Electrical & Lighting</option>
                <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                <option value="Power Tools & Accessories">Power Tools & Accessories</option>
                <option value="Fasteners & Adhesives">Fasteners & Adhesives</option>
                <option value="Paints & Chemicals">Paints & Chemicals</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling (₹)</label>
              <input
                name="sku_price"
                type="number"
                placeholder="450"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">MRP (₹)</label>
              <input
                name="sku_mrp"
                type="number"
                placeholder="550"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Qty</label>
              <input
                name="sku_stock"
                type="number"
                placeholder="25"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shelf / Rack Location (Optional)
            </label>
            <input
              name="sku_bin"
              type="text"
              placeholder="e.g. Shelf A / Rack 2 (optional)"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Add Product SKU
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
