import { SellerReturnOrder, ReturnStatus, ApiResponse } from '../types/seller';
import { catalogService } from './catalogService';

const simulateDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const INITIAL_RETURNS: SellerReturnOrder[] = [
  {
    id: 'ret-01',
    returnNumber: 'RET-8921',
    originalOrderId: 'ord-101',
    originalOrderNumber: 'Q10482',
    customerName: 'Rajesh M. (Site Electrician)',
    customerPhone: '+91 98450 91823',
    requestedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: 'requested',
    totalRefundAmount: 180,
    reasonCategory: 'WRONG_ITEM',
    reasonDescription: 'Wrong switch variant ordered by mistake.',
    customerReasonNote: '“Bhaiya, electrician mistakenly told me to order 1-way switches, but we needed 2-way staircase switches for the duplex staircase. The box is completely sealed and unopened with original plastic film intact. Please replace or refund so I can order the 2-way switch.”',
    customerPhotos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    ],
    inspectionPhotos: [],
    restocked: false,
    pickupRider: {
      name: 'Ravi Teja (EV Cargo)',
      phone: '+91 98450 99123',
      vehicle: 'Ather 450X · KA-01-EQ-9102',
      etaMinutes: 8,
    },
    items: [
      {
        productId: 'prod-01',
        productName: 'Anchor Roma 6A 1-Way Modular Switch (White)',
        quantity: 1,
        price: 180,
        refundAmount: 180,
        reason: 'Duplex staircase requires 2-way variant',
        condition: 'UNOPENED',
        sku: 'ANC-ROM-6A-1W',
        binLocation: 'Aisle 2 · Bin E-04',
        customerPhotos: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
        ],
      },
    ],
  },
  {
    id: 'ret-02',
    returnNumber: 'RET-8919',
    originalOrderId: 'ord-104',
    originalOrderNumber: 'Q10476',
    customerName: 'Vikram Patel (Flat Owner)',
    customerPhone: '+91 98860 12044',
    requestedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'pending_inspection',
    totalRefundAmount: 2450,
    reasonCategory: 'NOT_NEEDED',
    reasonDescription: 'Surplus unopened coil from apartment wiring project.',
    customerReasonNote: '“Our contractor gave estimate of 3 wire coils for 3BHK false ceiling, but entire wiring finished in 2 coils. This 3rd Polycab 90m coil is 100% untouched with factory holographic seal. Rider has picked up and handed to store.”',
    customerPhotos: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    ],
    inspectionPhotos: [],
    restocked: false,
    pickupRider: {
      name: 'Santosh Gowda',
      phone: '+91 97410 88211',
      vehicle: 'Tata Ace Electric · KA-05-AB-4412',
      etaMinutes: 14,
    },
    items: [
      {
        productId: 'prod-03',
        productName: 'Polycab 2.5 sq mm Flame Retardant Wire (Red, 90m)',
        quantity: 1,
        price: 2450,
        refundAmount: 2450,
        reason: 'Surplus coil not required on site',
        condition: 'UNOPENED',
        sku: 'POL-FR-25-RD-90M',
        binLocation: 'Aisle 3 · Bin B-12',
        customerPhotos: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        ],
      },
    ],
  },
  {
    id: 'ret-03',
    returnNumber: 'RET-8894',
    originalOrderId: 'ord-102',
    originalOrderNumber: 'Q10461',
    customerName: 'Karthik S. (Plumbing Contractor)',
    customerPhone: '+91 99010 33411',
    requestedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: 'approved',
    totalRefundAmount: 380,
    reasonCategory: 'DAMAGED',
    reasonDescription: 'Hairline fracture on valve thread casting.',
    customerReasonNote: '“Sir, during pressure testing of the 1-inch CPVC mainline on 2nd floor, water started spraying from the brass thread collar. Upon inspection found a micro hairline crack in the molding. Attached close-up photo showing water leakage.”',
    customerPhotos: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    ],
    inspectionPhotos: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    ],
    resolutionNote: 'Written off due to transit fracture / manufacturing defect. Refund credited to buyer UPI.',
    restocked: false,
    items: [
      {
        productId: 'prod-08',
        productName: 'Finolex 1-inch CPVC Ball Valve Brass Thread',
        quantity: 1,
        price: 380,
        refundAmount: 380,
        reason: 'Hairline crack near brass thread joint',
        condition: 'DAMAGED',
        sku: 'FIN-CPVC-BV-1IN',
        binLocation: 'Aisle 1 · Bin D-08',
      },
    ],
  },
  {
    id: 'ret-04',
    returnNumber: 'RET-8872',
    originalOrderId: 'ord-106',
    originalOrderNumber: 'Q10440',
    customerName: 'Suresh Nair',
    customerPhone: '+91 98440 77123',
    requestedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    status: 'restocked',
    totalRefundAmount: 1198,
    reasonCategory: 'RTO_REFUSED',
    reasonDescription: 'RTO due to site locked during courier delivery.',
    customerReasonNote: '“Delivery boy arrived while entire site team was busy unloading cement mixer on ground floor and phone was in vehicle. Rider couldn\'t wait so marked RTO. Sealed box returned intact.”',
    customerPhotos: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    ],
    inspectionPhotos: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    ],
    resolutionNote: 'Restocked 2 units back to Bin C-01. Packaging verified flawless.',
    restocked: true,
    items: [
      {
        productId: 'prod-07',
        productName: 'GM 4-Socket Extension Spike Guard 2m',
        quantity: 2,
        price: 599,
        refundAmount: 1198,
        reason: 'Courier RTO - Site locked',
        condition: 'CUSTOMER_REFUSED',
        sku: 'GM-EXT-4S-2M',
        binLocation: 'Aisle 4 · Bin C-01',
      },
    ],
  },
  {
    id: 'ret-05',
    returnNumber: 'RET-8850',
    originalOrderId: 'ord-107',
    originalOrderNumber: 'Q10412',
    customerName: 'Anil Kumar',
    customerPhone: '+91 97310 55901',
    requestedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'rejected',
    totalRefundAmount: 3299,
    reasonCategory: 'DEFECTIVE',
    reasonDescription: 'Customer claimed missing key, but tamper tape broken.',
    customerReasonNote: '“The drill kit plastic case was open and chuck key was not found inside the side slot. I need the key to tighten 10mm drill bits.”',
    customerPhotos: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    ],
    inspectionPhotos: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    ],
    rejectionReason: 'Tamper tape and serial badge tampered post delivery. Rejection verified by QCOM Merchant Support.',
    restocked: false,
    items: [
      {
        productId: 'prod-05',
        productName: 'Bosch GSB 500W Impact Drill Machine Kit',
        quantity: 1,
        price: 3299,
        refundAmount: 3299,
        reason: 'Customer claims missing chuck key',
        condition: 'DEFECTIVE',
        sku: 'BOS-GSB-500W-KIT',
        binLocation: 'Aisle 5 · High-Value Lock #2',
      },
    ],
  },
];

