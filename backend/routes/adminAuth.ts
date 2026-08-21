import { Router } from 'express';
import {
    createAdminUser,
    loginAdminUser,
    logoutAdminUser,
    getMe
} from '../controllers/AdminAuth.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', createAdminUser);
router.post('/login', loginAdminUser);

// Protected routes that require authentication
router.post('/logout', protect, logoutAdminUser);
router.get('/me', protect, getMe);

export default router;