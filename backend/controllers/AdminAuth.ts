import AdminUser, { IAdminUser } from '../models/AdminUser.js';
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { hashPassword } from '../utils/crypto.js';

export async function createAdminUser(req: Request, res: Response) {
    const { email, name, password, role, assignedStoreId } = req.body as IAdminUser;

    if (!email || !name || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields: email, name, password, role.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const gmailRegex = /^[^\s@]+@gmail\.com$/;

    if (!gmailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Only Gmail addresses are allowed for admin/owner accounts.' });
    }

    try {
        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Admin user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdminUser = new AdminUser({
            email,
            name,
            password: hashedPassword,
            role,
            assignedStoreId,
        });

        await newAdminUser.save();

        res.status(201).json({ message: 'Admin user created successfully.', userId: newAdminUser._id });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ message: 'Server error while creating admin user.' });
    }
}

export async function loginAdminUser(req: Request, res: Response) {
    const { email, password } = req.body as IAdminUser;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields: email, password.' });
    }

    try {
        const user = await AdminUser.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const hashedInput = crypto.createHash('sha256').update(password).digest('base64');
            isMatch = await bcrypt.compare(hashedInput, user.password);
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        user.lastLoginAt = new Date();
        await user.save({ timestamps: false });

        const payload = {
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            assignedStoreId: user.assignedStoreId,
        };

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables.');
            throw new Error('Server configuration error: JWT secret is missing.');
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'Login successful',
            user: { _id: user._id, email: user.email, name: user.name, role: user.role, assignedStoreId: user.assignedStoreId, avatarUrl: user.avatarUrl },
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
}

export async function logoutAdminUser(req: Request, res: Response) {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logout successful.' });
}

export async function changeAdminPassword(req: AuthRequest, res: Response) {
    try {
        const { newPassword, email } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        if (!email) {
            return res.status(400).json({ message: 'Admin email is required.' });
        }

        const adminUser = await AdminUser.findOne({ email }).select('+password');
        if (!adminUser) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        const salt = await bcrypt.genSalt(10);
        adminUser.password = await bcrypt.hash(newPassword, salt);
        await adminUser.save({ timestamps: false });

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        if (isSuperAdmin && adminUser.email !== req.user?.email) {
            const { sendPasswordChangedBySuperAdminEmail } = await import('../utils/email.js');
            sendPasswordChangedBySuperAdminEmail({
                recipientEmail: adminUser.email,
                recipientName: adminUser.name,
                username: adminUser.email,
                newPassword,
                storeName: adminUser.assignedStoreId ? 'your store' : 'GatedPulse Admin Portal',
                isTemporary: false,
                superAdminName: req.user?.name,
                superAdminEmail: req.user?.email,
            }).catch((emailError) => {
                console.error('Failed to send admin password-change email:', emailError);
            });
        }

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing admin password:', error);
        res.status(500).json({ message: 'Server error while changing password.' });
    }
}

export async function getMe(req: AuthRequest, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                assignedStoreId: user.assignedStoreId,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLoginAt: user.lastLoginAt,
                avatarUrl: user.avatarUrl,
            }
        });
    } catch (error) {
        console.error('Error fetching admin user:', error);
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
}
