import store, { IStore } from '../models/store.js'
import AdminUser, { IAdminUser } from '../models/AdminUser.js';
import { Request, Response } from 'express'

export async function createStore(req: Request, res: Response) {
    const { ownerId, ownerEmail, ...storeData } = req.body as IStore;

    // Basic validation for required fields.
    if (!ownerId || !ownerEmail || !storeData) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Check if a user with the given email already exists.
        const existingUser = await AdminUser.findOne({ ownerEmail });
        if (!existingUser) {
            return res.status(409).json({ message: 'There is no admin user found to add to the store.' });
        }

        // Create a new admin user instance.
        const newStore = new store({
            ownerId,
            ownerEmail,
            storeData
        });

        await newStore.save();

        res.status(201).json({ message: 'Admin user created successfully.', userId: newStore._id });
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ message: 'Server error while creating admin user.' });
    }
}