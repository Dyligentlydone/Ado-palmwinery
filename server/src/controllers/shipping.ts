import { Request, Response } from 'express';
import { shippingService } from '../services/shipping';
import { SupportedCurrency } from '../config/constants';
import prisma from '../config/database';

export const calculateShipping = async (req: Request, res: Response): Promise<void> => {
  try {
    const { countryCode, weight, currency = 'USD' } = req.body;

    if (!countryCode || weight === undefined) {
      res.status(400).json({ error: 'countryCode and weight are required' });
      return;
    }

    const result = await shippingService.calculateShipping(
      countryCode,
      parseFloat(weight),
      currency as SupportedCurrency
    );

    if (!result) {
      res.status(404).json({ error: 'No shipping available for this location' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(500).json({ error: 'Failed to calculate shipping' });
  }
};

export const getShippingZones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const zones = await shippingService.getShippingZones();
    res.json(zones);
  } catch (error) {
    console.error('Get shipping zones error:', error);
    res.status(500).json({ error: 'Failed to fetch shipping zones' });
  }
};

export const adminCreateShippingZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const zone = await prisma.shippingZone.create({ data: req.body });
    res.status(201).json(zone);
  } catch (error) {
    console.error('Create shipping zone error:', error);
    res.status(500).json({ error: 'Failed to create shipping zone' });
  }
};

export const adminUpdateShippingZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const zone = await prisma.shippingZone.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(zone);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Shipping zone not found' });
      return;
    }
    console.error('Update shipping zone error:', error);
    res.status(500).json({ error: 'Failed to update shipping zone' });
  }
};
