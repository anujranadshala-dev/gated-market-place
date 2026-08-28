import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ClientUser from '../models/clientUser.js';

export interface ClientAuthRequest extends Request {
    clientUser?: {
        userId: string;
        username: string;
        email: string;
        fullName: string;
        role: string;
    };
}

export const clientProtect = async (req: ClientAuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.clientToken;

    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Server configuration error: JWT secret is missing.');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

        const user = await ClientUser.findById(decoded.userId).select('-password');
        if (!user) {
             return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.clientUser = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: 'SHOP_USER',
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};
