import { SellerAnalyticsMetrics, AnalyticsPeriod, ApiResponse } from '../types/seller';
import { INITIAL_EARNINGS } from './mockData';

const simulateDelay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

export function getSellerAnalyticsData(
  period: AnalyticsPeriod = 'TODAY',
  customStartDate = '2026-09-01',
  customEndDate = '2026-09-18'
): SellerAnalyticsMetrics {
  // Statutory Deductions:
  // - TDS u/s 194-O (Income Tax): 1% on net taxable base (excluding 18% GST)
  // - TCS under GST (Sec 52): 0.5% on net taxable base (excluding 18% GST)
  const computeStatutoryTaxes = (gross: number, commission: number) => {
    const netTaxableBase = gross / 1.18;
    const tds = +(netTaxableBase * 0.01).toFixed(1); // 1% on net taxable base
    const tcs = +(netTaxableBase * 0.005).toFixed(1); // 0.5% on net taxable base
    const totalTax = +(tds + tcs).toFixed(1);
    const netProfit = +(gross - commission).toFixed(1);
    const netPayoutAfterTdsTcs = +(gross - commission - totalTax).toFixed(1);
    return { tds, tcs, totalTax, netProfit, netPayoutAfterTdsTcs };
  };

  if (period === 'TODAY') {
    const grossSales = INITIAL_EARNINGS.todaySales; // 3106
    const totalOrders = INITIAL_EARNINGS.todayOrders; // 5
    const totalDelivered = 4;
    const totalCanceled = 1;
    const commissionFee = +(grossSales * 0.15).toFixed(1); // 465.9
    const { tds, tcs, totalTax, netProfit, netPayoutAfterTdsTcs } = computeStatutoryTaxes(grossSales, commissionFee);
    const averageOrderValue = Math.round(grossSales / totalOrders); // 621

    return {
      period: 'TODAY',
      periodLabel: 'Today',
      dateRangeText: '19 Sep 2026 (Live)',
      totalOrders,
      totalOrdersGrowthPercent: 14.8,
      totalDelivered,
      totalDeliveredGrowthPercent: 12.5,
      totalCanceled,
      totalCanceledPercent: 1.8,
      totalRevenue: grossSales,
      totalRevenueGrowthPercent: 14.8,
      grossSales,
      commissionFee,
      netProfit,
      tdsAmount: tds,
      tcsAmount: tcs,
      totalTaxDeductions: totalTax,
      netPayoutAfterTdsTcs,
      marginPercent: 84.4,
      averageOrderValue,
      gauges: {
        totalOrderCompletion: 80, // 4/5 = 80%
        customerGrowth: 18,
        revenueTargetAchieved: 62, // vs ₹5000 daily quota
      },
      weeklyOrderTrend: [
        { day: '8 AM', fullDate: 'Today 8:00 AM', orders: 1, sales: 505 },
        { day: '10 AM', fullDate: 'Today 10:00 AM', orders: 1, sales: 1258 },
        { day: '12 PM', fullDate: 'Today 12:00 PM', orders: 1, sales: 480 },
        { day: '2 PM', fullDate: 'Today 2:00 PM', orders: 1, sales: 678 },
        { day: '4 PM', fullDate: 'Today 4:00 PM', orders: 0, sales: 0 },
        { day: '6 PM', fullDate: 'Today 6:00 PM', orders: 1, sales: 185 },
        { day: '8 PM', fullDate: 'Today 8:00 PM', orders: 0, sales: 0 },
      ],
      orderTrendTitle: 'Today Hourly Orders',
      orderTrendSubtitle: 'Live intraday order volume & throughput',
      revenueComparison: [
        { month: '8 AM', currentYear: 505, previousYear: 320 },
        { month: '10 AM', currentYear: 1258, previousYear: 890 },
        { month: '12 PM', currentYear: 480, previousYear: 610 },
        { month: '2 PM', currentYear: 678, previousYear: 450 },
        { month: '4 PM', currentYear: 0, previousYear: 280 },
        { month: '6 PM', currentYear: 185, previousYear: 155 },
        { month: '8 PM', currentYear: 0, previousYear: 0 },
      ],
      revenueCurrentLabel: 'Today (19 Sep)',
      revenuePreviousLabel: 'Yesterday (18 Sep)',
      customerMapDistribution: [
        { day: '8 AM', instantOrders: 1, scheduledOrders: 0 },
        { day: '10 AM', instantOrders: 1, scheduledOrders: 0 },
        { day: '12 PM', instantOrders: 1, scheduledOrders: 0 },
        { day: '2 PM', instantOrders: 1, scheduledOrders: 0 },
        { day: '4 PM', instantOrders: 0, scheduledOrders: 0 },
        { day: '6 PM', instantOrders: 0, scheduledOrders: 1 },
        { day: '8 PM', instantOrders: 0, scheduledOrders: 0 },
      ],
      slaAdherencePercent: 98.4,
      avgPreparationMinutes: 4.2,
      cancellationRatePercent: 0.4,
      topProducts: [
        {
          id: 'PLM-ANG-01',
          name: 'Ceramic Disc Brass Angle Valve 1/2" Chrome',
          unitsSold: 28,
          revenue: 7980,
          badge: 'High Velocity',
        },
        {
          id: 'PLM-TEF-03',
          name: 'SealLock High-Density Teflon PTFE Tape (Pack of 3)',
          unitsSold: 42,
          revenue: 1890,
          badge: 'High Velocity',
        },
        {
          id: 'ELE-WIR-02',
          name: 'Polycab Optima 2.5 sq mm FR PVC Wire (90m Box)',
          unitsSold: 12,
          revenue: 25800,
          badge: 'High Velocity',
        },
        {
          id: 'PTL-GRN-01',
          name: 'Bosch GWS 600 Professional Angle Grinder (100mm)',
          unitsSold: 8,
          revenue: 19600,
          badge: 'High Velocity',
        },
      ],
    };
  }

  if (period === 'WEEK') {
    const grossSales = 24850;
    const totalOrders = 38;
    const totalDelivered = 36;
    const totalCanceled = 2;
    const commissionFee = +(grossSales * 0.15).toFixed(1); // 3727.5
    const { tds, tcs, totalTax, netProfit, netPayoutAfterTdsTcs } = computeStatutoryTaxes(grossSales, commissionFee);
    const averageOrderValue = Math.round(grossSales / totalOrders); // 654

    return {
      period: 'WEEK',
      periodLabel: 'Last Week',
      dateRangeText: '12 Sep - 19 Sep 2026',
      totalOrders,
      totalOrdersGrowthPercent: 8.4,
      totalDelivered,
      totalDeliveredGrowthPercent: 7.8,
      totalCanceled,
      totalCanceledPercent: 1.2,
      totalRevenue: grossSales,
      totalRevenueGrowthPercent: 11.2,
      grossSales,
      commissionFee,
      netProfit,
      tdsAmount: tds,
      tcsAmount: tcs,
      totalTaxDeductions: totalTax,
      netPayoutAfterTdsTcs,
      marginPercent: 84.4,
      averageOrderValue,
      gauges: {
        totalOrderCompletion: 95, // 36/38 = 94.7%
        customerGrowth: 22,
        revenueTargetAchieved: 71, // vs ₹35000 weekly quota
      },
      weeklyOrderTrend: [
        { day: 'Sunday', fullDate: '13 Sep', orders: 4, sales: 2800 },
        { day: 'Monday', fullDate: '14 Sep', orders: 6, sales: 3920 },
        { day: 'Tuesday', fullDate: '15 Sep', orders: 5, sales: 3450 },
        { day: 'Wednesday', fullDate: '16 Sep', orders: 8, sales: 5410 },
        { day: 'Thursday', fullDate: '17 Sep', orders: 6, sales: 3890 },
        { day: 'Friday', fullDate: '18 Sep', orders: 4, sales: 2480 },
        { day: 'Saturday', fullDate: '19 Sep', orders: 5, sales: 2900 },
      ],
      orderTrendTitle: 'Daily Order Velocity',
      orderTrendSubtitle: 'Daily completed order volume across past 7 days',
      revenueComparison: [
        { month: 'Sun', currentYear: 2800, previousYear: 2100 },
        { month: 'Mon', currentYear: 3920, previousYear: 3200 },
        { month: 'Tue', currentYear: 3450, previousYear: 2900 },
        { month: 'Wed', currentYear: 5410, previousYear: 4100 },
        { month: 'Thu', currentYear: 3890, previousYear: 3300 },
        { month: 'Fri', currentYear: 2480, previousYear: 2200 },
        { month: 'Sat', currentYear: 2900, previousYear: 2600 },
      ],
      revenueCurrentLabel: 'This Week (12-19 Sep)',
      revenuePreviousLabel: 'Prior Week (05-11 Sep)',
      customerMapDistribution: [
        { day: 'Sun', instantOrders: 3, scheduledOrders: 1 },
        { day: 'Mon', instantOrders: 5, scheduledOrders: 1 },
        { day: 'Tue', instantOrders: 4, scheduledOrders: 1 },
        { day: 'Wed', instantOrders: 6, scheduledOrders: 2 },
        { day: 'Thu', instantOrders: 5, scheduledOrders: 1 },
        { day: 'Fri', instantOrders: 3, scheduledOrders: 1 },
        { day: 'Sat', instantOrders: 4, scheduledOrders: 1 },
      ],
      slaAdherencePercent: 98.6,
      avgPreparationMinutes: 3.8,
      cancellationRatePercent: 0.5,
      topProducts: [
        {
          id: 'PLM-ANG-01',
          name: 'Ceramic Disc Brass Angle Valve 1/2" Chrome',
          unitsSold: 196,
          revenue: 55860,
          badge: 'High Velocity',
        },
        {
          id: 'PLM-TEF-03',
          name: 'SealLock High-Density Teflon PTFE Tape (Pack of 3)',
          unitsSold: 294,
          revenue: 13230,
          badge: 'High Velocity',
        },
        {
          id: 'ELE-WIR-02',
          name: 'Polycab Optima 2.5 sq mm FR PVC Wire (90m Box)',
          unitsSold: 84,
          revenue: 180600,
          badge: 'High Velocity',
        },
        {
          id: 'PTL-GRN-01',
          name: 'Bosch GWS 600 Professional Angle Grinder (100mm)',
          unitsSold: 56,
          revenue: 137200,
          badge: 'High Velocity',
        },
      ],
    };
  }

  if (period === 'MONTH') {
    const grossSales = INITIAL_EARNINGS.monthSales || 64200;
    const totalOrders = 102;
    const totalDelivered = 98;
    const totalCanceled = 4;
    const commissionFee = +(grossSales * 0.15).toFixed(1); // 9630
    const { tds, tcs, totalTax, netProfit, netPayoutAfterTdsTcs } = computeStatutoryTaxes(grossSales, commissionFee);
    const averageOrderValue = Math.round(grossSales / totalOrders); // 629

    return {
      period: 'MONTH',
      periodLabel: 'This Month',
      dateRangeText: '01 Sep - 19 Sep 2026',
      totalOrders,
      totalOrdersGrowthPercent: 14.5,
      totalDelivered,
      totalDeliveredGrowthPercent: 15.2,
      totalCanceled,
      totalCanceledPercent: 1.4,
      totalRevenue: grossSales,
      totalRevenueGrowthPercent: 18.2,
      grossSales,
      commissionFee,
      netProfit,
      tdsAmount: tds,
      tcsAmount: tcs,
      totalTaxDeductions: totalTax,
      netPayoutAfterTdsTcs,
      marginPercent: 84.4,
      averageOrderValue,
      gauges: {
        totalOrderCompletion: 96, // 98/102 = 96.1%
        customerGrowth: 28,
        revenueTargetAchieved: 80, // vs ₹80000 monthly quota
      },
      weeklyOrderTrend: [
        { day: 'Week 1', fullDate: '01-07 Sep', orders: 28, sales: 17800 },
        { day: 'Week 2', fullDate: '08-14 Sep', orders: 36, sales: 22650 },
        { day: 'Week 3', fullDate: '15-21 Sep', orders: 30, sales: 18950 },
        { day: 'Week 4', fullDate: '22-30 Sep', orders: 8, sales: 4800 },
      ],
      orderTrendTitle: 'Monthly Weekly Velocity',
      orderTrendSubtitle: 'Order velocity grouped by calendar week',
      revenueComparison: [
        { month: 'Week 1', currentYear: 17800, previousYear: 14200 },
        { month: 'Week 2', currentYear: 22650, previousYear: 18900 },
        { month: 'Week 3', currentYear: 18950, previousYear: 15600 },
        { month: 'Week 4', currentYear: 4800, previousYear: 4100 },
      ],
      revenueCurrentLabel: 'Sep 2026 (Current)',
      revenuePreviousLabel: 'Aug 2026 (Previous)',
      customerMapDistribution: [
        { day: 'Wk 1', instantOrders: 22, scheduledOrders: 6 },
        { day: 'Wk 2', instantOrders: 28, scheduledOrders: 8 },
        { day: 'Wk 3', instantOrders: 24, scheduledOrders: 6 },
        { day: 'Wk 4', instantOrders: 6, scheduledOrders: 2 },
      ],
      slaAdherencePercent: 98.8,
      avgPreparationMinutes: 3.6,
      cancellationRatePercent: 0.6,
      topProducts: [
        {
          id: 'PLM-ANG-01',
          name: 'Ceramic Disc Brass Angle Valve 1/2" Chrome',
          unitsSold: 672,
          revenue: 191520,
          badge: 'High Velocity',
        },
        {
          id: 'PLM-TEF-03',
          name: 'SealLock High-Density Teflon PTFE Tape (Pack of 3)',
          unitsSold: 1008,
          revenue: 45360,
          badge: 'High Velocity',
        },
        {
          id: 'ELE-WIR-02',
          name: 'Polycab Optima 2.5 sq mm FR PVC Wire (90m Box)',
          unitsSold: 288,
          revenue: 619200,
          badge: 'High Velocity',
        },
        {
          id: 'PTL-GRN-01',
          name: 'Bosch GWS 600 Professional Angle Grinder (100mm)',
          unitsSold: 192,
          revenue: 470400,
          badge: 'High Velocity',
        },
      ],
    };
  }

  if (period === 'YEAR') {
    const grossSales = INITIAL_EARNINGS.totalLifetimeSales || 486250;
    const totalOrders = 780;
    const totalDelivered = 762;
    const totalCanceled = 18;
    const commissionFee = +(grossSales * 0.15).toFixed(1); // 72937.5
    const { tds, tcs, totalTax, netProfit, netPayoutAfterTdsTcs } = computeStatutoryTaxes(grossSales, commissionFee);
    const averageOrderValue = Math.round(grossSales / totalOrders); // 623

    return {
      period: 'YEAR',
      periodLabel: 'This Year',
      dateRangeText: 'Jan - Dec 2026 (YTD)',
      totalOrders,
      totalOrdersGrowthPercent: 26.4,
      totalDelivered,
      totalDeliveredGrowthPercent: 27.1,
      totalCanceled,
      totalCanceledPercent: 0.9,
      totalRevenue: grossSales,
      totalRevenueGrowthPercent: 31.8,
      grossSales,
      commissionFee,
      netProfit,
      tdsAmount: tds,
      tcsAmount: tcs,
      totalTaxDeductions: totalTax,
      netPayoutAfterTdsTcs,
      marginPercent: 84.4,
      averageOrderValue,
      gauges: {
        totalOrderCompletion: 98, // 762/780 = 97.7%
        customerGrowth: 34,
        revenueTargetAchieved: 88, // vs ₹550000 annual quota
      },
      weeklyOrderTrend: [
        { day: 'Jan', fullDate: 'Jan 2026', orders: 52, sales: 32400 },
        { day: 'Feb', fullDate: 'Feb 2026', orders: 58, sales: 36100 },
        { day: 'Mar', fullDate: 'Mar 2026', orders: 64, sales: 39800 },
        { day: 'Apr', fullDate: 'Apr 2026', orders: 60, sales: 37500 },
        { day: 'May', fullDate: 'May 2026', orders: 68, sales: 42400 },
        { day: 'Jun', fullDate: 'Jun 2026', orders: 78, sales: 48600 },
        { day: 'Jul', fullDate: 'Jul 2026', orders: 72, sales: 44900 },
        { day: 'Aug', fullDate: 'Aug 2026', orders: 76, sales: 47300 },
        { day: 'Sep', fullDate: 'Sep 2026', orders: 70, sales: 43700 },
        { day: 'Oct', fullDate: 'Oct 2026', orders: 62, sales: 38700 },
        { day: 'Nov', fullDate: 'Nov 2026', orders: 60, sales: 37450 },
        { day: 'Dec', fullDate: 'Dec 2026', orders: 60, sales: 37400 },
      ],
      orderTrendTitle: 'Annual Monthly Volume',
      orderTrendSubtitle: 'Monthly order throughput across the full year',
      revenueComparison: [
        { month: 'Jan', currentYear: 32400, previousYear: 24000 },
        { month: 'Feb', currentYear: 36100, previousYear: 27000 },
        { month: 'Mar', currentYear: 39800, previousYear: 29500 },
        { month: 'Apr', currentYear: 37500, previousYear: 28000 },
        { month: 'May', currentYear: 42400, previousYear: 31500 },
        { month: 'Jun', currentYear: 48600, previousYear: 35000 },
        { month: 'Jul', currentYear: 44900, previousYear: 33500 },
        { month: 'Aug', currentYear: 47300, previousYear: 36000 },
        { month: 'Sep', currentYear: 43700, previousYear: 32000 },
        { month: 'Oct', currentYear: 38700, previousYear: 29000 },
        { month: 'Nov', currentYear: 37450, previousYear: 28500 },
        { month: 'Dec', currentYear: 37400, previousYear: 28000 },
      ],
      revenueCurrentLabel: '2026 (Current)',
      revenuePreviousLabel: '2025 (Previous)',
      customerMapDistribution: [
        { day: 'Q1', instantOrders: 130, scheduledOrders: 44 },
        { day: 'Q2', instantOrders: 155, scheduledOrders: 51 },
        { day: 'Q3', instantOrders: 162, scheduledOrders: 56 },
        { day: 'Q4', instantOrders: 135, scheduledOrders: 47 },
      ],
      slaAdherencePercent: 99.2,
      avgPreparationMinutes: 3.4,
      cancellationRatePercent: 0.8,
      topProducts: [
        {
          id: 'PLM-ANG-01',
          name: 'Ceramic Disc Brass Angle Valve 1/2" Chrome',
          unitsSold: 5040,
          revenue: 1436400,
          badge: 'High Velocity',
        },
        {
          id: 'PLM-TEF-03',
          name: 'SealLock High-Density Teflon PTFE Tape (Pack of 3)',
          unitsSold: 7560,
          revenue: 340200,
          badge: 'High Velocity',
        },
        {
          id: 'ELE-WIR-02',
          name: 'Polycab Optima 2.5 sq mm FR PVC Wire (90m Box)',
          unitsSold: 2160,
          revenue: 4644000,
          badge: 'High Velocity',
        },
        {
          id: 'PTL-GRN-01',
          name: 'Bosch GWS 600 Professional Angle Grinder (100mm)',
          unitsSold: 1440,
          revenue: 3528000,
          badge: 'High Velocity',
        },
      ],
    };
  }

  // CUSTOM MANUAL RANGE
  const start = new Date(customStartDate);
  const end = new Date(customEndDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const grossSales = daysCount * 3200;
  const totalOrders = daysCount * 5;
  const totalDelivered = Math.round(totalOrders * 0.96);
  const totalCanceled = totalOrders - totalDelivered;
  const commissionFee = +(grossSales * 0.15).toFixed(1);
  const { tds, tcs, totalTax, netProfit, netPayoutAfterTdsTcs } = computeStatutoryTaxes(grossSales, commissionFee);
  const averageOrderValue = Math.round(grossSales / totalOrders);

  // Generate trend points for the custom range (up to 7 subdivisions)
  const numSteps = Math.min(7, daysCount);
  const stepDays = Math.max(1, Math.floor(daysCount / numSteps));
  const trend = Array.from({ length: numSteps }, (_, i) => {
    const bucketOrders = Math.round(totalOrders / numSteps);
    const bucketSales = Math.round(grossSales / numSteps);
    return {
      day: `D${i * stepDays + 1}`,
      fullDate: `Day ${i * stepDays + 1}-${Math.min(daysCount, (i + 1) * stepDays)}`,
      orders: bucketOrders,
      sales: bucketSales,
    };
  });

  const revComp = Array.from({ length: numSteps }, (_, i) => {
    const bucketSales = Math.round(grossSales / numSteps);
    return {
      month: `P${i + 1}`,
      currentYear: bucketSales,
      previousYear: Math.round(bucketSales * 0.78),
    };
  });

  const custDist = Array.from({ length: numSteps }, (_, i) => {
    const bucketOrders = Math.round(totalOrders / numSteps);
    const inst = Math.round(bucketOrders * 0.75);
    return {
      day: `P${i + 1}`,
      instantOrders: inst,
      scheduledOrders: bucketOrders - inst,
    };
  });

  return {
    period: 'CUSTOM',
    periodLabel: `${daysCount} Days Selected`,
    dateRangeText: `${customStartDate} to ${customEndDate}`,
    totalOrders,
    totalOrdersGrowthPercent: 12.0,
    totalDelivered,
    totalDeliveredGrowthPercent: 11.5,
    totalCanceled,
    totalCanceledPercent: 1.1,
    totalRevenue: grossSales,
    totalRevenueGrowthPercent: 15.0,
    grossSales,
    commissionFee,
    netProfit,
    tdsAmount: tds,
    tcsAmount: tcs,
    totalTaxDeductions: totalTax,
    netPayoutAfterTdsTcs,
    marginPercent: 84.4,
    averageOrderValue,
    gauges: {
      totalOrderCompletion: 96,
      customerGrowth: 24,
      revenueTargetAchieved: 75,
    },
    weeklyOrderTrend: trend,
    orderTrendTitle: 'Selected Range Order Velocity',
    orderTrendSubtitle: `Custom range breakdown over ${daysCount} days`,
    revenueComparison: revComp,
    revenueCurrentLabel: 'Selected Period',
    revenuePreviousLabel: 'Prior Period',
    customerMapDistribution: custDist,
    slaAdherencePercent: 98.5,
    avgPreparationMinutes: 3.9,
    cancellationRatePercent: 0.5,
    topProducts: [
      {
        id: 'PLM-ANG-01',
        name: 'Ceramic Disc Brass Angle Valve 1/2" Chrome',
        unitsSold: 28 * daysCount,
        revenue: 28 * 285 * daysCount,
        badge: 'High Velocity',
      },
      {
        id: 'PLM-TEF-03',
        name: 'SealLock High-Density Teflon PTFE Tape (Pack of 3)',
        unitsSold: 42 * daysCount,
        revenue: 42 * 45 * daysCount,
        badge: 'High Velocity',
      },
      {
        id: 'ELE-WIR-02',
        name: 'Polycab Optima 2.5 sq mm FR PVC Wire (90m Box)',
        unitsSold: 12 * daysCount,
        revenue: 12 * 2150 * daysCount,
        badge: 'High Velocity',
      },
      {
        id: 'PTL-GRN-01',
        name: 'Bosch GWS 600 Professional Angle Grinder (100mm)',
        unitsSold: 8 * daysCount,
        revenue: 8 * 2450 * daysCount,
        badge: 'High Velocity',
      },
    ],
  };
}

class AnalyticsService {
  async getAnalytics(
    period: AnalyticsPeriod = 'TODAY',
    customStart?: string,
    customEnd?: string
  ): Promise<ApiResponse<SellerAnalyticsMetrics>> {
    await simulateDelay(150);
    const data = getSellerAnalyticsData(period, customStart, customEnd);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}

export const analyticsService = new AnalyticsService();
