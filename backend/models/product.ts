import mongoose, { Document, Schema } from 'mongoose';

// Interface for the nested inventory object
export interface IProductInventory {
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
  barcode?: string;
  weightKg?: number;
}

// Interface for the Product document
export interface IProduct extends Document {
  storeId: string;
  storeName?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  inventory: IProductInventory;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';
  gatedTier: 'PUBLIC_MEMBER' | 'SILVER' | 'GOLD' | 'VIP_BLACK' | 'INVITATION_ONLY';
  images: string[];
  tags: string[];
  isFeatured: boolean;
  createdAt: Date; // Managed by timestamps
  updatedAt: Date; // Managed by timestamps
}

const productInventorySchema = new Schema<IProductInventory>({
  stockQuantity: { type: Number, required: true },
  lowStockThreshold: { type: Number, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: String,
  weightKg: Number,
}, { _id: false });

const productSchema = new Schema<IProduct>({
  storeId: { type: String, required: true },
  storeName: String,
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: String,
  price: { type: Number, required: true },
  compareAtPrice: Number,
  costPrice: Number,
  inventory: productInventorySchema,
  status: {
    type: String,
    enum: ['ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED'],
    default: 'DRAFT'
  },
  gatedTier: {
    type: String,
    enum: ['PUBLIC_MEMBER', 'SILVER', 'GOLD', 'VIP_BLACK', 'INVITATION_ONLY'],
    default: 'PUBLIC_MEMBER'
  },
  images: [String],
  tags: [String],
  isFeatured: { type: Boolean, default: false },
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

export default mongoose.model<IProduct>('Product', productSchema);