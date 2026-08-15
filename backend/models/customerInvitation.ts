import mongoose, { Document, Schema } from 'mongoose';

// Main document interface
export interface ICustomerInvitation extends Document {
  storeId: string;
  storeName: string;
  recipientEmail: string;
  recipientName?: string;
  username: string;
  password?: string;
  passwordLastChangedAt?: Date;
  totalSpend: number;
  hasVipBlackSubscription: boolean;
  subscriptionPlan: 'NONE' | 'MONTHLY' | 'ANNUAL';
  subscriptionRenewsAt?: Date;
  assignedTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK';
  inviteCode: string;
  customMessage?: string;
  status: 'Active' | 'Pending' | 'Accepted' | 'Revoked' | 'Pending First Login' | 'Password Changed';
  sentByUserId: string;
  sentAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customerInvitationSchema = new Schema<ICustomerInvitation>({
  // id is handled by mongoose
  storeId: { type: String, required: true },
  storeName: String,
  recipientEmail: { type: String, required: true },
  recipientName: String,
  username: { type: String, required: true },
  password: { type: String }, // Should be hashed
  passwordLastChangedAt: Date,
  totalSpend: { type: Number, default: 0 },
  hasVipBlackSubscription: { type: Boolean, default: false },
  subscriptionPlan: {
    type: String,
    enum: ['NONE', 'MONTHLY', 'ANNUAL'],
    default: 'NONE',
  },
  subscriptionRenewsAt: Date,
  assignedTier: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'VIP_BLACK'],
    required: true,
  },
  inviteCode: { type: String, required: true, unique: true },
  customMessage: String,
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Accepted', 'Revoked', 'Pending First Login', 'Password Changed'],
    default: 'Pending',
  },
  sentByUserId: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  acceptedAt: Date,
}, {
  timestamps: true, // Manages createdAt and updatedAt
});

export default mongoose.model<ICustomerInvitation>('CustomerInvitation', customerInvitationSchema);