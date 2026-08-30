import store, { IStore } from '../models/store.js';
import ClientUser from '../models/clientUser.js';
import { ClientAuthRequest } from '../middleware/clientAuth.js';
import { Request, Response } from 'express';

function mapStoreToClientFormat(storeDoc: IStore) {
    return {
        id: storeDoc._id.toString(),
        name: storeDoc.name,
        slug: storeDoc.slug,
        category: storeDoc.description || 'General',
        description: storeDoc.description || '',
        logoUrl: storeDoc.logoUrl || '',
        bannerUrl: storeDoc.logoUrl || '',
        accessTier: 'Standard',
        requiresApproval: false,
        taxDefaultRate: 0.07,
        currency: storeDoc.currency || 'INR',
        contactEmail: storeDoc.ownerEmail,
        slaGuarantee: 'Standard shipping',
        activePromos: [],
        totalProductsCount: storeDoc.metrics?.activeProductsCount || 0,
    };
}

export async function getClientStores(req: ClientAuthRequest, res: Response) {
    try {
        if (!req.clientUser) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const clientUser = await ClientUser.findById(req.clientUser.userId);
        if (!clientUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessibleStoreIds = clientUser.accessibleStoresId;
        const stores = await store.find({ _id: { $in: accessibleStoreIds } });

        res.status(200).json({
            stores: stores.map(mapStoreToClientFormat)
        });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Server error while fetching stores.' });
    }
}
