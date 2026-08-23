import store, { IStore } from '../models/store.js'
import AdminUser, { IAdminUser } from '../models/AdminUser.js';
import { AuthRequest } from '../middleware/auth.js';
import { Request, Response } from 'express'

export async function createStore(req: Request, res: Response) {
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
        console.log(newStore)
        await newStore.save();

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