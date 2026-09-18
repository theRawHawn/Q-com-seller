import React, { useState, useEffect, useMemo } from 'react';
import { catalogService } from '../../services/catalogService';
import { SellerProduct } from '../../types/seller';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Tag,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const CatalogView: React.FC = () => {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [listingStatusFilter, setListingStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Edit / Add product modal states
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<SellerProduct>>({
    name: '',
    sku: '',
    category: 'Electricals',
    subcategory: 'Switches',
    brand: '',
    price: 100,
    mrp: 120,
    unit: 'pc',
    stockCount: 20,
    minStockAlert: 5,
    inStock: true,
    status: 'IN_STOCK',
    binLocation: 'Bay A-01',
    description: '',
    hsnCode: '8536',
    gstRatePercent: 18,
    tags: [],
  });

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

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.category)));
    return ['ALL', ...list];
  }, [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.inStock).length;
    const avgMargin =
      total > 0
        ? products.reduce((acc, p) => acc + ((p.mrp - p.price) / (p.mrp || 1)) * 100, 0) / total
        : 0;
    return { total, active, inactive: total - active, avgMargin };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (categoryFilter !== 'ALL') {
      list = list.filter(p => p.category === categoryFilter);
    }

    if (listingStatusFilter === 'ACTIVE') {
      list = list.filter(p => p.inStock);
    } else if (listingStatusFilter === 'INACTIVE') {
      list = list.filter(p => !p.inStock);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, categoryFilter, listingStatusFilter, searchQuery]);

  const handleToggleListingStatus = async (product: SellerProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !product.inStock;
    try {
      await catalogService.updateProduct(product.id, { inStock: newStatus });
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, inStock: newStatus } : p))
      );
      showToast(
        'Catalog Updated',
        `${product.name} is now ${newStatus ? 'Active & Listed on QCOM' : 'Delisted/Hidden'}.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to toggle listing status.', 'error');
    }
  };

  const handleOpenEdit = (p: SellerProduct) => {
    setEditingProduct({ ...p });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      await catalogService.updateProduct(editingProduct.id, editingProduct);
      setProducts(prev =>
        prev.map(p => (p.id === editingProduct.id ? editingProduct : p))
      );
      setIsEditOpen(false);
      showToast('Product Updated', `Saved changes for ${editingProduct.name}`, 'success');
    } catch {
      showToast('Error', 'Failed to update product details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.brand || !newProduct.price) {
      showToast('Missing Fields', 'Please fill in product name, brand, and pricing.', 'warning');
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await catalogService.createProduct({
        ...newProduct,
        name: newProduct.name || 'Unnamed Product',
        brand: newProduct.brand || 'QCOM',
        category: newProduct.category || 'Electricals',
        subcategory: newProduct.subcategory || 'General',
        sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
        unit: newProduct.unit || 'pc',
        binLocation: newProduct.binLocation || 'Bay A-01',
        description: newProduct.description || '',
        hsnCode: newProduct.hsnCode || '8536',
        gstRatePercent: newProduct.gstRatePercent || 18,
        stockCount: Number(newProduct.stockCount) || 10,
        price: Number(newProduct.price),
        mrp: Number(newProduct.mrp) || Number(newProduct.price),
        minStockAlert: Number(newProduct.minStockAlert) || 5,
        inStock: true,
        status: (Number(newProduct.stockCount) || 10) > 5 ? 'IN_STOCK' : 'LOW_STOCK',
        imageUrl:
          newProduct.imageUrl ||
          'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=300&auto=format&fit=crop&q=80',
        tags: [newProduct.category || 'General', newProduct.brand || 'QCOM'],
        specs: {},
      } as any);

      setProducts(prev => [created.data, ...prev]);
      setIsAddOpen(false);
      showToast('Catalog Added', `Added ${newProduct.name} to merchant master catalog.`, 'success');
    } catch {
      showToast('Error', 'Failed to create new catalog item.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Add SKU action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Catalog & Master Listings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store's item definitions, selling prices, MRP, discounts, and customer-facing listing status.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New SKU</span>
        </Button>
      </div>

      {/* Catalog Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total SKUs in Catalog</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">{stats.total}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Master product records</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active on QCOM Marketplace</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">{stats.active}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Live & searchable by customers</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Delisted / Inactive SKUs</span>
          <p className="text-2xl font-bold font-mono text-slate-600 mt-1.5">{stats.inactive}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Hidden from store page</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average Customer Discount</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
            {stats.avgMargin.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Off MRP pricing</p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU, brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Listing Status Toggle Filter */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
            <button
              onClick={() => setListingStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                listingStatusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setListingStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                listingStatusFilter === 'ACTIVE'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => setListingStatusFilter('INACTIVE')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                listingStatusFilter === 'INACTIVE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delisted
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
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
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Products Table / Mobile Card Layout */}
      {isLoading ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading catalog master...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <EmptyState
            icon={<Package className="w-8 h-8 text-slate-400" />}
            title="No catalog items found"
            description="No products matched your search or category filter criteria."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setCategoryFilter('ALL');
              setListingStatusFilter('ALL');
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
                  <th className="py-3 px-4">Product & Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU / HSN</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">MRP & Discount</th>
                  <th className="py-3 px-4 text-center">Tax Slab</th>
                  <th className="py-3 px-4 text-center">Marketplace Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const discountPct = p.mrp > p.price ? (((p.mrp - p.price) / p.mrp) * 100).toFixed(0) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Product Name & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=100'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">{p.brand} · {p.unit}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {p.category}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.subcategory}</p>
                      </td>

                      {/* SKU / HSN */}
                      <td className="py-3.5 px-4 font-mono">
                        <p className="text-slate-800 font-medium">{p.sku}</p>
                        <p className="text-[10px] text-slate-400">HSN: {p.hsnCode || '8536'}</p>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="font-bold text-slate-900 text-sm">₹{p.price.toLocaleString()}</span>
                      </td>

                      {/* MRP & Discount */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="text-slate-400 line-through text-xs">₹{p.mrp.toLocaleString()}</span>
                        {Number(discountPct) > 0 && (
                          <span className="ml-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {discountPct}% OFF
                          </span>
                        )}
                      </td>

                      {/* Tax Slab */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                          {p.gstRatePercent || 18}% GST
                        </span>
                      </td>

                      {/* Marketplace Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={e => handleToggleListingStatus(p, e)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Click to toggle marketplace listing"
                        >
                          {p.inStock ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Listed</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Delisted</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredProducts.map(p => {
              const discountPct = p.mrp > p.price ? (((p.mrp - p.price) / p.mrp) * 100).toFixed(0) : 0;
              return (
                <div key={p.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=100'}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.brand} · {p.category}</p>
                        <p className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</p>
                      </div>
                    </div>

                    <button
                      onClick={e => handleToggleListingStatus(p, e)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        p.inStock
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {p.inStock ? 'Listed' : 'Delisted'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-sm font-bold text-slate-900">₹{p.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{p.mrp}</span>
                      {Number(discountPct) > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                          {discountPct}% off
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Catalog Product"
        subtitle={editingProduct?.name || ''}
        maxWidth="md"
      >
        {editingProduct && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Product Title</label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Brand</label>
                <input
                  type="text"
                  value={editingProduct.brand}
                  onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Selling Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">MRP (₹)</label>
                <input
                  type="number"
                  value={editingProduct.mrp}
                  onChange={e => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">GST Slab (%)</label>
                <select
                  value={editingProduct.gstRatePercent || 18}
                  onChange={e => setEditingProduct({ ...editingProduct, gstRatePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Product Description</label>
              <textarea
                value={editingProduct.description || ''}
                onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADD NEW PRODUCT MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New SKU to Catalog"
        subtitle="Create master product listing for your store"
        maxWidth="md"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Product Title *</label>
            <input
              type="text"
              placeholder="e.g. Havells 2.5 sq mm Copper Wire 90m"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Brand *</label>
              <input
                type="text"
                placeholder="e.g. Havells / Bosch"
                value={newProduct.brand}
                onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="Electricals">Electricals</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Hardware & Tools">Hardware & Tools</option>
                <option value="Paints & Adhesives">Paints & Adhesives</option>
                <option value="Fasteners">Fasteners</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Selling Price (₹) *</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">MRP (₹) *</label>
              <input
                type="number"
                value={newProduct.mrp}
                onChange={e => setNewProduct({ ...newProduct, mrp: Number(e.target.value) })}
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Initial Stock</label>
              <input
                type="number"
                value={newProduct.stockCount}
                onChange={e => setNewProduct({ ...newProduct, stockCount: Number(e.target.value) })}
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Bin / Bay Location</label>
              <input
                type="text"
                placeholder="e.g. Bay C-04"
                value={newProduct.binLocation}
                onChange={e => setNewProduct({ ...newProduct, binLocation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Unit of Measure</label>
              <input
                type="text"
                placeholder="e.g. pc, box, coil"
                value={newProduct.unit}
                onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Create Catalog Listing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
