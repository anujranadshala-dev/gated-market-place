import store, { IStore } from '../models/store.js';
import product, { IProduct } from '../models/product.js';
import ClientUser from '../models/clientUser.js';
import { ClientAuthRequest } from '../middleware/clientAuth.js';
import { Request, Response } from 'express';

function mapProductToClientFormat(productDoc: any, storeName?: string) {
    return {
        id: productDoc._id.toString(),
        storeId: productDoc.storeId,
        storeName: storeName || productDoc.storeName || '',
        sku: productDoc.inventory?.sku || productDoc.slug,
        name: productDoc.name,
        description: productDoc.description || '',
        category: productDoc.category || 'General',
        basePrice: productDoc.price || 0,
        moq: 1,
        stock: productDoc.inventory?.stockQuantity || 0,
        inStock: productDoc.status === 'ACTIVE' && (productDoc.inventory?.stockQuantity || 0) > 0,
        leadTimeDays: 3,
        taxRate: 0.07,
        featuredOffer: productDoc.isFeatured ? 'Featured product' : undefined,
        priceTiers: [],
        specifications: {},
        imageUrl: productDoc.images?.[0] || '',
        complianceTags: productDoc.tags || [],
    };
}

export async function getClientProducts(req: ClientAuthRequest, res: Response) {
    try {
        if (!req.clientUser) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const clientUser = await ClientUser.findById(req.clientUser.userId);
        if (!clientUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessibleStoreIds = clientUser.accessibleStoresId.map(id => id.toString());
        const products = await product.find({ storeId: { $in: accessibleStoreIds } });
        const stores = await store.find({ _id: { $in: accessibleStoreIds } });
        const storeMap = new Map(stores.map(s => [s._id.toString(), s.name]));

        res.status(200).json({
            products: products.map((p: any) => mapProductToClientFormat(p, storeMap.get(p.storeId)))
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
}
