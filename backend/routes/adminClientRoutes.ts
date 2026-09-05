import { Router } from 'express';
import {
    createClientUser,
    getClientUsers,
    getAllUsers,
    updateClientUser,
    resetClientPassword,
    changeClientPassword,
    deleteClientUser
} from '../controllers/adminClientManagement.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Client user management - accessible by both STORE_OWNER and SUPER_ADMIN
router.post('/clients', authorize('STORE_OWNER', 'SUPER_ADMIN'), createClientUser);
router.get('/clients', authorize('STORE_OWNER', 'SUPER_ADMIN'), getClientUsers);

// All users management - only SUPER_ADMIN can see all users
router.get('/users', authorize('SUPER_ADMIN'), getAllUsers);

router.put('/clients/:clientUserId', authorize('STORE_OWNER', 'SUPER_ADMIN'), updateClientUser);
router.post('/clients/:clientUserId/reset-password', authorize('STORE_OWNER', 'SUPER_ADMIN'), resetClientPassword);
router.put('/clients/:clientUserId/change-password', authorize('STORE_OWNER', 'SUPER_ADMIN'), changeClientPassword);
router.delete('/clients/:clientUserId', authorize('STORE_OWNER', 'SUPER_ADMIN'), deleteClientUser);

export default router;
