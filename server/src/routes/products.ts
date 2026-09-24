import { Router } from 'express';
import {
  getProducts, getProductBySlug, getFeaturedProducts, getCategories,
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminGetCategories,
} from '../controllers/products';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, adminGetProducts);
router.post('/admin', authenticate, requireAdmin, adminCreateProduct);
router.put('/admin/:id', authenticate, requireAdmin, adminUpdateProduct);
router.delete('/admin/:id', authenticate, requireAdmin, adminDeleteProduct);

// Category admin routes
router.get('/admin/categories', authenticate, requireAdmin, adminGetCategories);
router.post('/admin/categories', authenticate, requireAdmin, adminCreateCategory);
router.put('/admin/categories/:id', authenticate, requireAdmin, adminUpdateCategory);
router.delete('/admin/categories/:id', authenticate, requireAdmin, adminDeleteCategory);

export default router;
