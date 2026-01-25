import express from 'express';
import { authUser, getUserProfile, registerUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', registerUser);       // URL: /api/users
router.post('/login', authUser);      // URL: /api/users/login
// NEW: Use 'protect' to lock this route!
// This means "Get Profile" only works if you are logged in.
router.route('/profile').get(protect, getUserProfile);

export default router;  