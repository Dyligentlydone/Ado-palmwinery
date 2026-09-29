import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';
import { sendPasswordResetEmail } from '../services/email';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashToken = (raw: string) => crypto.createHash('sha256').update(raw).digest('hex');

function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        addresses: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// --- Address management ---

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { label, firstName, lastName, street, city, state, postalCode, country, phone, isDefault } = req.body;
    const userId = req.user!.id;

    // If this is set as default, unset existing default
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }

    // If user has no addresses, make this one the default
    const count = await prisma.address.count({ where: { userId } });

    const address = await prisma.address.create({
      data: { userId, label, firstName, lastName, street, city, state, postalCode, country, phone, isDefault: isDefault || count === 0 },
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { label, firstName, lastName, street, city, state, postalCode, country, phone, isDefault } = req.body;
    const userId = req.user!.id;
    const addressId = req.params.id as string;

    const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) { res.status(404).json({ error: 'Address not found' }); return; }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: { label, firstName, lastName, street, city, state, postalCode, country, phone, isDefault },
    });

    res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id as string;
    const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) { res.status(404).json({ error: 'Address not found' }); return; }

    // Check if address is used by any order
    const orderCount = await prisma.order.count({ where: { addressId } });
    if (orderCount > 0) {
      res.status(400).json({ error: 'Cannot delete an address used by existing orders' });
      return;
    }

    await prisma.address.delete({ where: { id: addressId } });

    // If we deleted the default, promote the next one
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
      if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};

// --- Password management ---

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const isValid = await bcrypt.compare(currentPassword || '', user.passwordHash);
    if (!isValid) { res.status(400).json({ error: 'Current password is incorrect' }); return; }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    // Invalidate any outstanding reset tokens after a successful change
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    res.json({ message: 'Password changed' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  // Always respond identically — never leak whether an email exists.
  const generic = { message: 'If an account exists for that email, a reset link has been sent.' };

  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email) { res.json(generic); return; }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      // Invalidate any previous outstanding tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    res.json(generic);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.json(generic); // still generic on error — don't leak
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (typeof token !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const tokenHash = hashToken(token);
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      res.status(400).json({ error: 'Reset link is invalid or has expired' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      // Invalidate any other outstanding tokens for the same user
      prisma.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null, id: { not: record.id } },
        data: { usedAt: new Date() },
      }),
    ]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const adminGetUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
    })));
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
