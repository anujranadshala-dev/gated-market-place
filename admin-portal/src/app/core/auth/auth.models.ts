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
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface BackendLoginResponse {
  message: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    assignedStoreId?: string;
  };
}

export interface BackendMeResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    assignedStoreId?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    avatarUrl: string
  };
}

export interface BackendRegisterResponse {
  message: string;
  userId: string;
}

export interface GatedPermission {
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'DISPATCH' | 'OVERSEE';
  resource: 'STORES' | 'PRODUCTS' | 'ORDERS' | 'INVITATIONS' | 'LOGISTICS' | 'USERS';
}