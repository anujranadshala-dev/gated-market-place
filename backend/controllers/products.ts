import store from '../models/store.js'
import product from '../models/product.js'
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express'
import { logAudit } from '../utils/audit.js';

export async function createProduct(req: AuthRequest, res: Response) {
    const { storeId, ...productData } = req.body;

    if (!storeId || !productData.name || !productData.slug || productData.price === undefined || !productData.inventory) {
        return res.status(400).json({ message: 'Missing required fields: storeId, name, slug, price, inventory' });
    }

    if (typeof productData.price !== 'number' || productData.price < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number' });
    }

    if (!productData.inventory.stockQuantity || !productData.inventory.lowStockThreshold || !productData.inventory.sku) {
        return res.status(400).json({ message: 'Missing required inventory fields: stockQuantity, lowStockThreshold, sku' });
    }

    if (typeof productData.inventory.stockQuantity !== 'number' || productData.inventory.stockQuantity < 0) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative number' });
    }

    if (typeof productData.inventory.lowStockThreshold !== 'number' || productData.inventory.lowStockThreshold < 0) {
        return res.status(400).json({ message: 'Low stock threshold must be a non-negative number' });
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

        logAudit('PRODUCT_CREATED', newProduct._id.toString(), req.user!.role, {
            storeId: targetStoreId,
            name: productData.name,
            price: productData.price,
        });

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

export async function updateProduct(req: AuthRequest, res: Response) {
    const { productId } = req.params;
    const updates = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const existingProduct = await product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN') {
            const userStore = await store.findOne({ ownerEmail: req.user!.email });
            if (!userStore || existingProduct.storeId !== userStore._id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to update this product' });
            }
        }

        const allowedFields = ['name', 'slug', 'description', 'category', 'price', 'compareAtPrice', 'costPrice', 'inventory', 'status', 'gatedTier', 'images', 'tags', 'isFeatured'];
        const filteredUpdates: any = {};
        for (const field of allowedFields) {
            if (field in updates) {
                filteredUpdates[field] = updates[field];
            }
        }

        const updatedProduct = await product.findByIdAndUpdate(
            productId,
            { $set: filteredUpdates },
            { new: true }
        );

        logAudit('PRODUCT_UPDATED', productId, req.user!.role, {
            fields: Object.keys(filteredUpdates),
        });

        res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error while updating product.' });
    }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const existingProduct = await product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN') {
            const userStore = await store.findOne({ ownerEmail: req.user!.email });
            if (!userStore || existingProduct.storeId !== userStore._id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to delete this product' });
            }
        }

        await product.findByIdAndDelete(productId);

        logAudit('PRODUCT_DELETED', productId, req.user!.role, {
            storeId: existingProduct.storeId,
            name: existingProduct.name,
        });

        res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error while deleting product.' });
    }
}