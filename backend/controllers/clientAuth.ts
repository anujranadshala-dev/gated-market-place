import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ClientUser, { IClientUser, IAddress } from '../models/clientUser.js';
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
                address: serializeAddress(user.address),
                savedAddresses: serializeAddresses(user.savedAddresses),
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
                address: serializeAddress(user.address),
                savedAddresses: serializeAddresses(user.savedAddresses),
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
                address: serializeAddress(user.address),
                savedAddresses: serializeAddresses(user.savedAddresses),
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
}

function serializeAddress(address: IAddress | undefined | null): any {
    if (!address) return undefined;
    const { _id, ...rest } = address as any;
    return { id: _id?.toString?.(), ...rest };
}

function serializeAddresses(addresses: IAddress[]): any[] {
    return addresses.map((addr) => {
        const { _id, ...rest } = addr as any;
        return { id: _id?.toString?.(), ...rest };
    });
}

export async function addClientAddress(req: ClientAuthRequest, res: Response) {
    try {
        const user = await ClientUser.findById(req.clientUser!.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { label, recipientName, street, apartment, city, state, zipCode, country, phone, isDefault } = req.body;

        if (!street || !city || !state || !zipCode || !country) {
            return res.status(400).json({ message: 'Missing required address fields.' });
        }

        const newAddress: IAddress = {
            label: label || 'Home',
            recipientName: recipientName || user.fullName,
            street,
            apartment,
            city,
            state,
            zipCode,
            country,
            phone: phone || user.mobileNumber || '',
            isDefault: isDefault || false,
        };

        if (newAddress.isDefault || !user.savedAddresses || user.savedAddresses.length === 0) {
            user.savedAddresses.forEach((a) => (a.isDefault = false));
            newAddress.isDefault = true;
            user.address = newAddress;
        }

        user.savedAddresses.push(newAddress);
        if (!user.address) {
            user.address = newAddress;
        }

        await user.save();

        res.status(201).json({
            message: 'Address added successfully.',
            address: serializeAddress(newAddress),
            savedAddresses: serializeAddresses(user.savedAddresses),
            address_: serializeAddress(user.address),
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Server error while adding address.' });
    }
}

export async function updateClientAddress(req: ClientAuthRequest, res: Response) {
    try {
        const user = await ClientUser.findById(req.clientUser!.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressId = req.params.id;
        const { label, recipientName, street, apartment, city, state, zipCode, country, phone, isDefault } = req.body;

        if (!addressId) {
            return res.status(400).json({ message: 'Address ID is required.' });
        }

        const addressIndex = user.savedAddresses.findIndex(
            (a) => (a as any)._id?.toString?.() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found.' });
        }

        const existingAddress = user.savedAddresses[addressIndex];

        if (label !== undefined) existingAddress.label = label;
        if (recipientName !== undefined) existingAddress.recipientName = recipientName;
        if (street !== undefined) existingAddress.street = street;
        if (apartment !== undefined) existingAddress.apartment = apartment;
        if (city !== undefined) existingAddress.city = city;
        if (state !== undefined) existingAddress.state = state;
        if (zipCode !== undefined) existingAddress.zipCode = zipCode;
        if (country !== undefined) existingAddress.country = country;
        if (phone !== undefined) existingAddress.phone = phone;

        if (isDefault !== undefined) {
            if (isDefault) {
                user.savedAddresses.forEach((a) => (a.isDefault = false));
                existingAddress.isDefault = true;
                user.address = existingAddress;
            } else {
                existingAddress.isDefault = false;
            }
        }

        await user.save();

        res.status(200).json({
            message: 'Address updated successfully.',
            address: serializeAddress(existingAddress),
            savedAddresses: serializeAddresses(user.savedAddresses),
            address_: serializeAddress(user.address),
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Server error while updating address.' });
    }
}

export async function deleteClientAddress(req: ClientAuthRequest, res: Response) {
    try {
        const user = await ClientUser.findById(req.clientUser!.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressId = req.params.id;
        if (!addressId) {
            return res.status(400).json({ message: 'Address ID is required.' });
        }

        const addressIndex = user.savedAddresses.findIndex(
            (a) => (a as any)._id?.toString?.() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found.' });
        }

        const wasDefault = user.savedAddresses[addressIndex].isDefault;
        user.savedAddresses.splice(addressIndex, 1);

        if (wasDefault && user.savedAddresses.length > 0) {
            user.savedAddresses[0].isDefault = true;
            user.address = user.savedAddresses[0];
        } else if (user.savedAddresses.length === 0) {
            user.address = undefined;
        }

        await user.save();

        res.status(200).json({
            message: 'Address deleted successfully.',
            savedAddresses: serializeAddresses(user.savedAddresses),
            address_: serializeAddress(user.address),
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Server error while deleting address.' });
    }
}

export async function setDefaultClientAddress(req: ClientAuthRequest, res: Response) {
    try {
        const user = await ClientUser.findById(req.clientUser!.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressId = req.params.id;
        if (!addressId) {
            return res.status(400).json({ message: 'Address ID is required.' });
        }

        const address = user.savedAddresses.find(
            (a) => (a as any)._id?.toString?.() === addressId
        );

        if (!address) {
            return res.status(404).json({ message: 'Address not found.' });
        }

        user.savedAddresses.forEach((a) => (a.isDefault = false));
        address.isDefault = true;
        user.address = address;

        await user.save();

        res.status(200).json({
            message: 'Default address updated.',
            address_: serializeAddress(user.address),
            savedAddresses: serializeAddresses(user.savedAddresses),
        });
    } catch (error) {
        console.error('Error setting default address:', error);
        res.status(500).json({ message: 'Server error while setting default address.' });
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

