import { Router } from 'express';
import {
    createClientUser,
    getClientUsers,
    updateClientUser,
    resetClientPassword,
    deleteClientUser
} from '../controllers/adminClientManagement.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Client user management - accessible by both STORE_OWNER and SUPER_ADMIN
router.post('/clients', authorize('STORE_OWNER', 'SUPER_ADMIN'), createClientUser);
router.get('/clients', authorize('STORE_OWNER', 'SUPER_ADMIN'), getClientUsers);
router.put('/clients/:clientUserId', authorize('STORE_OWNER', 'SUPER_ADMIN'), updateClientUser);
router.post('/clients/:clientUserId/reset-password', authorize('STORE_OWNER', 'SUPER_ADMIN'), resetClientPassword);
router.delete('/clients/:clientUserId', authorize('STORE_OWNER', 'SUPER_ADMIN'), deleteClientUser);

export default router;
