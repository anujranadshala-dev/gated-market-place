import mongoose, { Document, Schema } from 'mongoose';

// Sub-document interfaces
interface ICustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK';
}

interface IShippingAddress {
  recipientName: string;
  street: string;
  suite?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface IOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isGatedExclusive: boolean;
  imageUrl?: string;
}

interface ILogistics {
  shippingNotes?: string;
  carrierName?: string;
  trackingNumber?: string;
  driverName?: string;
  driverPhone?: string;
  dispatchedAt?: Date;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
}

// Main document interface
export interface IOrder extends Document {
  orderNumber: string;
  storeId: string;
  storeName: string;
  customer: ICustomer;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: 'Pending' | 'Packed' | 'Out_for_Delivery' | 'Delivered' | 'Cancelled';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  logistics: ILogistics;
  packedAt?: Date;
  packedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sub-document schemas
const customerSchema = new Schema<ICustomer>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  tier: { type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'VIP_BLACK'] },
}, { _id: false });

const shippingAddressSchema = new Schema<IShippingAddress>({
  recipientName: { type: String, required: true },
  street: { type: String, required: true },
  suite: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  isGatedExclusive: { type: Boolean, default: false },
  imageUrl: String,
}, { _id: false });

const logisticsSchema = new Schema<ILogistics>({
  shippingNotes: String,
  carrierName: String,
  trackingNumber: String,
  driverName: String,
  driverPhone: String,
  dispatchedAt: Date,
  estimatedDeliveryDate: Date,
  deliveredAt: Date,
}, { _id: false });

// Main schema
const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  storeId: { type: String, required: true },
  storeName: String,
  customer: customerSchema,
  shippingAddress: shippingAddressSchema,
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Packed', 'Out_for_Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING', 'FAILED'],
    default: 'PENDING',
  },
  logistics: logisticsSchema,
  packedAt: Date,
  packedByUserId: String,
}, {
  timestamps: true,
});

export default mongoose.model<IOrder>('Order', orderSchema);