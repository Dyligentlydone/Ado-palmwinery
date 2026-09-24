import prisma from '../config/database';
import { ShippingCalculation } from '../types';
import { DEFAULT_CURRENCY, SupportedCurrency } from '../config/constants';

class ShippingService {
  async calculateShipping(
    countryCode: string,
    totalWeight: number,
    currency: SupportedCurrency = DEFAULT_CURRENCY
  ): Promise<ShippingCalculation | null> {
    const zone = await prisma.shippingZone.findFirst({
      where: {
        countries: { has: countryCode },
        isActive: true,
      },
    });

    if (!zone) return null;

    const baseCost = Number(zone.baseCost);
    const perKgCost = Number(zone.perKgCost);
    let cost = baseCost + (totalWeight * perKgCost);

    // Convert currency if needed
    if (currency !== zone.currency) {
      cost = this.convertCurrency(cost, zone.currency as SupportedCurrency, currency);
    }

    return {
      cost: Math.round(cost * 100) / 100,
      currency,
      estimatedDays: zone.estimatedDays,
      zoneName: zone.name,
    };
  }

  // Simple conversion rates (in production, use a real exchange rate API)
  private convertCurrency(amount: number, from: SupportedCurrency, to: SupportedCurrency): number {
    const toUSD: Record<SupportedCurrency, number> = {
      USD: 1,
      EUR: 1.10,
      GBP: 1.27,
      CRC: 0.0019,
    };

    const usdAmount = amount * toUSD[from];
    return usdAmount / toUSD[to];
  }

  async getShippingZones() {
    return prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const shippingService = new ShippingService();
