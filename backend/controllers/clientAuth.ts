import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ClientUser, { IClientUser } from '../models/clientUser.js';
import { ClientAuthRequest } from '../middleware/clientAuth.js';

export async function clientLogin(req: Request, res: Response) {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Missing required fields: username/email, password.' });
    }

    try {
        const trimmedInput = usernameOrEmail.trim().toLowerCase();
        const user = await ClientUser.findOne({
            $or: [
                { username: trimmedInput },
                { email: trimmedInput }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: 'SHOP_USER',
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: '7d',
        });

        res.cookie('clientToken', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: 'SHOP_USER',
                avatarUrl: user.avatarUrl,
                mobileNumber: user.mobileNumber,
                accessibleStores: user.accessibleStoresId,
                totalSpent: user.totalSpent,
                isVipBlackSubscribed: user.hasVipBlackSubscription,
                vipBlackSubscriptionPlan: user.subscriptionPlan,
                vipBlackSubscribedAt: user.subscriptionRenewsAt,
                assignedTier: user.assignedTier,
                status: user.status,
                address: user.address,
                savedAddresses: user.savedAddresses,
                hasCompletedPasswordSetup: user.passwordLastChangedAt ? true : false,
                isTemporaryPassword: !user.passwordLastChangedAt,
                temporaryPassword: undefined,
                currentPassword: undefined,
                passwordChangedAt: user.passwordLastChangedAt,
            },
        });
    } catch (error) {
        console.error('Error during client login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
}

export async function clientLogout(req: Request, res: Response) {
    res.cookie('clientToken', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logout successful.' });
}

export async function getClientMe(req: ClientAuthRequest, res: Response) {
    try {
        const user = await ClientUser.findById(req.clientUser!.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: 'SHOP_USER',
                avatarUrl: user.avatarUrl,
                mobileNumber: user.mobileNumber,
                accessibleStores: user.accessibleStoresId,
                totalSpent: user.totalSpent,
                isVipBlackSubscribed: user.hasVipBlackSubscription,
                vipBlackSubscriptionPlan: user.subscriptionPlan,
                vipBlackSubscribedAt: user.subscriptionRenewsAt,
                assignedTier: user.assignedTier,
                status: user.status,
                address: user.address,
                savedAddresses: user.savedAddresses,
                hasCompletedPasswordSetup: user.passwordLastChangedAt ? true : false,
                isTemporaryPassword: !user.passwordLastChangedAt,
                temporaryPassword: undefined,
                currentPassword: undefined,
                passwordChangedAt: user.passwordLastChangedAt,
            }
        });
    } catch (error) {
        console.error('Error fetching client user:', error);
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
}

export async function updateClientProfile(req: ClientAuthRequest, res: Response) {
    try {
        const { fullName, email, mobileNumber, avatarUrl } = req.body;
        const user = await ClientUser.findById(req.clientUser!.userId).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (mobileNumber) user.mobileNumber = mobileNumber;
        if (avatarUrl) user.avatarUrl = avatarUrl;

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: 'SHOP_USER',
                avatarUrl: user.avatarUrl,
                mobileNumber: user.mobileNumber,
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
}

export async function changeClientPassword(req: ClientAuthRequest, res: Response) {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await ClientUser.findById(req.clientUser!.userId).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password || '');
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.passwordLastChangedAt = new Date();
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error while changing password.' });
    }
}
