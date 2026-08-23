import store, { IStore } from '../models/store.js'
import product, { IProduct } from '../models/product.js'
import { AuthRequest } from '../middleware/auth.js';
import { Request, Response } from 'express'

export async function createProduct(req: AuthRequest, res: Response) {
    const { storeId, ...productData } = req.body;

    if (!storeId || !productData.name || !productData.slug || !productData.price || !productData.inventory) {
        return res.status(400).json({ message: 'Missing required fields: storeId, name, slug, price, inventory' });
    }

    if (!productData.inventory.stockQuantity || !productData.inventory.lowStockThreshold || !productData.inventory.sku) {
        return res.status(400).json({ message: 'Missing required inventory fields: stockQuantity, lowStockThreshold, sku' });
    }

    try {
        let targetStoreId = storeId;
        let storeName: string | undefined;

        if (req.user?.role !== 'SUPER_ADMIN') {
            const userStore = await store.findOne({ ownerEmail: req.user!.email });
            if (!userStore) {
                return res.status(403).json({ message: 'You are not authorized to create products' });
            }
            targetStoreId = userStore._id.toString();
            storeName = userStore.name;
        } else {
            const existingStore = await store.findById(storeId);
            if (!existingStore) {
                return res.status(404).json({ message: 'Store not found' });
            }
            storeName = existingStore.name;
        }

        const newProduct = new product({
            storeId: targetStoreId,
            storeName,
            ...productData
        });

        await newProduct.save();

        res.status(201).json({ message: 'Product created successfully.', productId: newProduct._id });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error while creating product.' });
    }
}

export async function getProduct(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        let products;

        if (req.user.role === 'SUPER_ADMIN') {
            products = await product.find();
        } else {
            const userStore = await store.findOne({ ownerEmail: req.user.email });
            if (!userStore) {
                return res.status(404).json({ message: 'No store found for this user' });
            }
            products = await product.find({ storeId: userStore._id.toString() });
        }

        res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
}