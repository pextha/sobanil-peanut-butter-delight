import express from 'express';
import {
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  createProduct,
} from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// 1. The root route "/"
// GET: Everyone can see products
// POST: Only Admins can create products
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// 2. The ID route "/:id"
// GET: Everyone can see a single product
// DELETE/PUT: Only Admins can delete or edit
router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;  