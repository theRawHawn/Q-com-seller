import { SellerReturnOrder, ReturnStatus, ApiResponse } from '../types/seller';
import { INITIAL_RETURNS } from './mockData';

const simulateDelay = (ms = 220) => new Promise(resolve => setTimeout(resolve, ms));

class ReturnsService {
  private returns: SellerReturnOrder[] = JSON.parse(JSON.stringify(INITIAL_RETURNS));

  async getReturns(statusFilter?: ReturnStatus | 'ALL', search?: string): Promise<ApiResponse<SellerReturnOrder[]>> {
    await simulateDelay(200);

    let result = [...this.returns];

    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        r =>
          r.returnNumber.toLowerCase().includes(q) ||
          r.orderNumber.toLowerCase().includes(q) ||
          r.customer.name.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.items.some(i => i.productName.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      // Pending inspection first
      if (a.status === 'PENDING_INSPECTION' && b.status !== 'PENDING_INSPECTION') return -1;
      if (b.status === 'PENDING_INSPECTION' && a.status !== 'PENDING_INSPECTION') return 1;
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  async approveReturn(returnId: string, restock: boolean = true): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(300);
    const index = this.returns.findIndex(r => r.id === returnId || r.returnNumber === returnId);
    if (index === -1) {
      throw new Error(`Return #${returnId} not found.`);
    }

    const current = this.returns[index];
    const updated: SellerReturnOrder = {
      ...current,
      status: 'APPROVED_REFUNDED',
      resolvedAt: new Date().toISOString(),
      restockedToInventory: restock,
    };

    this.returns[index] = updated;

    return {
      success: true,
      data: updated,
      message: `Return #${current.returnNumber} approved. Refund of ₹${current.refundTotal} credited to customer.${restock ? ' Stock restored.' : ''}`,
      timestamp: new Date().toISOString(),
    };
  }

  async rejectReturn(returnId: string, reason: string): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(300);
    const index = this.returns.findIndex(r => r.id === returnId || r.returnNumber === returnId);
    if (index === -1) {
      throw new Error(`Return #${returnId} not found.`);
    }

    const current = this.returns[index];
    const updated: SellerReturnOrder = {
      ...current,
      status: 'REJECTED_DISPUTED',
      resolvedAt: new Date().toISOString(),
      detailedNotes: reason,
    };

    this.returns[index] = updated;

    return {
      success: true,
      data: updated,
      message: `Return #${current.returnNumber} rejected with seller dispute comments.`,
      timestamp: new Date().toISOString(),
    };
  }

  async restockReturnItems(returnId: string): Promise<ApiResponse<SellerReturnOrder>> {
    await simulateDelay(250);
    const index = this.returns.findIndex(r => r.id === returnId || r.returnNumber === returnId);
    if (index === -1) {
      throw new Error(`Return #${returnId} not found.`);
    }

    const current = this.returns[index];
    const updated: SellerReturnOrder = {
      ...current,
      restockedToInventory: true,
    };

    this.returns[index] = updated;

    return {
      success: true,
      data: updated,
      message: `Items from Return #${current.returnNumber} restocked into bin locations.`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const returnsService = new ReturnsService();
