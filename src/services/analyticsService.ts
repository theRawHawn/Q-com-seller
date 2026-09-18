import { SellerAnalyticsMetrics, ApiResponse } from '../types/seller';
import { INITIAL_ANALYTICS } from './mockData';

const simulateDelay = (ms = 220) => new Promise(resolve => setTimeout(resolve, ms));

class AnalyticsService {
  private analytics: SellerAnalyticsMetrics = JSON.parse(JSON.stringify(INITIAL_ANALYTICS));

  async getAnalytics(period: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY'): Promise<ApiResponse<SellerAnalyticsMetrics>> {
    await simulateDelay(220);
    // Period adjustments if needed in real analytics
    return {
      success: true,
      data: { ...this.analytics },
      timestamp: new Date().toISOString(),
    };
  }
}

export const analyticsService = new AnalyticsService();
