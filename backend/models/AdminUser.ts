import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminUser extends Document {
    email: string;
    name: string;
    password?: string;
    role: 'SUPER_ADMIN' | 'STORE_OWNER';
    assignedStoreId?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    passwordLastChangedAt?: Date;
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
}, {
    timestamps: true, // Manages createdAt and updatedAt
});

export default mongoose.model<IAdminUser>('AdminUser', adminUserSchema);  