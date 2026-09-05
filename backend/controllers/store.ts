import store, { IStore } from '../models/store.js'
import AdminUser from '../models/AdminUser.js';
import product from '../models/product.js';
import ClientUser from '../models/clientUser.js';
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express'
import { logAudit } from '../utils/audit.js';

export async function createStore(req: AuthRequest, res: Response) {
    const { ownerEmail, ...storeData } = req.body as IStore;

    // Basic validation for required fields.
    if (!ownerEmail || !storeData) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // Check if a user with the given email already exists.
        const existingUser = await AdminUser.findOne({ email: ownerEmail });
        if (!existingUser || existingUser.role !== 'STORE_OWNER') {
            return res.status(409).json({ message: `There is no store owner with this email ${ownerEmail}.` });
        }

        // Create a new admin user instance.
        const newStore = new store({
            ownerEmail: ownerEmail,
            ...storeData
        });
        await newStore.save();

        logAudit('STORE_CREATED', newStore._id.toString(), req.user!.role, {
            ownerEmail,
            name: newStore.name,
        });

        await AdminUser.findOneAndUpdate(
            { email: ownerEmail },
            { assignedStoreId: newStore._id.toString() }
        );

        res.status(201).json({ message: 'Store created successfully.', storeId: newStore._id });
    }
    catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ message: 'Server error while creating store.' });
    }
}

export async function getStore(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        let stores;
        if (req.user.role === 'SUPER_ADMIN') {
            stores = await store.find();
        } else {
            stores = await store.find({ ownerEmail: req.user.email });
        }

        res.status(200).json({ stores });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Server error while fetching stores.' });
    }
}

export async function updateStore(req: AuthRequest, res: Response) {
    const { storeId } = req.params;
    const updates = req.body;

    if (!storeId) {
        return res.status(400).json({ message: 'Store ID is required' });
    }

    try {
        const existingStore = await store.findById(storeId);
        if (!existingStore) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN') {
            if (existingStore.ownerEmail !== req.user!.email) {
                return res.status(403).json({ message: 'You are not authorized to update this store' });
            }
        }

        const allowedFields = ['name', 'slug', 'description', 'logoUrl', 'currency', 'gatingConfig', 'metrics'];
        const filteredUpdates: any = {};
        for (const field of allowedFields) {
            if (field in updates) {
                filteredUpdates[field] = updates[field];
            }
        }

        const updatedStore = await store.findByIdAndUpdate(
            storeId,
            { $set: filteredUpdates },
            { new: true }
        );

        logAudit('STORE_UPDATED', storeId, req.user!.role, {
            fields: Object.keys(filteredUpdates),
        });

        res.status(200).json({ message: 'Store updated successfully.', store: updatedStore });
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ message: 'Server error while updating store.' });
    }
}

export async function deleteStore(req: AuthRequest, res: Response) {
    const { storeId } = req.params;

    if (!storeId) {
        return res.status(400).json({ message: 'Store ID is required' });
    }

    try {
        const existingStore = await store.findById(storeId);
        if (!existingStore) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN') {
            if (existingStore.ownerEmail !== req.user!.email) {
                return res.status(403).json({ message: 'You are not authorized to delete this store' });
            }
        }

        await product.deleteMany({ storeId });
        await ClientUser.updateMany(
            { accessibleStoresId: storeId },
            { $pull: { accessibleStoresId: storeId } }
        );
        await store.findByIdAndDelete(storeId);

        logAudit('STORE_DELETED', storeId, req.user!.role, {});

        res.status(200).json({ message: 'Store deleted successfully.' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ message: 'Server error while deleting store.' });
    }
}