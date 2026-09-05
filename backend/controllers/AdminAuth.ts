import AdminUser, { IAdminUser } from '../models/AdminUser.js';
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { hashPassword } from '../utils/crypto.js';
import { sendEmailVerificationEmail } from '../utils/email.js';
import { logAudit } from '../utils/audit.js';
import { isProduction } from '../utils/config.js';

const ACCOUNT_LOCKOUT_THRESHOLD = 5;
const ACCOUNT_LOCKOUT_DURATION = 15 * 60 * 1000;

export async function createAdminUser(req: Request, res: Response) {
    const { email, name, password, role, assignedStoreId } = req.body as IAdminUser;

    if (!email || !name || !password) {
        return res.status(400).json({ message: 'Missing required fields: email, name, password.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const gmailRegex = /^[^\s@]+@gmail\.com$/;

    if (!gmailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Only Gmail addresses are allowed for admin/owner accounts.' });
    }

    const normalizedRole = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STORE_OWNER';

    try {
        const existingUser = await AdminUser.findOne({ email: trimmedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'Admin user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(hashPassword(password), salt);

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newAdminUser = new AdminUser({
            email: trimmedEmail,
            name,
            password: hashedPassword,
            role: normalizedRole,
            assignedStoreId,
            isEmailVerified: false,
            emailVerificationToken,
            emailVerificationExpires,
        });

        await newAdminUser.save();

        const frontendUrl = process.env.ADMIN_PORTAL_URL || 'http://localhost:3000';
        const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(trimmedEmail)}`;

        sendEmailVerificationEmail({
            recipientEmail: trimmedEmail,
            recipientName: name,
            verificationUrl,
        }).catch((emailError) => {
            console.error('Failed to send verification email:', emailError);
        });

        res.status(201).json({
            message: 'Admin user created successfully. Please verify your email before logging in.',
            requiresVerification: true,
            email: trimmedEmail,
        });
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
        const user = await AdminUser.findOne({ email: email.trim().toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
            const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60);
            return res.status(403).json({ message: `Account is locked. Try again in ${remaining} minutes.` });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const hashedInput = crypto.createHash('sha256').update(password).digest('base64');
            isMatch = await bcrypt.compare(hashedInput, user.password);
        }

        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= ACCOUNT_LOCKOUT_THRESHOLD) {
                user.lockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION);
                user.loginAttempts = 0;
                await user.save({ timestamps: false });
                return res.status(403).json({ message: 'Account locked due to too many failed attempts. Try again in 15 minutes.' });
            }
            await user.save({ timestamps: false });
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        user.loginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLoginAt = new Date();
        await user.save({ timestamps: false });

        logAudit('ADMIN_LOGIN', user._id.toString(), user.role, {
            email: user.email,
        });

        const payload = {
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            assignedStoreId: user.assignedStoreId,
        };

        const accessTokenExpiresIn = '15m';
        const refreshTokenExpiresIn = '7d';

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables.');
            throw new Error('Server configuration error: JWT secret is missing.');
        }

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: accessTokenExpiresIn });
        const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: refreshTokenExpiresIn });

        res.cookie('token', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: isProduction,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'Login successful',
            user: { _id: user._id, email: user.email, name: user.name, role: user.role, assignedStoreId: user.assignedStoreId, avatarUrl: user.avatarUrl, isEmailVerified: user.isEmailVerified },
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
}

export async function refreshAdminToken(req: Request, res: Response) {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: 'Refresh token not found.' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Server configuration error: JWT secret is missing.');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

        if ((decoded as any).type !== 'refresh') {
            return res.status(401).json({ message: 'Invalid token type.' });
        }

        const user = await AdminUser.findById(decoded.userId).select('-password');
        if (!user || !user.isEmailVerified) {
            return res.status(401).json({ message: 'User not found or email not verified.' });
        }

        const payload = {
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            assignedStoreId: user.assignedStoreId,
        };

        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ ...payload, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', newAccessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: isProduction,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: 'Token refreshed successfully.' });
    } catch (error) {
        console.error('Error refreshing admin token:', error);
        res.status(401).json({ message: 'Invalid refresh token.' });
    }
}

export async function logoutAdminUser(req: Request, res: Response) {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'strict',
        secure: isProduction,
    });

    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'strict',
        secure: isProduction,
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
        adminUser.password = await bcrypt.hash(hashPassword(newPassword), salt);
        await adminUser.save({ timestamps: false });

        logAudit('ADMIN_PASSWORD_CHANGED', adminUser._id.toString(), req.user!.role, {
            email: adminUser.email,
            targetEmail: adminUser.email,
        });

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
                isEmailVerified: user.isEmailVerified,
            }
        });
    } catch (error) {
        console.error('Error fetching admin user:', error);
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
}

export async function verifyEmail(req: Request, res: Response) {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({ message: 'Email and token are required.' });
    }

    try {
        const user = await AdminUser.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({ message: 'Email is already verified. You can log in.' });
        }

        if (!user.emailVerificationToken || user.emailVerificationToken !== token) {
            return res.status(400).json({ message: 'Invalid verification token.' });
        }

        if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
            return res.status(400).json({ message: 'Verification token has expired. Please request a new one.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ timestamps: false });

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Server error while verifying email.' });
    }
}

export async function resendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await AdminUser.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({ message: 'Email is already verified.' });
        }

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = emailVerificationExpires;
        await user.save({ timestamps: false });

        const frontendUrl = process.env.ADMIN_PORTAL_URL || 'http://localhost:3000';
        const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(user.email)}`;

        sendEmailVerificationEmail({
            recipientEmail: user.email,
            recipientName: user.name,
            verificationUrl,
        }).catch((emailError) => {
            console.error('Failed to resend verification email:', emailError);
        });

        res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Server error while resending verification email.' });
    }
}
