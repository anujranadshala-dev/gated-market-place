/**
 * Core Authentication & Role-Based Access Control (RBAC) Models
 * Strict Angular 21 Architecture for B2B2C Gated Marketplace
 */

export type UserRole = 'SUPER_ADMIN' | 'STORE_OWNER' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  assignedStoreId?: string; // Present for STORE_OWNER
  assignedStoreName?: string;
  createdAt: string;
  lastLoginAt: string;
  isVerified: boolean;
}

export interface AuthSession {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
  storeId?: string;
}

export interface GatedPermission {
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'DISPATCH' | 'OVERSEE';
  resource: 'STORES' | 'PRODUCTS' | 'ORDERS' | 'INVITATIONS' | 'LOGISTICS' | 'USERS';
}