class ReturnsService {
  private returns: SellerReturnOrder[] = JSON.parse(JSON.stringify(INITIAL_RETURNS));

  async getReturns(status?: ReturnStatus | 'all', search?: string): Promise<ApiResponse<SellerReturnOrder[]>> {
    await simulateDelay(150);
    let list = [...this.returns];

    if (status && status !== 'all') {
      list = list.filter(r => r.status === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        r =>
          r.returnNumber.toLowerCase().includes(q) ||
          r.originalOrderNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.items.some(i => i.productName.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q)))
      );
    }

    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  async getReturnById(id: string): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(100);
    const item = this.returns.find(r => r.id === id || r.returnNumber === id);
    if (!item) {
      throw new Error(`Return order "${id}" not found.`);
    }
    return {
      success: true,
      data: { ...item },
      timestamp: new Date().toISOString(),
    };
  }

  async approveAndRestock(id: string, note?: string): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(250);
    const idx = this.returns.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Return not found');

    const ret = this.returns[idx];

    // Restock all items back into catalog
    for (const item of ret.items) {
      try {
        const prod = await catalogService.getProductById(item.productId);
        if (prod.data) {
          await catalogService.updateStock(item.productId, prod.data.stockCount + item.quantity);
        }
      } catch (err) {
        console.warn(`Could not restock product ${item.productId}:`, err);
      }
    }

    const updated: SellerReturnOrder = {
      ...ret,
      status: 'restocked',
      restocked: true,
      updatedAt: new Date().toISOString(),
      resolutionNote: note || 'Items inspected, verified intact, and restocked to shelf location.',
    };

    this.returns[idx] = updated;

    return {
      success: true,
      data: updated,
      message: `Return #${ret.returnNumber} accepted and items restocked to shelf.`,
      timestamp: new Date().toISOString(),
    };
  }

  async approveAndWriteOff(id: string, note?: string): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(250);
    const idx = this.returns.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Return not found');

    const ret = this.returns[idx];
    const updated: SellerReturnOrder = {
      ...ret,
      status: 'approved',
      restocked: false,
      updatedAt: new Date().toISOString(),
      resolutionNote: note || 'Item damaged/written off. Refund processed to buyer.',
    };

    this.returns[idx] = updated;

    return {
      success: true,
      data: updated,
      message: `Return #${ret.returnNumber} approved for refund (Written Off).`,
      timestamp: new Date().toISOString(),
    };
  }

  async rejectReturn(id: string, reason: string): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(250);
    const idx = this.returns.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Return not found');

    const ret = this.returns[idx];
    const updated: SellerReturnOrder = {
      ...ret,
      status: 'rejected',
      restocked: false,
      updatedAt: new Date().toISOString(),
      rejectionReason: reason,
      resolutionNote: `Return declined: ${reason}`,
    };

    this.returns[idx] = updated;

    return {
      success: true,
      data: updated,
      message: `Return #${ret.returnNumber} rejected. Customer and support notified.`,
      timestamp: new Date().toISOString(),
    };
  }

  async addInspectionPhoto(id: string, photoUrl: string): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(200);
    const idx = this.returns.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Return not found');

    const ret = this.returns[idx];
    const currentPhotos = ret.inspectionPhotos || [];
    const updated: SellerReturnOrder = {
      ...ret,
      inspectionPhotos: [...currentPhotos, photoUrl],
      updatedAt: new Date().toISOString(),
    };

    this.returns[idx] = updated;

    return {
      success: true,
      data: updated,
      message: 'Inspection photo attached successfully.',
      timestamp: new Date().toISOString(),
    };
  }
}

export const returnsService = new ReturnsService();
