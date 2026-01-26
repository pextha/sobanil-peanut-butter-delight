import express from 'express';
import {
  getCategories, createCategory,
  getFlavors, createFlavor,
  getWeights, createWeight
} from '../controllers/attributeController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public to Read, Admin to Create
router.route('/categories').get(getCategories).post(protect, admin, createCategory);
router.route('/flavors').get(getFlavors).post(protect, admin, createFlavor);
router.route('/weights').get(getWeights).post(protect, admin, createWeight);

export default router;