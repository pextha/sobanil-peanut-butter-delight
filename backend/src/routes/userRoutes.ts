import express from 'express';
import {
    authUser,
    getUserProfile,
    registerUser,
    updateUserProfile,
    addAddress,
    deleteAddress,
    updateAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/profile/address')
    .post(protect, addAddress);

router.route('/profile/address/:id')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router.route('/wishlist')
    .post(protect, addToWishlist)
    .get(protect, getWishlist);

router.route('/wishlist/:id')
    .delete(protect, removeFromWishlist);

export default router;  