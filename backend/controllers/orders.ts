import order, { IOrder } from '../models/order.js'
import store, { IStore } from '../models/store.js'
import { AuthRequest } from '../middleware/auth.js';
import { Request, Response } from 'express'

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

        const updatedOrder = await order.findByIdAndUpdate(
            orderId,
            { $set: updates },
            { new: true }
        );

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

        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Server error while deleting order.' });
    }
}
