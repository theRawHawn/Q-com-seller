import React, { useState, useEffect, useMemo } from 'react';
import { catalogService } from '../../services/catalogService';
import { SellerProduct, ProductStockStatus } from '../../types/seller';
import {
  Package,
  Search,
  Plus,
  Boxes,
  MapPin,
  Edit2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Tag,
  IndianRupee,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StockStatusBadge } from '../common/StatusBadge';
import { QuickStockStepper } from '../common/QuickStockStepper';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

interface CatalogViewProps {
  initialFilterStatus?: ProductStockStatus | 'ALL';
  onNavigateTab?: (tab: string, filter?: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialFilterStatus = 'ALL',
  onNavigateTab,
}) => {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStockStatus | 'ALL'>(initialFilterStatus);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Edit and Add Product Modal states
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'Electrical & Lighting',
    sku: '',
    price: '',
    mrp: '',
    stockCount: '10',
    minStockAlert: '3',
    binLocation: 'Aisle 1 · Bin A-01',
    unit: 'piece',
  });

  const { showToast } = useToast();
  const { refreshOrders } = useStore();

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
          p.binLocation.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, statusFilter, categoryFilter, searchQuery]);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const res = await catalogService.updateStock(productId, newStock);
      setProducts(prev => prev.map(p => (p.id === productId ? res.data : p)));
      refreshOrders(); // Sync store counts
      showToast('Stock Updated', `${res.data.name}: ${res.data.stockCount} ${res.data.unit}(s) available.`, 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const handleToggleActive = async (productId: string, inStock: boolean) => {
    try {
      const res = await catalogService.toggleProductAvailability(productId, inStock);
      setProducts(prev => prev.map(p => (p.id === productId ? res.data : p)));
      refreshOrders();
      showToast('Availability Updated', res.message, 'info');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleOpenEdit = (product: SellerProduct) => {
    setEditingProduct({ ...product });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      const safeStock = Math.max(0, Number(editingProduct.stockCount));
      const minStock = Math.max(1, Number(editingProduct.minStockAlert));
      let status: ProductStockStatus = editingProduct.status;
      if (safeStock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (safeStock <= minStock) {
        status = 'LOW_STOCK';
      } else {
        status = 'IN_STOCK';
      }

      const res = await catalogService.updateProduct(editingProduct.id, {
        name: editingProduct.name.trim(),
        brand: editingProduct.brand.trim(),
        category: editingProduct.category.trim(),
        subcategory: editingProduct.subcategory?.trim() || '',
        sku: editingProduct.sku.trim().toUpperCase(),
        unit: editingProduct.unit?.trim() || 'piece',
        price: Number(editingProduct.price),
        mrp: Number(editingProduct.mrp || editingProduct.price),
        stockCount: safeStock,
        minStockAlert: minStock,
        status,
        inStock: editingProduct.inStock && safeStock > 0,
        binLocation: editingProduct.binLocation.trim(),
        imageUrl: editingProduct.imageUrl || editingProduct.image,
        image: editingProduct.imageUrl || editingProduct.image,
        description: editingProduct.description || '',
        hsnCode: editingProduct.hsnCode || '',
        gstRatePercent: Number(editingProduct.gstRatePercent) || 18,
      });
      setProducts(prev => prev.map(p => (p.id === res.data.id ? res.data : p)));
      refreshOrders();
      showToast('Product Updated', `Saved "${res.data.name}" (${res.data.sku}) successfully.`, 'success');
      setIsEditOpen(false);
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await catalogService.addProduct({
        name: newProduct.name,
        brand: newProduct.brand,
        category: newProduct.category,
        subcategory: 'General',
        sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
        price: Number(newProduct.price),
        mrp: Number(newProduct.mrp || newProduct.price),
        unit: newProduct.unit,
        stockCount: Number(newProduct.stockCount),
        minStockAlert: Number(newProduct.minStockAlert),
        binLocation: newProduct.binLocation,
        description: 'Store catalog item.',
        hsnCode: '8536',
        gstRatePercent: 18,
        imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=500&auto=format&fit=crop&q=60',
        tags: [newProduct.brand, newProduct.category],
        specs: { brand: newProduct.brand },
        inStock: Number(newProduct.stockCount) > 0,
        status: Number(newProduct.stockCount) === 0 ? 'OUT_OF_STOCK' : Number(newProduct.stockCount) <= Number(newProduct.minStockAlert) ? 'LOW_STOCK' : 'IN_STOCK',
      });
      setProducts(prev => [res.data, ...prev]);
      refreshOrders();
      showToast('Product Added', `${res.data.name} is now in your catalog.`, 'success');
      setIsAddOpen(false);
      setNewProduct({
        name: '',
        brand: '',
        category: 'Electrical & Lighting',
        sku: '',
        price: '',
        mrp: '',
        stockCount: '10',
        minStockAlert: '3',
        binLocation: 'Aisle 1 · Bin A-01',
        unit: 'piece',
      });
    } catch (err: any) {
      showToast('Add Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CATALOG & INVENTORY SUMMARY METRIC STRIP - Matching Home Theme */}
      <section id="catalog-summary-strip">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              statusFilter === 'ALL'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Total SKUs</span>
              <Package className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {counts.total}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">All active catalog items</p>
          </button>

          <button
            onClick={() => setStatusFilter('IN_STOCK')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              statusFilter === 'IN_STOCK'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">In Stock</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 mt-2">
              {counts.inStock}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Ready for instant delivery</p>
          </button>

          <button
            onClick={() => setStatusFilter('LOW_STOCK')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              statusFilter === 'LOW_STOCK'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : counts.lowStock > 0
                ? 'border-amber-300'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Low Stock</span>
              {counts.lowStock > 0 && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </div>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 mt-2">
              {counts.lowStock}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Below buffer threshold</p>
          </button>

          <button
            onClick={() => setStatusFilter('OUT_OF_STOCK')}
            className={`p-3.5 rounded-xl border text-left transition-all bg-white hover:border-slate-300 shadow-2xs cursor-pointer ${
              statusFilter === 'OUT_OF_STOCK'
                ? 'border-slate-900 ring-1 ring-slate-900/10'
                : counts.outOfStock > 0
                ? 'border-rose-300'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Out of Stock</span>
              {counts.outOfStock > 0 && <span className="w-2 h-2 rounded-full bg-rose-500" />}
            </div>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 mt-2">
              {counts.outOfStock}
            </p>
            <p className="text-[11px] text-rose-700 font-medium mt-0.5">Hidden from consumer search</p>
          </button>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section id="catalog-controls" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, item name, brand, bin aisle..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
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
              className="text-xs font-semibold px-2.5 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white shadow-2xs"
            >
              Reset Status
            </button>
          )}

          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddOpen(true)}
          >
            Add Product
          </Button>
        </div>
      </section>

      {/* 3. PRODUCT / INVENTORY LIST */}
      <section id="catalog-product-list" className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-3 shadow-2xs">
            <Boxes className="w-8 h-8 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-800">No products found</p>
              <p className="text-xs text-slate-500 mt-0.5">Try searching with a different SKU code, brand, or status filter.</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredProducts.map(product => {
            const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

            return (
              <div
                key={product.id}
                className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Product Meta & Identity */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      src={product.imageUrl || product.image}
                      alt={product.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {product.brand}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-500">{product.sku}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500">{product.category}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5 truncate">
                        {product.name}
                      </h4>

                      {/* Bin Location & Status Badge */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <StockStatusBadge
                          status={product.status}
                          count={product.stockCount}
                          unit={product.unit}
                        />

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{product.binLocation}</span>
                        </span>

                        <span className="text-[11px] text-slate-400">
                          Buffer: {product.minStockAlert} {product.unit}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Commercials, Inline Stock Stepper & Edit Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Price & Commercials */}
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline gap-1.5 sm:justify-end">
                        <span className="text-base font-bold tabular-nums text-slate-900">
                          ₹{product.price}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs line-through text-slate-400 tabular-nums">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {discount > 0 ? (
                          <span className="text-emerald-700 font-semibold">{discount}% margin</span>
                        ) : (
                          <span>Standard MRP</span>
                        )}
                      </div>
                    </div>

                    {/* Stock Stepper & Edit Action */}
                    <div className="flex items-center gap-2">
                      <QuickStockStepper
                        productId={product.id}
                        currentStock={product.stockCount}
                        unit={product.unit}
                        onStockChange={(id, newCount) => handleStockUpdate(id, newCount)}
                      />

                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit SKU Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Product: ${editingProduct.name}`}
          subtitle={`SKU: ${editingProduct.sku} · ${editingProduct.category}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Title / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingProduct.name}
                onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                placeholder="e.g. Fevicol ProBond High-Strength Waterproof Wood Adhesive (1kg)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SKU Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.sku}
                  onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value.toUpperCase() })}
                  placeholder="e.g. ADH-FEV-1KG"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Adhesives & Chemicals">Adhesives & Chemicals</option>
                  <option value="Electrical & Lighting">Electrical & Lighting</option>
                  <option value="Plumbing & Sanitaryware">Plumbing & Sanitaryware</option>
                  <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                  <option value="Power Tools & Equipment">Power Tools & Equipment</option>
                  <option value="Paints & Finishes">Paints & Finishes</option>
                  <option value="Building Materials">Building Materials</option>
                  <option value="Safety & PPE">Safety & PPE</option>
                  <option value="Garden & Outdoor">Garden & Outdoor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">MRP Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={editingProduct.mrp}
                  onChange={e => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Alert Buffer</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingProduct.minStockAlert}
                  onChange={e => setEditingProduct({ ...editingProduct, minStockAlert: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">Triggers low stock alert when inventory reaches this count.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf / Bin Location</label>
                <input
                  type="text"
                  required
                  value={editingProduct.binLocation}
                  onChange={e => setEditingProduct({ ...editingProduct, binLocation: e.target.value })}
                  placeholder="e.g. Aisle 3 · Bin B-12"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Active for Customer Ordering</p>
                <p className="text-[11px] text-slate-500">Toggle to temporarily pause sales without deleting SKU.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct({ ...editingProduct, inStock: !editingProduct.inStock })}
                className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  editingProduct.inStock
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {editingProduct.inStock ? 'Active / On' : 'Paused / Off'}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Catalog SKU"
        subtitle="List a new product for instant delivery from your store hub"
        maxWidth="md"
      >
        <form onSubmit={handleCreateProduct} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Anchor Roma 6A 2-Way Modular Switch"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Anchor / Havells"
                value={newProduct.brand}
                onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Electrical & Lighting">Electrical & Lighting</option>
                <option value="Plumbing & Sanitaryware">Plumbing & Sanitaryware</option>
                <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                <option value="Power Tools & Equipment">Power Tools & Equipment</option>
                <option value="Safety & PPE">Safety & PPE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                min="1"
                required
                placeholder="180"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">MRP Price (₹)</label>
              <input
                type="number"
                min="1"
                required
                placeholder="220"
                value={newProduct.mrp}
                onChange={e => setNewProduct({ ...newProduct, mrp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock</label>
              <input
                type="number"
                min="0"
                required
                value={newProduct.stockCount}
                onChange={e => setNewProduct({ ...newProduct, stockCount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf / Bin Location</label>
              <input
                type="text"
                required
                placeholder="Aisle 1 · Bin A-01"
                value={newProduct.binLocation}
                onChange={e => setNewProduct({ ...newProduct, binLocation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Alert Buffer</label>
              <input
                type="number"
                min="1"
                required
                value={newProduct.minStockAlert}
                onChange={e => setNewProduct({ ...newProduct, minStockAlert: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Add to Catalog
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
