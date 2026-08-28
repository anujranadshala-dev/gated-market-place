import { Router } from 'express';
import {
    clientLogin,
    clientLogout,
    getClientMe,
    updateClientProfile,
    changeClientPassword
} from '../controllers/clientAuth.js';
import { clientProtect } from '../middleware/clientAuth.js';
import {
    getClientStores
} from '../controllers/clientStore.js';
import {
    getClientProducts
} from '../controllers/clientProduct.js';
import {
    getClientOrders,
    createClientOrder
} from '../controllers/clientOrder.js';

const router = Router();

// Public routes
router.post('/login', clientLogin);
router.post('/logout', clientLogout);

// Protected client user routes
router.get('/me', clientProtect, getClientMe);
router.put('/profile', clientProtect, updateClientProfile);
router.put('/password', clientProtect, changeClientPassword);

// Client data routes
router.get('/stores', clientProtect, getClientStores);
router.get('/products', clientProtect, getClientProducts);
router.get('/orders', clientProtect, getClientOrders);
router.post('/orders', clientProtect, createClientOrder);

export default router;
