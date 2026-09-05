import { Router } from 'express';
import {
    createAdminUser,
    loginAdminUser,
    logoutAdminUser,
    getMe,
    changeAdminPassword,
    verifyEmail,
    resendVerificationEmail,
    refreshAdminToken
} from '../controllers/AdminAuth.js';
import { protect, authorize } from '../middleware/auth.js';

import { createStore, getStore, updateStore, deleteStore } from '../controllers/store.js'
import { createProduct, getProduct, updateProduct, deleteProduct } from '../controllers/products.js'
import { createOrder, getOrder, updateOrder, deleteOrder } from '../controllers/orders.js'
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { message: 'Too many registration attempts, please try again after 1 hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many token refresh attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public routes
router.post('/login', loginLimiter, loginAdminUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

router.post('/refresh', refreshLimiter, refreshAdminToken);

// Registration is disabled by default in production.
// Enable only in development by setting ALLOW_PUBLIC_REGISTRATION=true
if (process.env.ALLOW_PUBLIC_REGISTRATION === 'true') {
    router.post('/register', registerLimiter, createAdminUser);
}

// Protected routes that require authentication
router.post('/logout', protect, logoutAdminUser);
router.get('/me', protect, getMe);

// Admin password management - only SUPER_ADMIN can change other admin passwords
router.put('/admins/change-password', protect, authorize('SUPER_ADMIN'), changeAdminPassword);

// Store management: only the omnipotent Super Admin may create stores.
// Read/update/delete are shared with Store Owners (ownership enforced in controllers).
router.post('/create-store', protect, authorize('SUPER_ADMIN'), createStore)
router.get('/stores', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), getStore)
router.put('/stores/:storeId', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), updateStore)
router.delete('/stores/:storeId', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), deleteStore)

// Product management: shared between Store Owners (own store) and Super Admin (all).
router.post('/create-product', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), createProduct)
router.get('/products', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), getProduct)
router.put('/products/:productId', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), updateProduct)
router.delete('/products/:productId', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), deleteProduct)

// Order management: shared between Store Owners (own store) and Super Admin (all).
router.post('/create-order', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), createOrder)
router.get('/orders', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), getOrder)
router.put('/orders/:orderId', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), updateOrder)
router.delete('/orders/:orderId', protect, authorize('STORE_OWNER', 'SUPER_ADMIN'), deleteOrder)

export default router;