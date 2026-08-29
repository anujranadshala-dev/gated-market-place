import AdminUser, { IAdminUser } from '../models/AdminUser.js';
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.js';

export async function createAdminUser(req: Request, res: Response) {
    const { email, name, password, role, assignedStoreId } = req.body as IAdminUser;

    // Basic validation for required fields.
    if (!email || !name || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields: email, name, password, role.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const gmailRegex = /^[^\s@]+@gmail\.com$/;

    if (!gmailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Only Gmail addresses are allowed for admin/owner accounts.' });
    }

    try {
        // Check if a user with the given email already exists.
        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Admin user with this email already exists.' });
        }

        // It's a security best practice to hash passwords before storing them.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new admin user instance.
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
    console.log(email);
    // Basic validation for required fields.
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields: email, password.' });
    }

    try {
        // Find the user by email. We must explicitly select the password since it's excluded by default.
        const user = await AdminUser.findOne({ email }).select('+password');
        console.log('User found:', user);

        // For security, use a generic error message if the user is not found or the password is a mismatch.
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the stored hashed password.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
 
        // Update the last login timestamp.
        user.lastLoginAt = new Date();
        await user.save({ timestamps: false }); // Use { timestamps: false } to prevent `updatedAt` from being modified.

        // Create JWT Payload containing user identifiers.
        const payload = {
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            assignedStoreId: user.assignedStoreId,
        };

        // Sign the token. Use a strong secret from your environment variables for security.
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables.');
            throw new Error('Server configuration error: JWT secret is missing.');
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d', // Token expires in 24 hours
        });
        // Set the token in an HTTP-Only cookie for security.
        // This prevents client-side JavaScript from accessing the token, mitigating XSS attacks.
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Return user information to the client. The token is now in a cookie.
        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, email: user.email, name: user.name, role: user.role, assignedStoreId: user.assignedStoreId, avatarUrl: user.avatarUrl },
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
}

export async function logoutAdminUser(req: Request, res: Response) {
    // To log out, we clear the authentication cookie.
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logout successful.' });
}

export async function getMe(req: AuthRequest, res: Response) {
    // The user object is attached to the request by the 'protect' middleware.
    // We can send it back directly without another database query.
    res.status(200).json({ user: req.user });
}