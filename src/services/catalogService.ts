import { SellerProduct, ProductStockStatus, ApiResponse } from '../types/seller';
import { INITIAL_SELLER_PRODUCTS } from './mockData';

const simulateDelay = (ms = 220) => new Promise(resolve => setTimeout(resolve, ms));

class CatalogService {
  private products: SellerProduct[] = JSON.parse(JSON.stringify(INITIAL_SELLER_PRODUCTS));

  async getProducts(category?: string, status?: ProductStockStatus | 'ALL', search?: string): Promise<ApiResponse<SellerProduct[]>> {
    await simulateDelay(200);

    let result = [...this.products];

    if (category && category !== 'ALL') {
      result = result.filter(p => p.category === category);
    }

    if (status && status !== 'ALL') {
      result = result.filter(p => p.status === status);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.binLocation.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Default sorting: low stock & out of stock first, then alphabetically
    result.sort((a, b) => {
      const rank = (p: SellerProduct) => (p.status === 'OUT_OF_STOCK' ? 0 : p.status === 'LOW_STOCK' ? 1 : 2);
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return a.name.localeCompare(b.name);
    });

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  async getProductById(productId: string): Promise<ApiResponse<SellerProduct>> {
    await simulateDelay(150);
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product "${productId}" not found.`);
    }
    return {
      success: true,
      data: { ...product },
      timestamp: new Date().toISOString(),
    };
  }

  async updateStock(productId: string, newCount: number): Promise<ApiResponse<SellerProduct>> {
    await simulateDelay(250);
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error(`Product "${productId}" not found.`);
    }

    const current = this.products[index];
    const safeCount = Math.max(0, newCount);

    let status: ProductStockStatus = 'IN_STOCK';
    let inStock = true;

    if (safeCount === 0) {
      status = 'OUT_OF_STOCK';
      inStock = false;
    } else if (safeCount <= current.minStockAlert) {
      status = 'LOW_STOCK';
      inStock = true;
    }

    const updatedProduct: SellerProduct = {
      ...current,
      stockCount: safeCount,
      inStock,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.products[index] = updatedProduct;

    return {
      success: true,
      data: updatedProduct,
      message: `Stock updated to ${safeCount} ${current.unit}(s).`,
      timestamp: new Date().toISOString(),
    };
  }

  async toggleProductAvailability(productId: string, inStock: boolean): Promise<ApiResponse<SellerProduct>> {
    await simulateDelay(220);
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error(`Product "${productId}" not found.`);
    }

    const current = this.products[index];
    const updatedProduct: SellerProduct = {
      ...current,
      inStock,
      status: inStock ? (current.stockCount <= current.minStockAlert ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
      updatedAt: new Date().toISOString(),
    };

    this.products[index] = updatedProduct;

    return {
      success: true,
      data: updatedProduct,
      message: inStock ? 'Product enabled for sale.' : 'Product marked unavailable.',
      timestamp: new Date().toISOString(),
    };
  }

  async updateProduct(productId: string, updates: Partial<SellerProduct>): Promise<ApiResponse<SellerProduct>> {
    await simulateDelay(300);
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error(`Product "${productId}" not found.`);
    }

    const current = this.products[index];
    const updatedProduct: SellerProduct = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.products[index] = updatedProduct;

    return {
      success: true,
      data: updatedProduct,
      message: 'Product catalog entry updated successfully.',
      timestamp: new Date().toISOString(),
    };
  }

  async addProduct(data: Omit<SellerProduct, 'id' | 'updatedAt' | 'rating' | 'reviewsCount'>): Promise<ApiResponse<SellerProduct>> {
    await simulateDelay(350);
    const id = `prod-${Date.now().toString().slice(-4)}`;
    const newProduct: SellerProduct = {
      ...data,
      id,
      rating: 5.0,
      reviewsCount: 1,
      updatedAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);

    return {
      success: true,
      data: newProduct,
      message: `Product "${newProduct.name}" added to catalog.`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const catalogService = new CatalogService();
