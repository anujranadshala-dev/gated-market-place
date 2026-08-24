import { Router } from 'express';
import {
    createAdminUser,
    loginAdminUser,
    logoutAdminUser,
    getMe
} from '../controllers/AdminAuth.js';
import { protect } from '../middleware/auth.js';

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

router.post('/create-store', protect, createStore)
router.get('/stores', protect, getStore)
router.put('/stores/:storeId', protect, updateStore)
router.delete('/stores/:storeId', protect, deleteStore)

router.post('/create-product', protect, createProduct)
router.get('/products', protect, getProduct)
router.put('/products/:productId', protect, updateProduct)
router.delete('/products/:productId', protect, deleteProduct)

router.post('/create-order', protect, createOrder)
router.get('/orders', protect, getOrder)
router.put('/orders/:orderId', protect, updateOrder)
router.delete('/orders/:orderId', protect, deleteOrder)

export default router;