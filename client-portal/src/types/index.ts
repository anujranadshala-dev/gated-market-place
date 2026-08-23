export interface PriceTier {
  minQuantity: number;
  discountPercentage: number;
  unitPrice: number;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  moq: number; // Minimum Order Quantity
  stock: number;
  inStock: boolean;
  leadTimeDays: number;
  taxRate: number; // e.g. 0.0825 (8.25%)
  featuredOffer?: string;
  priceTiers: PriceTier[];
  specifications: Record<string, string>;
  imageUrl: string;
  complianceTags: string[];
  requiredTier?: GatedTierLevel; // Optional product-level tier gating
}

export type GatedTierLevel = 'Bronze' | 'Silver' | 'Gold' | 'VIP Black';

export interface GatedTierConfig {
  tier: GatedTierLevel;
  level?: GatedTierLevel;
  name: string;
  badge?: string;
  minSpend: number; // 0 for Bronze, 500 for Silver, 2000 for Gold
  discountPercent: number; // 0% Bronze, 5% Silver, 10% Gold, 15% VIP Black
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeClass?: string;
  icon?: string;
  iconName: string;
  shippingPerk: string;
  perks: string[];
  isSubscription?: boolean;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  accessTier: 'Standard' | 'VIP Gold' | 'Enterprise Exclusive' | 'Restricted Partner';
  requiresApproval: boolean;
  taxDefaultRate: number;
  currency: string;
  contactEmail: string;
  slaGuarantee: string;
  activePromos: {
    code: string;
    description: string;
    discountPercent: number;
  }[];
  totalProductsCount: number;
}

export interface UserAddress {
  id?: string;
  label?: string; // 'Home', 'Work', 'Other'
  isDefault?: boolean;
  recipientName?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface User {
  id?: string;
  username: string; // Store-issued username
  email: string;
  fullName: string;
  organization?: string;
  role: 'REGULAR_SHOPPER' | 'PRIME_MEMBER' | 'VIP_SHOPPER' | string;
  accessibleStores: string[]; // Store IDs accessible to this shopper
  hasCompletedPasswordSetup: boolean;
  isTemporaryPassword?: boolean; // true if still using the store-issued temp password
  currentPassword?: string; // active password
  temporaryPassword?: string; // original temporary password
  passwordChangedAt?: string;
  avatarUrl?: string;
  mobileNumber?: string;
  phone?: string;
  address?: UserAddress;
  savedAddresses?: UserAddress[];
  creditLimit?: number;
  creditUsed?: number;
  taxExemptNumber?: string;
  
  // Assigned Gated Tier & Spend progression fields
  totalSpent?: number; // Increases automatically as user spends on store
  isVipBlackSubscribed?: boolean; // VIP Black subscription status
  vipBlackSubscriptionPlan?: 'monthly' | 'annual';
  vipBlackSubscribedAt?: string;
  vipBlackExpiresAt?: string;
}

export interface StoreWelcomeCredential {
  id: string;
  storeName: string;
  storeLogo: string;
  recipientName: string;
  email: string;
  username: string;
  tempPassword: string;
  accessibleStores: string[];
  issuedAt: string;
  note: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  appliedUnitPrice: number;
  appliedDiscountPercent: number;
  itemSubtotal: number;
  itemTax: number;
  storeId: string;
  storeName: string;
}

export interface Order {
  id?: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  organization: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  tierDiscountAmount?: number; // Automatic discount from Assigned Gated Tier
  tierDiscountPercent?: number;
  appliedGatedTier?: GatedTierLevel;
  taxTotal: number;
  shippingFee: number;
  grandTotal: number;
  status: 'Pending' | 'Approved' | 'Processing' | 'Shipped' | 'Cancelled';
  paymentMethod: 'PO_INVOICE' | 'CORPORATE_CARD' | 'WIRE_TRANSFER' | 'NET_30';
  poNumber?: string;
  shippingAddress: {
    recipientName: string;
    company: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  createdAt: string;
  storeIds: string[];
}

export interface MagicTokenValidation {
  valid: boolean;
  email: string;
  targetOrganization: string;
  grantedStores: string[];
  expiresInMinutes: number;
}
