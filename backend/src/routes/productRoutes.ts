import express from 'express';
import {
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  createProduct,
  // IMPORT NEW CONTROLLERS
  createProductReview,
  getTopProducts,
} from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// 1. The root route "/"
// GET: Everyone can see products
// POST: Only Admins can create products
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// 2. The Top Products Route "/top"
// IMPORTANT: This MUST go before the /:id route!
router.route('/top').get(getTopProducts);

// 3. The Reviews Route "/:id/reviews"
// POST: Logged in users can write a review
router.route('/:id/reviews').post(protect, createProductReview);

// 4. The ID route "/:id"
// GET: Everyone can see a single product
// DELETE/PUT: Only Admins can delete or edit
router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;