import { Request, Response } from 'express';
import prisma from '../config/database';
import { PAGINATION } from '../config/constants';
import { SupportedCurrency, SupportedLanguage } from '../config/constants';

function localizeProduct(product: any, language: SupportedLanguage, currency: SupportedCurrency) {
  const priceField = `price${currency}` as keyof typeof product;
  return {
    ...product,
    name: language === 'es' && product.nameEs ? product.nameEs : product.name,
    description: language === 'es' && product.descriptionEs ? product.descriptionEs : product.description,
    price: product[priceField] || product.priceUSD,
    currency,
    category: product.category ? {
      ...product.category,
      name: language === 'es' && product.category.nameEs ? product.category.nameEs : product.category.name,
      description: language === 'es' && product.category.descriptionEs ? product.category.descriptionEs : product.category.description,
    } : undefined,
  };
}

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const { category, search, minPrice, maxPrice, isFeatured, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const language = (req.locale?.language || 'en') as SupportedLanguage;
    const currency = (req.locale?.currency || 'USD') as SupportedCurrency;

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category as string };
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { nameEs: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.priceUSD = {};
      if (minPrice) where.priceUSD.gte = parseFloat(minPrice as string);
      if (maxPrice) where.priceUSD.lte = parseFloat(maxPrice as string);
    }
    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    const localized = products.map(p => localizeProduct(p, language, currency));

    res.json({
      products: localized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = (req.locale?.language || 'en') as SupportedLanguage;
    const currency = (req.locale?.currency || 'USD') as SupportedCurrency;

    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug as string },
      include: { category: true },
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(localizeProduct(product, language, currency));
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = (req.locale?.language || 'en') as SupportedLanguage;
    const currency = (req.locale?.currency || 'USD') as SupportedCurrency;

    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    res.json(products.map(p => localizeProduct(p, language, currency)));
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = (req.locale?.language || 'en') as SupportedLanguage;

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });

    const localized = categories.map(c => ({
      ...c,
      name: language === 'es' && c.nameEs ? c.nameEs : c.name,
      description: language === 'es' && c.descriptionEs ? c.descriptionEs : c.description,
      productCount: c._count.products,
    }));

    res.json(localized);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// --- ADMIN ENDPOINTS ---

export const adminGetProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count(),
    ]);

    res.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, nameEs, slug, description, descriptionEs,
      priceUSD, priceEUR, priceGBP, compareAtUSD,
      images, categoryId, sku, stock, weight,
      isActive, isFeatured, tags,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name, nameEs, slug, description, descriptionEs,
        priceUSD, priceEUR, priceGBP, compareAtUSD,
        images: images || [],
        categoryId, sku, stock: stock || 0,
        weight, isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        tags: tags || [],
      },
      include: { category: true },
    });

    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Product with this slug or SKU already exists' });
      return;
    }
    console.error('Admin create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: { category: true },
    });

    res.json(product);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    console.error('Admin update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.product.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    console.error('Admin delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const adminCreateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, nameEs, slug, description, descriptionEs, image, sortOrder } = req.body;
    const category = await prisma.category.create({
      data: { name, nameEs, slug, description, descriptionEs, image, sortOrder: sortOrder || 0 },
    });
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category with this name or slug already exists' });
      return;
    }
    console.error('Admin create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const adminUpdateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    console.error('Admin update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};
