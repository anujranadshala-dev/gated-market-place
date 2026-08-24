import { Router } from 'express';
import {
    createAdminUser,
    loginAdminUser,
    logoutAdminUser,
    getMe
} from '../controllers/AdminAuth.js';
import { protect, authorize } from '../middleware/auth.js';

import { createStore, getStore, updateStore, deleteStore } from '../controllers/store.js'
import { createProduct, getProduct, updateProduct, deleteProduct } from '../controllers/products.js'
import { createOrder, getOrder, updateOrder, deleteOrder } from '../controllers/orders.js'

const router = Router();

// Public routes
router.post('/register', createAdminUser);
router.post('/login', loginAdminUser);

// Protected routes that require authentication
router.post('/logout', protect, logoutAdminUser);
router.get('/me', protect, getMe);

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