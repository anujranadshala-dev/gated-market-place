import { Response } from "express";
import bcrypt from 'bcryptjs';
import ClientUser from '../models/clientUser.js';
import AdminUser from '../models/AdminUser.js';
import store, { IStore } from '../models/store.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendClientCredentialsEmail, sendPasswordChangedBySuperAdminEmail } from '../utils/email.js';
import { hashPassword } from '../utils/crypto.js';
import { logAudit } from '../utils/audit.js';

function generateTempPassword(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '#', '$', '@'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return `Temp#${randomDigits}${randomSymbol}`;
}

function suggestUsername(email: string, name?: string): string {
    if (name && name.trim()) {
        const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.');
        return cleanName;
    }
    const cleanEmail = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '.');
    return cleanEmail || 'client.user';
}

export async function createClientUser(req: AuthRequest, res: Response) {
    try {
        const user = req.user!;
        const isSuperAdmin = user.role === 'SUPER_ADMIN';
        const { email, fullName, username, storeId, assignedTier } = req.body;

        if (!email || !fullName || !storeId) {
            return res.status(400).json({ message: 'Missing required fields: email, fullName, storeId' });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const gmailRegex = /^[^\s@]+@gmail\.com$/;

        if (!gmailRegex.test(trimmedEmail)) {
            return res.status(400).json({ message: 'Only Gmail addresses are allowed for client accounts.' });
        }

        let targetStoreId = storeId;
        if (!isSuperAdmin) {
            targetStoreId = user.assignedStoreId;
        }

        const finalUsername = username || suggestUsername(email, fullName);
        const tempPassword = generateTempPassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(hashPassword(tempPassword), salt);

        const newClientUser = new ClientUser({
            username: finalUsername,
            email: email.toLowerCase().trim(),
            fullName: fullName.trim(),
            role: 'SHOP_USER',
            accessibleStoresId: [targetStoreId],
            password: hashedPassword,
            passwordLastChangedAt: undefined,
            totalSpent: 0,
            hasVipBlackSubscription: false,
            subscriptionPlan: 'NONE',
            assignedTier: assignedTier || 'BRONZE',
            status: 'Pending First Login',
        });

        await newClientUser.save();

        logAudit('CLIENT_USER_CREATED', newClientUser._id.toString(), user.role, {
            email: newClientUser.email,
            username: newClientUser.username,
            storeId: targetStoreId,
        });

        const storeDoc = await store.findById(targetStoreId).select('name ownerName ownerEmail');
        const storeName = (storeDoc as IStore | null)?.name || 'Gated Marketplace';
        const ownerName = (storeDoc as IStore | null)?.ownerName || 'Store Owner';
        const ownerEmail = (storeDoc as IStore | null)?.ownerEmail || '';

        const responsePayload = {
            message: 'Client user created successfully.',
            clientUser: {
                id: newClientUser._id,
                username: newClientUser.username,
                email: newClientUser.email,
                fullName: newClientUser.fullName,
                accessibleStores: newClientUser.accessibleStoresId,
                assignedTier: newClientUser.assignedTier,
                status: newClientUser.status,
            }
        };

        sendClientCredentialsEmail({
            recipientEmail: newClientUser.email,
            recipientName: newClientUser.fullName,
            username: newClientUser.username,
            temporaryPassword: tempPassword,
            storeName,
            ownerName,
            ownerEmail,
            assignedTier: newClientUser.assignedTier,
        }).catch((emailError) => {
            console.error('Failed to send credentials email:', emailError);
        });

        res.status(201).json(responsePayload);
    } catch (error) {
        console.error('Error creating client user:', error);
        res.status(500).json({ message: 'Server error while creating client user.' });
    }
}

export async function getClientUsers(req: AuthRequest, res: Response) {
    try {
        const user = req.user!;
        const isSuperAdmin = user.role === 'SUPER_ADMIN';

        let query: any = {};
        if (!isSuperAdmin) {
            query.accessibleStoresId = user.assignedStoreId;
        }

        const clientUsers = await ClientUser.find(query).select('-password');

        res.status(200).json({
            clientUsers: clientUsers.map((u) => ({
                id: u._id,
                username: u.username,
                email: u.email,
                fullName: u.fullName,
                accessibleStores: u.accessibleStoresId,
                totalSpent: u.totalSpent,
                hasVipBlackSubscription: u.hasVipBlackSubscription,
                subscriptionPlan: u.subscriptionPlan,
                assignedTier: u.assignedTier,
                status: u.status,
                createdAt: u.createdAt,
            }))
        });
    } catch (error) {
        console.error('Error fetching client users:', error);
        res.status(500).json({ message: 'Server error while fetching client users.' });
    }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
    try {
        const user = req.user!;
        if (user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Only super admins can access all users.' });
        }

        const [clientUsers, adminUsers] = await Promise.all([
            ClientUser.find().select('-password'),
            AdminUser.find().select('-password'),
        ]);

        const mappedClientUsers = clientUsers.map((u) => ({
            id: u._id.toString(),
            type: 'CLIENT',
            username: u.username,
            email: u.email,
            fullName: u.fullName,
            role: 'SHOP_USER',
            status: u.status,
            assignedTier: u.assignedTier,
            totalSpent: u.totalSpent,
            hasVipBlackSubscription: u.hasVipBlackSubscription,
            subscriptionPlan: u.subscriptionPlan,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        }));

        const mappedAdminUsers = adminUsers.map((u) => ({
            id: u._id.toString(),
            type: 'ADMIN',
            username: u.email,
            email: u.email,
            fullName: u.name,
            role: u.role,
            status: u.assignedStoreId ? 'Active' : 'Pending',
            assignedTier: u.role === 'SUPER_ADMIN' ? 'VIP_BLACK' : 'GOLD',
            totalSpent: 0,
            hasVipBlackSubscription: false,
            subscriptionPlan: 'NONE',
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        }));

        res.status(200).json({
            users: [...mappedAdminUsers, ...mappedClientUsers],
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
}

export async function updateClientUser(req: AuthRequest, res: Response) {
    try {
        const { clientUserId } = req.params;
        const updates = req.body;

        const clientUser = await ClientUser.findById(clientUserId);
        if (!clientUser) {
            return res.status(404).json({ message: 'Client user not found' });
        }

        const allowedFields = ['fullName', 'email', 'accessibleStoresId', 'assignedTier', 'status'];
        const filteredUpdates: any = {};
        for (const field of allowedFields) {
            if (field in updates) {
                filteredUpdates[field] = updates[field];
            }
        }

        const updatedUser = await ClientUser.findByIdAndUpdate(
            clientUserId,
            { $set: filteredUpdates },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Client user updated successfully.',
            clientUser: {
                id: updatedUser!._id,
                username: updatedUser!.username,
                email: updatedUser!.email,
                fullName: updatedUser!.fullName,
                accessibleStores: updatedUser!.accessibleStoresId,
                assignedTier: updatedUser!.assignedTier,
                status: updatedUser!.status,
            }
        });
    } catch (error) {
        console.error('Error updating client user:', error);
        res.status(500).json({ message: 'Server error while updating client user.' });
    }
}

export async function resetClientPassword(req: AuthRequest, res: Response) {
    try {
        const { clientUserId } = req.params;

        const clientUser = await ClientUser.findById(clientUserId).select('+password');
        if (!clientUser) {
            return res.status(404).json({ message: 'Client user not found' });
        }

        const trimmedEmail = clientUser.email.toLowerCase();
        const gmailRegex = /^[^\s@]+@gmail\.com$/;

        if (!gmailRegex.test(trimmedEmail)) {
            return res.status(400).json({ message: 'Only Gmail addresses are allowed for client accounts.' });
        }

        const newTempPassword = generateTempPassword();
        const salt = await bcrypt.genSalt(10);
        clientUser.password = await bcrypt.hash(hashPassword(newTempPassword), salt);
        clientUser.passwordLastChangedAt = undefined;
        clientUser.status = 'Pending First Login';
        await clientUser.save();

        logAudit('CLIENT_PASSWORD_RESET', clientUser._id.toString(), req.user!.role, {
            email: clientUser.email,
            username: clientUser.username,
        });

        const storeDoc = await store.findOne({ _id: { $in: clientUser.accessibleStoresId } }).select('name ownerName ownerEmail');
        const storeName = (storeDoc as IStore | null)?.name || 'Gated Marketplace';
        const ownerName = (storeDoc as IStore | null)?.ownerName || 'Store Owner';
        const ownerEmail = (storeDoc as IStore | null)?.ownerEmail || '';

        sendClientCredentialsEmail({
            recipientEmail: clientUser.email,
            recipientName: clientUser.fullName,
            username: clientUser.username,
            temporaryPassword: newTempPassword,
            storeName,
            ownerName,
            ownerEmail,
            assignedTier: clientUser.assignedTier,
        }).catch((emailError) => {
            console.error('Failed to send password reset email:', emailError);
        });

        res.status(200).json({
            message: 'Password reset successfully.',
            clientUserId: clientUser._id,
            username: clientUser.username,
            email: clientUser.email,
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error while resetting password.' });
    }
}

export async function changeClientPassword(req: AuthRequest, res: Response) {
    try {
        const { clientUserId } = req.params;
        const { newPassword, markAsTemp, sendEmail } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const clientUser = await ClientUser.findById(clientUserId).select('+password');
        if (!clientUser) {
            return res.status(404).json({ message: 'Client user not found' });
        }

        const salt = await bcrypt.genSalt(10);
        clientUser.password = await bcrypt.hash(hashPassword(newPassword), salt);
        clientUser.passwordLastChangedAt = new Date();
        clientUser.status = markAsTemp ? 'Pending First Login' : 'Active';
        await clientUser.save();

        logAudit('CLIENT_PASSWORD_CHANGED', clientUser._id.toString(), req.user!.role, {
            email: clientUser.email,
            username: clientUser.username,
            markAsTemp: !!markAsTemp,
        });

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        const shouldEmail = sendEmail === true || isSuperAdmin;

        if (shouldEmail) {
            const storeDoc = await store.findOne({ _id: { $in: clientUser.accessibleStoresId } }).select('name');
            const storeName = (storeDoc as IStore | null)?.name || 'Gated Marketplace';

            sendPasswordChangedBySuperAdminEmail({
                recipientEmail: clientUser.email,
                recipientName: clientUser.fullName,
                username: clientUser.username,
                newPassword,
                storeName,
                isTemporary: !!markAsTemp,
                superAdminName: req.user?.name,
                superAdminEmail: req.user?.email,
            }).catch((emailError) => {
                console.error('Failed to send super-admin password-change email:', emailError);
            });
        }

        res.status(200).json({
            message: 'Password changed successfully.',
            clientUserId: clientUser._id,
            username: clientUser.username,
            email: clientUser.email,
            status: clientUser.status,
            emailSent: shouldEmail,
        });
    } catch (error) {
        console.error('Error changing client password:', error);
        res.status(500).json({ message: 'Server error while changing password.' });
    }
}

export async function deleteClientUser(req: AuthRequest, res: Response) {
    try {
        const { clientUserId } = req.params;

        const clientUser = await ClientUser.findById(clientUserId);
        if (!clientUser) {
            return res.status(404).json({ message: 'Client user not found' });
        }

        await ClientUser.findByIdAndDelete(clientUserId);

        logAudit('CLIENT_USER_DELETED', clientUserId, req.user!.role, {
            email: clientUser.email,
            username: clientUser.username,
        });

        res.status(200).json({ message: 'Client user deleted successfully.' });
    } catch (error) {
        console.error('Error deleting client user:', error);
        res.status(500).json({ message: 'Server error while deleting client user.' });
    }
}
