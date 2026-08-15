import mongoose, { Document, Schema } from 'mongoose';

// Interface for the nested Address object
export interface IAddress {
  label: string;
  isDefault: boolean;
  recipientName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

// Main User document interface
export interface IShopUser extends Document {
  username: string;
  email: string;
  fullName: string;
  role: 'SHOP_USER';
  accessibleStoresId: string[];
  password?: string;
  passwordLastChangedAt?: Date;
  avatarUrl?: string;
  mobileNumber?: string;
  totalSpent: number;
  hasVipBlackSubscription: boolean;
  subscriptionPlan: 'NONE' | 'MONTHLY' | 'ANNUAL';
  subscriptionRenewsAt?: Date;
  assignedTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK';
  status: 'Active' | 'Pending' | 'Accepted' | 'Revoked' | 'Pending First Login' | 'Password Changed';
  address?: IAddress;
  savedAddresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the nested Address object
const addressSchema = new Schema<IAddress>({
  label: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  recipientName: { type: String, required: true },
  street: { type: String, required: true },
  apartment: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String,
}, { _id: true }); // _id is useful for managing addresses in an array

const shopUserSchema = new Schema<IShopUser>({
  // id is handled by mongoose as _id
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  role: {
    type: String,
    enum: ['SHOP_USER'], // Enforce the value at the database level
    default: 'SHOP_USER',
  },
  accessibleStoresId: [String],
  password: { type: String, required: true, select: false }, // select: false hides it by default
  passwordLastChangedAt: Date,
  avatarUrl: String,
  mobileNumber: String,
  totalSpent: { type: Number, default: 0 },
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
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Accepted', 'Revoked', 'Pending First Login', 'Password Changed'],
    default: 'Pending',
  },
  address: addressSchema,
  savedAddresses: [addressSchema],
}, {
  timestamps: true, // Manages createdAt and updatedAt
});

export default mongoose.model<IShopUser>('ShopUser', shopUserSchema);