/**
 * Store Entity Model - MongoDB Schema Alignment
 * B2B2C Gated Merchant Tenant Entity
 */

export type StoreStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'ARCHIVED';
export type StoreTier = 'STARTER' | 'PREMIUM_BRAND' | 'LUXURY_EXCLUSIVE' | 'ENTERPRISE';

export interface GatingConfig {
  requireInvitation: boolean;
  allowedEmailDomains: string[];
  minimumLoyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK';
  autoApproveWhitelist: boolean;
}

export interface StoreMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeProductsCount: number;
  invitedCustomersCount: number;
  averageOrderValue: number;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  description: string;
  status: StoreStatus;
  tier: StoreTier;
  logoUrl: string;
  bannerUrl?: string;
  currency: string;
  gatingConfig: GatingConfig;
  metrics: StoreMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreDto {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerName: string;
  description: string;
  tier: StoreTier;
  gatingConfig: Partial<GatingConfig>;
}
