import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Store document
export interface IStore extends Document {
    name: string;
    slug: string;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    description: string;
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
    logoUrl: string;
    currency: string;
    gatingConfig: {
        requireInvitation: boolean;
        allowedEmailDomains: string[];
        minimumLoyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK';
        autoApproveWhitelist: boolean;
    };
    metrics: {
        totalRevenue: number;
        totalOrders: number;
        activeProductsCount: number;
        invitedCustomersCount: number;
        averageOrderValue: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema<IStore>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true },
    ownerName: String,
    ownerEmail: { type: String, required: true },
    description: String,
    status: {
        type: String,
        enum: ['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'],
        default: 'PENDING_APPROVAL',
    },
    logoUrl: String,
    currency: String, // e.g., 'USD', 'EUR'
    gatingConfig: {
        requireInvitation: { type: Boolean, default: false },
        allowedEmailDomains: [String],
        minimumLoyaltyTier: {
            type: String,
            enum: ['BRONZE', 'SILVER', 'GOLD', 'VIP_BLACK'],
        },
        autoApproveWhitelist: { type: Boolean, default: false },
    },
    metrics: {
        totalRevenue: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        activeProductsCount: { type: Number, default: 0 },
        invitedCustomersCount: { type: Number, default: 0 },
        averageOrderValue: { type: Number, default: 0 },
    },
}, {
    timestamps: true // Automatically manages createdAt and updatedAt
});

export default mongoose.model<IStore>('Store', storeSchema);