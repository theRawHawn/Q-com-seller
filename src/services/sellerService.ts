import { SellerStore, ApiResponse } from '../types/seller';
import { INITIAL_STORES } from './mockData';

// Realistic network latency simulation
const simulateDelay = (ms = 280) => new Promise(resolve => setTimeout(resolve, ms));

class SellerService {
  private stores: SellerStore[] = JSON.parse(JSON.stringify(INITIAL_STORES));

  async getAllStores(): Promise<ApiResponse<SellerStore[]>> {
    await simulateDelay(200);
    return {
      success: true,
      data: [...this.stores],
      timestamp: new Date().toISOString(),
    };
  }

  async getStoreById(storeId: string): Promise<ApiResponse<SellerStore>> {
    await simulateDelay(150);
    const store = this.stores.find(s => s.id === storeId);
    if (!store) {
      throw new Error(`Store with ID "${storeId}" was not found.`);
    }
    return {
      success: true,
      data: { ...store },
      timestamp: new Date().toISOString(),
    };
  }

  async toggleStoreOnlineStatus(storeId: string, isOnline: boolean, pauseReason?: string): Promise<ApiResponse<SellerStore>> {
    await simulateDelay(350);
    const storeIndex = this.stores.findIndex(s => s.id === storeId);
    if (storeIndex === -1) {
      throw new Error(`Store with ID "${storeId}" was not found.`);
    }

    const updatedStore = {
      ...this.stores[storeIndex],
      isStoreOnline: isOnline,
      isPaused: !isOnline,
      pauseReason: !isOnline ? (pauseReason || 'Temporarily paused by merchant') : undefined,
    };

    this.stores[storeIndex] = updatedStore;

    return {
      success: true,
      data: updatedStore,
      message: isOnline ? 'Store is now LIVE and accepting orders.' : 'Store paused. New incoming orders paused.',
      timestamp: new Date().toISOString(),
    };
  }

  async updateStoreDetails(storeId: string, partial: Partial<SellerStore>): Promise<ApiResponse<SellerStore>> {
    await simulateDelay(300);
    const storeIndex = this.stores.findIndex(s => s.id === storeId);
    if (storeIndex === -1) {
      throw new Error(`Store with ID "${storeId}" was not found.`);
    }

    const updatedStore = {
      ...this.stores[storeIndex],
      ...partial,
    };

    this.stores[storeIndex] = updatedStore;

    return {
      success: true,
      data: updatedStore,
      message: 'Store operational profile saved successfully.',
      timestamp: new Date().toISOString(),
    };
  }
}

export const sellerService = new SellerService();
