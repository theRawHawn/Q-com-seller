import { SellerOrder, OrderStatus, ApiResponse } from '../types/seller';
import { INITIAL_ORDERS } from './mockData';

const simulateDelay = (ms = 260) => new Promise(resolve => setTimeout(resolve, ms));

class OrderService {
  private orders: SellerOrder[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));

  async getOrders(filterStatus?: OrderStatus | 'all', search?: string): Promise<ApiResponse<SellerOrder[]>> {
    await simulateDelay(220);

    let result = [...this.orders];

    if (filterStatus && filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        order =>
          order.orderNumber.toLowerCase().includes(q) ||
          order.id.toLowerCase().includes(q) ||
          order.customer.name.toLowerCase().includes(q) ||
          order.jobSite.address.toLowerCase().includes(q) ||
          order.items.some(item => item.productName.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q))
      );
    }

    // Sort: placed and active orders first, then newest placedAt
    result.sort((a, b) => {
      const statusWeight: Record<OrderStatus, number> = {
        placed: 5,
        picking: 4,
        packed: 3,
        out_for_delivery: 2,
        arriving: 2,
        delivered: 1,
        cancelled: 0,
      };
      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return statusWeight[b.status] - statusWeight[a.status];
      }
      return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
    });

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  async getOrderById(orderId: string): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(180);
    const order = this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new Error(`Order #${orderId} was not found.`);
    }
    return {
      success: true,
      data: { ...order },
      timestamp: new Date().toISOString(),
    };
  }

  async acceptOrder(orderId: string): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(350);
    const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    const order = this.orders[orderIndex];
    if (order.status !== 'placed') {
      throw new Error(`Order #${order.orderNumber} is already in state "${order.status}".`);
    }

    const updatedOrder: SellerOrder = {
      ...order,
      status: 'picking',
      preparationStartTime: new Date().toISOString(),
      slaTargetMinutes: order.slaTargetMinutes || 3,
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      message: `Order #${order.orderNumber} accepted. Preparing order items.`,
      timestamp: new Date().toISOString(),
    };
  }

  async toggleItemPacked(orderId: string, productId: string, isPacked: boolean): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(140);
    const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    const order = this.orders[orderIndex];
    const updatedItems = order.items.map(item => {
      if (item.productId === productId) {
        return { ...item, isPacked };
      }
      return item;
    });

    const updatedOrder: SellerOrder = {
      ...order,
      items: updatedItems,
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      timestamp: new Date().toISOString(),
    };
  }

  async markOrderReady(orderId: string): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(350);
    const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    const order = this.orders[orderIndex];
    const updatedOrder: SellerOrder = {
      ...order,
      status: 'packed',
      packedTime: new Date().toISOString(),
      // Mark all items packed if not already
      items: order.items.map(i => ({ ...i, isPacked: true })),
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      message: `Order #${order.orderNumber} is packed and ready for EV Rider handover!`,
      timestamp: new Date().toISOString(),
    };
  }

  async markOrderHandedOver(orderId: string): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(300);
    const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    const order = this.orders[orderIndex];
    const updatedOrder: SellerOrder = {
      ...order,
      status: 'out_for_delivery',
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      message: `Order #${order.orderNumber} handed over to rider ${order.rider?.name || 'EV Courier'}.`,
      timestamp: new Date().toISOString(),
    };
  }

  async markOrderArriving(orderId: string): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(300);
    const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    const order = this.orders[orderIndex];
    const updatedOrder: SellerOrder = {
      ...order,
      status: 'arriving',
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      message: `Rider ${order.rider?.name || 'EV Courier'} is arriving at customer destination for order #${order.orderNumber}.`,
      timestamp: new Date().toISOString(),
    };
  }

  async markOrderDelivered(orderId: string): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(300);
    const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    const order = this.orders[orderIndex];
    const updatedOrder: SellerOrder = {
      ...order,
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      message: `Order #${order.orderNumber} delivered successfully to customer!`,
      timestamp: new Date().toISOString(),
    };
  }

  async rejectOrder(orderId: string, reason: string): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(400);
    const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    const order = this.orders[orderIndex];
    const updatedOrder: SellerOrder = {
      ...order,
      status: 'cancelled',
      cancellationReason: reason || 'Item temporarily unavailable in store bay',
      cancelledAt: new Date().toISOString(),
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      message: `Order #${order.orderNumber} was rejected and cancelled.`,
      timestamp: new Date().toISOString(),
    };
  }

  async createSimulatedOrder(): Promise<ApiResponse<SellerOrder>> {
    await simulateDelay(300);
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newOrder: SellerOrder = {
      id: `ORD-2026-${randomSuffix}`,
      orderNumber: `Q-${randomSuffix}`,
      status: 'placed',
      placedAt: new Date().toISOString(),
      estimatedDeliveryAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
      subtotal: 330,
      tax: 59.4,
      deliveryFee: 0,
      handlingFee: 15,
      total: 404.4,
      sellerEarnings: 275.55,
      commissionAmount: 49.5,
      commissionRatePercent: 15.0,
      tdsAmount: 3.30,
      tcsAmount: 1.65,
      items: [
        {
          productId: 'prod-04',
          productName: 'Havells 16A Single Pole C-Curve MCB',
          brand: 'Havells Euro-X',
          category: 'Electrical & Lighting',
          unit: 'Piece',
          price: 165,
          mrp: 225,
          quantity: 2,
          binLocation: 'Aisle E1 • Shelf 03',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=80',
          isPacked: false,
          hsnCode: '8536.20.30',
          gstRatePercent: 18,
        },
      ],
      customer: {
        name: 'Arun V.',
        phone: '+91 98XXX-XX209',
        maskedPhone: '+91 98XXX-XX209 (Masked via QCOM IVR)',
        isMasked: true,
        virtualProxyNumber: '080-4890-7719',
        accountType: 'contractor',
        businessName: 'Apex Renovations',
        gstin: '29AABCA7720B1ZP',
      },
      jobSite: {
        address: '80 Feet Rd Sector, Koramangala 6th Block (Zone 4)',
        deliveryLocality: 'Koramangala 6th Block',
        landmark: 'Near Maharaja Signal',
        floorUnit: 'Dispatch Bay',
        siteContactName: 'Arun V.',
        sitePhone: '+91 98XXX-XX209',
        tradeType: 'Contractor',
        coordinates: { lat: 12.937, lng: 77.621 },
      },
      rider: {
        id: 'rider-01',
        name: 'Anil Kumar',
        phone: '+91 98450 99812',
        vehicle: 'Bajaj Chetak EV (#KA-01-EV-4210)',
        rating: 4.95,
        etaMinutes: 5,
        distanceMeters: 800,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      },
      deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: 'Instant UPI',
      paymentStatus: 'PAID',
      clientInvoiceNeeded: true,
      notes: ['Urgent dispatch requested.'],
    };

    this.orders.unshift(newOrder);

    return {
      success: true,
      data: newOrder,
      message: `🔔 New Order #${newOrder.orderNumber} received!`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const orderService = new OrderService();
