import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../config/constants';

// Match storefront product responses: localized name + `price` in the active currency
function localizeCart(cart: any, language: SupportedLanguage, currency: SupportedCurrency) {
  if (!cart) return cart;
  return {
    ...cart,
    items: cart.items.map((item: any) => {
      const p = item.product;
      const priceField = `price${currency}` as keyof typeof p;
      return {
        ...item,
        product: {
          ...p,
          name: language === 'es' && p.nameEs ? p.nameEs : p.name,
          description: language === 'es' && p.descriptionEs ? p.descriptionEs : p.description,
          price: p[priceField] || p.priceUSD,
          currency,
          category: p.category ? {
            ...p.category,
            name: language === 'es' && p.category.nameEs ? p.category.nameEs : p.category.name,
          } : undefined,
        },
      };
    }),
  };
}

const localeOf = (req: AuthRequest) => ({
  language: (req.locale?.language || 'en') as SupportedLanguage,
  currency: (req.locale?.currency || 'USD') as SupportedCurrency,
});

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: { include: { category: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: {
          items: {
            include: { product: { include: { category: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    const { language, currency } = localeOf(req);
    res.json(localizeCart(cart, language, currency));
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    if (product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        res.status(400).json({ error: 'Insufficient stock' });
        return;
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: { include: { category: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const { language, currency } = localeOf(req);
    res.json(localizeCart(updatedCart, language, currency));
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId as string;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== req.user!.id) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (quantity > item.product.stock) {
        res.status(400).json({ error: 'Insufficient stock' });
        return;
      }
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: { include: { category: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const { language, currency } = localeOf(req);
    res.json(localizeCart(updatedCart, language, currency));
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const itemId = req.params.itemId as string;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user!.id) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: { include: { category: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const { language, currency } = localeOf(req);
    res.json(localizeCart(updatedCart, language, currency));
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
