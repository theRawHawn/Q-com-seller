import { SellerNotification, ApiResponse } from '../types/seller';
import { INITIAL_NOTIFICATIONS } from './mockData';

const simulateDelay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

class NotificationService {
  private notifications: SellerNotification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

  async getNotifications(): Promise<ApiResponse<SellerNotification[]>> {
    await simulateDelay(150);
    return {
      success: true,
      data: [...this.notifications],
      timestamp: new Date().toISOString(),
    };
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    await simulateDelay(100);
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
    return {
      success: true,
      data: undefined,
      timestamp: new Date().toISOString(),
    };
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    await simulateDelay(150);
    this.notifications.forEach(n => {
      n.isRead = true;
    });
    return {
      success: true,
      data: undefined,
      timestamp: new Date().toISOString(),
    };
  }

  async addNotification(notif: Omit<SellerNotification, 'id' | 'timestamp' | 'isRead'>): Promise<ApiResponse<SellerNotification>> {
    const newNotif: SellerNotification = {
      ...notif,
      id: `notif-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      isRead: false,
    };
    this.notifications.unshift(newNotif);
    return {
      success: true,
      data: newNotif,
      timestamp: new Date().toISOString(),
    };
  }
}

export const notificationService = new NotificationService();
