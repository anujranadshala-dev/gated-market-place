import order, { IOrder } from '../models/order.js';
import store, { IStore } from '../models/store.js';
import ClientUser from '../models/clientUser.js';
import { ClientAuthRequest } from '../middleware/clientAuth.js';
import { Request, Response } from 'express';

function mapOrderToClientFormat(orderDoc: IOrder) {
    return {
        id: orderDoc._id.toString(),
        orderNumber: orderDoc.orderNumber,
        userId: orderDoc.customer?.id || '',
        userEmail: orderDoc.customer?.email || '',
        organization: orderDoc.customer?.name || '',
        items: orderDoc.items?.map((item: any) => ({
            product: {
                id: item.productId,
                storeId: orderDoc.storeId,
                storeName: orderDoc.storeName || '',
                sku: item.sku,
                name: item.productName,
                description: '',
                category: '',
                basePrice: item.unitPrice,
                moq: item.quantity,
                stock: 0,
                inStock: true,
                leadTimeDays: 0,
                taxRate: 0,
                priceTiers: [],
                specifications: {},
                imageUrl: item.imageUrl || '',
                complianceTags: [],
            },
            quantity: item.quantity,
            appliedUnitPrice: item.unitPrice,
            appliedDiscountPercent: 0,
            itemSubtotal: item.totalPrice,
            itemTax: 0,
            storeId: orderDoc.storeId,
            storeName: orderDoc.storeName || '',
        })) || [],
        subtotal: orderDoc.subtotal || 0,
        discountTotal: orderDoc.discountAmount || 0,
        taxTotal: orderDoc.taxAmount || 0,
        shippingFee: orderDoc.shippingFee || 0,
        grandTotal: orderDoc.totalAmount || 0,
        status: orderDoc.status || 'Pending',
        paymentMethod: 'PO_INVOICE',
        shippingAddress: {
            recipientName: orderDoc.shippingAddress?.recipientName || '',
            company: '',
            addressLine: orderDoc.shippingAddress?.street || '',
            city: orderDoc.shippingAddress?.city || '',
            state: orderDoc.shippingAddress?.state || '',
            zipCode: orderDoc.shippingAddress?.postalCode || '',
            country: orderDoc.shippingAddress?.country || '',
        },
        notes: '',
        createdAt: orderDoc.createdAt?.toISOString() || new Date().toISOString(),
        storeIds: [orderDoc.storeId],
    };
}

export async function getClientOrders(req: ClientAuthRequest, res: Response) {
    try {
        if (!req.clientUser) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const clientUser = await ClientUser.findById(req.clientUser.userId);
        if (!clientUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessibleStoreIds = clientUser.accessibleStoresId.map(id => id.toString());
        const orders = await order.find({ storeId: { $in: accessibleStoreIds } });
        const stores = await store.find({ _id: { $in: accessibleStoreIds } });
        const storeMap = new Map(stores.map(s => [s._id.toString(), s.name]));

        res.status(200).json({
            orders: orders.map((o: IOrder) => mapOrderToClientFormat({
                ...o.toObject ? o.toObject() : o,
                storeName: storeMap.get(o.storeId) || ''
            }))
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders.' });
    }
}

export async function createClientOrder(req: ClientAuthRequest, res: Response) {
    try {
        if (!req.clientUser) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { storeId, customer, shippingAddress, items, subtotal, shippingFee, taxAmount, discountAmount, totalAmount, currency, paymentMethod, notes } = req.body;

        if (!storeId || !customer || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields: storeId, customer, shippingAddress, items' });
        }

        const clientUser = await ClientUser.findById(req.clientUser.userId);
        if (!clientUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessibleStoreIds = clientUser.accessibleStoresId.map(id => id.toString());
        if (!accessibleStoreIds.includes(storeId)) {
            return res.status(403).json({ message: 'You are not authorized to place orders in this store' });
        }

        const storeDoc = await store.findById(storeId);
        const storeName = storeDoc?.name || '';

        const newOrder = new order({
            storeId,
            storeName,
            orderNumber: `ORD-${Date.now()}`,
            customer: {
                id: req.clientUser.userId.toString(),
                name: customer.recipientName || clientUser.fullName,
                email: customer.email || clientUser.email,
                phone: customer.phone || clientUser.mobileNumber,
                tier: clientUser.assignedTier,
            },
            shippingAddress: {
                recipientName: shippingAddress.recipientName,
                street: shippingAddress.addressLine,
                suite: '',
                city: shippingAddress.city,
                state: shippingAddress.state,
                postalCode: shippingAddress.zipCode,
                country: shippingAddress.country,
            },
            items: items.map((item: any) => ({
                productId: item.product?.id || item.productId,
                productName: item.product?.name || item.productName,
                sku: item.product?.sku || item.sku,
                quantity: item.quantity,
                unitPrice: item.appliedUnitPrice || item.product?.basePrice || 0,
                totalPrice: item.itemSubtotal || (item.quantity * (item.appliedUnitPrice || item.product?.basePrice || 0)),
                isGatedExclusive: false,
                imageUrl: item.product?.imageUrl || '',
            })),
            subtotal: subtotal || 0,
            shippingFee: shippingFee || 0,
            taxAmount: taxAmount || 0,
            discountAmount: discountAmount || 0,
            totalAmount: totalAmount || 0,
            currency: currency || 'INR',
            status: 'Pending',
            paymentStatus: 'PENDING',
            logistics: {},
        });

        await newOrder.save();

        res.status(201).json({
            message: 'Order created successfully.',
            orderId: newOrder._id,
            orderNumber: newOrder.orderNumber,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error while creating order.' });
    }
}
