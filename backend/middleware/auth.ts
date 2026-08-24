import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AdminUser, { IAdminUser } from '../models/AdminUser.js';

// Extend Express Request interface to include a user property
export interface AuthRequest extends Request {
    user?: IAdminUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Server configuration error: JWT secret is missing.');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

        req.user = await AdminUser.findById(decoded.userId).select('-password');
        if (!req.user) {
             return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles.
// Omnipotent Super Admin override: a SUPER_ADMIN bypasses all role restrictions
// and is always authorized, regardless of the roles passed to `authorize`.
export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated to access this route' });
        }

        if (req.user.role === SUPER_ADMIN_ROLE) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }

        next();
    };
};