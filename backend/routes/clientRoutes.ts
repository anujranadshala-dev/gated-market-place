import { Router } from 'express';
import {
    clientLogin,
    clientLogout,
    getClientMe,
    updateClientProfile,
    changeClientPassword,
    addClientAddress,
    updateClientAddress,
    deleteClientAddress,
    setDefaultClientAddress,
    refreshClientToken
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
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts, please try again after 15 minutes.' },
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

router.post('/refresh', refreshLimiter, refreshClientToken);

// Public routes
router.post('/login', loginLimiter, clientLogin);
router.post('/logout', clientLogout);

// Protected client user routes
router.get('/me', clientProtect, getClientMe);
router.put('/profile', clientProtect, updateClientProfile);
router.put('/password', clientProtect, changeClientPassword);

// Address routes
router.post('/addresses', clientProtect, addClientAddress);
router.put('/addresses/:id', clientProtect, updateClientAddress);
router.delete('/addresses/:id', clientProtect, deleteClientAddress);
router.put('/addresses/:id/default', clientProtect, setDefaultClientAddress);

// Client data routes
router.get('/stores', clientProtect, getClientStores);
router.get('/products', clientProtect, getClientProducts);
router.get('/orders', clientProtect, getClientOrders);
router.post('/orders', clientProtect, createClientOrder);

export default router;
