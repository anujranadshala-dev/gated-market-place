import order from '../models/order.js'
import store from '../models/store.js'
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express'
import { logAudit } from '../utils/audit.js';

export async function createOrder(req: AuthRequest, res: Response) {
    const {
        storeId,
        orderNumber,
        customer,
        shippingAddress,
        items,
        subtotal,
        shippingFee,
        taxAmount,
        discountAmount,
        totalAmount,
        currency,
        paymentStatus,
        logistics
    } = req.body;

    if (!storeId || !customer || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Missing required fields: storeId, customer, shippingAddress, items' });
    }

    if (!customer.name || !customer.email || !customer.tier) {
        return res.status(400).json({ message: 'Missing required customer fields: name, email, tier' });
    }

    if (subtotal !== undefined && (typeof subtotal !== 'number' || subtotal < 0)) {
        return res.status(400).json({ message: 'Subtotal must be a non-negative number' });
    }

    if (shippingFee !== undefined && (typeof shippingFee !== 'number' || shippingFee < 0)) {
        return res.status(400).json({ message: 'Shipping fee must be a non-negative number' });
    }

    if (taxAmount !== undefined && (typeof taxAmount !== 'number' || taxAmount < 0)) {
        return res.status(400).json({ message: 'Tax amount must be a non-negative number' });
    }

    if (discountAmount !== undefined && (typeof discountAmount !== 'number' || discountAmount < 0)) {
        return res.status(400).json({ message: 'Discount amount must be a non-negative number' });
    }

    if (totalAmount !== undefined && (typeof totalAmount !== 'number' || totalAmount < 0)) {
        return res.status(400).json({ message: 'Total amount must be a non-negative number' });
    }

    try {
        let targetStoreId = storeId;
        let storeName: string | undefined;

        if (req.user?.role !== 'SUPER_ADMIN') {
            const userStore = await store.findOne({ ownerEmail: req.user!.email });
            if (!userStore) {
                return res.status(403).json({ message: 'You are not authorized to create orders' });
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

        const newOrder = new order({
            storeId: targetStoreId,
            storeName,
            orderNumber: orderNumber || `ORD-${Date.now()}`,
            customer,
            shippingAddress,
            items,
            subtotal: subtotal || 0,
            shippingFee: shippingFee || 0,
            taxAmount: taxAmount || 0,
            discountAmount: discountAmount || 0,
            totalAmount: totalAmount || 0,
            currency: currency || 'INR',
            status: 'Pending',
            paymentStatus: paymentStatus || 'PENDING',
            logistics: logistics || {},
        });

        await newOrder.save();

        logAudit('ORDER_CREATED', newOrder._id.toString(), req.user!.role, {
            storeId: targetStoreId,
            orderNumber: newOrder.orderNumber,
            totalAmount: newOrder.totalAmount,
        });

        res.status(201).json({ message: 'Order created successfully.', orderId: newOrder._id, orderNumber: newOrder.orderNumber });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error while creating order.' });
    }
}

export async function getOrder(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        let orders;

        if (req.user.role === 'SUPER_ADMIN') {
            orders = await order.find();
        } else {
            const userStore = await store.findOne({ ownerEmail: req.user.email });
            if (!userStore) {
                return res.status(404).json({ message: 'No store found for this user' });
            }
            orders = await order.find({ storeId: userStore._id.toString() });
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders.' });
    }
}

export async function updateOrder(req: AuthRequest, res: Response) {
    const { orderId } = req.params;
    const updates = req.body;

    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    try {
        const existingOrder = await order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN') {
            const userStore = await store.findOne({ ownerEmail: req.user!.email });
            if (!userStore || existingOrder.storeId !== userStore._id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to update this order' });
            }
        }

        const allowedFields = ['orderNumber', 'customer', 'shippingAddress', 'items', 'subtotal', 'shippingFee', 'taxAmount', 'discountAmount', 'totalAmount', 'currency', 'status', 'paymentStatus', 'logistics'];
        const filteredUpdates: any = {};
        for (const field of allowedFields) {
            if (field in updates) {
                filteredUpdates[field] = updates[field];
            }
        }

        const updatedOrder = await order.findByIdAndUpdate(
            orderId,
            { $set: filteredUpdates },
            { new: true }
        );

        logAudit('ORDER_UPDATED', orderId, req.user!.role, {
            fields: Object.keys(filteredUpdates),
        });

        res.status(200).json({ message: 'Order updated successfully.', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error while updating order.' });
    }
}

export async function deleteOrder(req: AuthRequest, res: Response) {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    try {
        const existingOrder = await order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user?.role !== 'SUPER_ADMIN') {
            const userStore = await store.findOne({ ownerEmail: req.user!.email });
            if (!userStore || existingOrder.storeId !== userStore._id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to delete this order' });
            }
        }

        await order.findByIdAndDelete(orderId);

        logAudit('ORDER_DELETED', orderId, req.user!.role, {
            storeId: existingOrder.storeId,
            orderNumber: existingOrder.orderNumber,
        });

        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Server error while deleting order.' });
    }
}
