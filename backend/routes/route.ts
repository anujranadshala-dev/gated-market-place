import { Router } from 'express';
import {
    createAdminUser,
    loginAdminUser,
    logoutAdminUser,
    getMe
} from '../controllers/AdminAuth.js';
import { protect } from '../middleware/auth.js';

import { createStore, getStore } from '../controllers/store.js'
import { createProduct, getProduct } from '../controllers/products.js'

const router = Router();

// Public routes
router.post('/register', createAdminUser);
router.post('/login', loginAdminUser);

// Protected routes that require authentication
router.post('/logout', protect, logoutAdminUser);
router.get('/me', protect, getMe);

router.post('/create-store', protect, createStore)
router.get('/stores', protect, getStore)

router.post('/create-product', protect, createProduct)
router.get('/products', protect, getProduct)

export default router;