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
    setDefaultClientAddress
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
