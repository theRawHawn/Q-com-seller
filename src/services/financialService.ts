import { SellerEarningsSummary, SellerLedgerEntry, ApiResponse } from '../types/seller';
import { INITIAL_EARNINGS, INITIAL_LEDGER } from './mockData';

const simulateDelay = (ms = 240) => new Promise(resolve => setTimeout(resolve, ms));

class FinancialService {
  private earnings: SellerEarningsSummary = JSON.parse(JSON.stringify(INITIAL_EARNINGS));
  private ledger: SellerLedgerEntry[] = JSON.parse(JSON.stringify(INITIAL_LEDGER));

  async getEarningsSummary(): Promise<ApiResponse<SellerEarningsSummary>> {
    await simulateDelay(220);
    return {
      success: true,
      data: { ...this.earnings },
      timestamp: new Date().toISOString(),
    };
  }

  async getLedgerEntries(): Promise<ApiResponse<SellerLedgerEntry[]>> {
    await simulateDelay(250);
    return {
      success: true,
      data: [...this.ledger],
      timestamp: new Date().toISOString(),
    };
  }

  async requestInstantSettlement(): Promise<ApiResponse<{ payoutId: string; amount: number; utr: string }>> {
    await simulateDelay(500);
    if (this.earnings.pendingPayableBalance <= 0) {
      throw new Error('No pending balance available for instant settlement.');
    }

    const settledAmount = this.earnings.pendingPayableBalance;
    const utr = `HDFC${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newLedgerEntry: SellerLedgerEntry = {
      id: `led-${Date.now().toString().slice(-4)}`,
      date: 'Today',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'PAYOUT_SETTLED',
      category: 'DEBIT',
      title: 'Instant Payout Dispatched',
      description: `IMPS to registered Bank Account • UTR #${utr}`,
      amount: settledAmount,
      status: 'CLEARED',
      utrNumber: utr,
      payoutMode: 'IMPS',
    };

    this.ledger.unshift(newLedgerEntry);
    this.earnings.settledBalance += settledAmount;
    this.earnings.pendingPayableBalance = 0;

    return {
      success: true,
      data: {
        payoutId: newLedgerEntry.id,
        amount: settledAmount,
        utr,
      },
      message: `Instant payout of ₹${settledAmount.toLocaleString()} dispatched successfully to registered bank account.`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const financialService = new FinancialService();
