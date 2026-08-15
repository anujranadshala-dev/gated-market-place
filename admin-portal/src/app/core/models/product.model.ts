/**
 * Product Entity Model - MongoDB Schema Alignment
 * Gated Catalog Items with Tier-based Access and Stock Controls
 */

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';
export type GatedAccessTier = 'PUBLIC_MEMBER' | 'SILVER' | 'GOLD' | 'VIP_BLACK' | 'INVITATION_ONLY';

export interface ProductInventory {
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
  barcode?: string;
  weightKg?: number;
}

export interface Product {
  id: string;
  storeId: string;
  storeName?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  inventory: ProductInventory;
  status: ProductStatus;
  gatedTier: GatedAccessTier;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  storeId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
  gatedTier: GatedAccessTier;
  tags?: string[];
  imageUrl?: string;
}
