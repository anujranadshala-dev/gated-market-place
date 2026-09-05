import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminUser extends Document {
    email: string;
    name: string;
    password: string;
    role: 'SUPER_ADMIN' | 'STORE_OWNER';
    assignedStoreId: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    passwordLastChangedAt?: Date;
    avatarUrl: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    loginAttempts?: number;
    lockedUntil?: Date;
    isLocked?: boolean;
}

const adminUserSchema = new Schema<IAdminUser>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'STORE_OWNER'],
        required: true,
    },
    assignedStoreId: String,
    lastLoginAt: Date,
    passwordLastChangedAt: Date,
    avatarUrl: String,
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    isLocked: { type: Boolean, default: false },
}, {
    timestamps: true,
});

export default mongoose.model<IAdminUser>('AdminUser', adminUserSchema);
