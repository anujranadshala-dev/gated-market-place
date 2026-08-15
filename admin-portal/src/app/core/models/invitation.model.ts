/**
 * Customer Access & Credential Entity Model - Gated Marketplace System
 * Manages provisioned client accounts, usernames, temporary passwords, and credential lifecycle.
 *
 * Tier Progression Logic:
 * - BRONZE: Base initial tier ($0 - $2,499 spend)
 * - SILVER: Automatically reached when total spend >= $2,500 ($2,500 - $9,999)
 * - GOLD: Automatically reached when total spend >= $10,000
 * - VIP_BLACK: Exclusive subscription-based tier (VIP Black Concierge Membership)
 */

export type InviteStatus = 'Active' | 'Password Changed' | 'Pending First Login' | 'Revoked' | 'Pending' | 'Accepted';
export type CustomerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK';

export interface CustomerInvitation {
  id: string;
  storeId: string;
  storeName: string;
  recipientEmail: string;
  recipientName?: string;
  username: string;
  tempPassword: string;
  isTempPassword: boolean;
  mustChangePassword: boolean;
  passwordLastChangedAt?: string;
  
  // Spend & Subscription Based Tier Progression
  totalSpend: number;
  hasVipBlackSubscription: boolean;
  subscriptionPlan?: 'MONTHLY' | 'ANNUAL' | 'NONE';
  subscriptionRenewsAt?: string;
  assignedTier: CustomerTier;

  inviteCode?: string;
  customMessage?: string;
  status: InviteStatus;
  sentByUserId: string;
  sentAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  allowedRedemptions?: number;
  redemptionCount?: number;
}

export interface SendInvitationDto {
  storeId: string;
  recipientEmail: string;
  recipientName?: string;
  username?: string;
  tempPassword?: string;
  customMessage?: string;
  mustChangePassword?: boolean;
  validityDays?: number;
}

/**
 * Pure function to calculate customer tier based on spend and subscription
 */
export function calculateCustomerTier(
  totalSpend: number,
  hasVipBlackSubscription: boolean
): CustomerTier {
  if (hasVipBlackSubscription) {
    return 'VIP_BLACK';
  }
  if (totalSpend >= 10000) {
    return 'GOLD';
  }
  if (totalSpend >= 2500) {
    return 'SILVER';
  }
  return 'BRONZE';
}

/**
 * Returns progression detail to next spend tier or subscription status
 */
export function getCustomerTierProgress(
  totalSpend: number,
  hasVipBlackSubscription: boolean
): {
  currentTier: CustomerTier;
  nextTier: CustomerTier | null;
  currentSpend: number;
  nextTierThreshold: number;
  remainingToNextTier: number;
  progressPercent: number;
  isSubscriptionActive: boolean;
} {
  const currentTier = calculateCustomerTier(totalSpend, hasVipBlackSubscription);

  if (hasVipBlackSubscription) {
    return {
      currentTier: 'VIP_BLACK',
      nextTier: null,
      currentSpend: totalSpend,
      nextTierThreshold: 0,
      remainingToNextTier: 0,
      progressPercent: 100,
      isSubscriptionActive: true,
    };
  }

  if (totalSpend >= 10000) {
    return {
      currentTier: 'GOLD',
      nextTier: 'VIP_BLACK', // Can only upgrade to VIP Black via subscription
      currentSpend: totalSpend,
      nextTierThreshold: 10000,
      remainingToNextTier: 0,
      progressPercent: 100,
      isSubscriptionActive: false,
    };
  }

  if (totalSpend >= 2500) {
    const remaining = 10000 - totalSpend;
    const progress = Math.min(100, Math.round(((totalSpend - 2500) / 7500) * 100));
    return {
      currentTier: 'SILVER',
      nextTier: 'GOLD',
      currentSpend: totalSpend,
      nextTierThreshold: 10000,
      remainingToNextTier: remaining,
      progressPercent: progress,
      isSubscriptionActive: false,
    };
  }

  // Bronze
  const remaining = 2500 - totalSpend;
  const progress = Math.min(100, Math.round((totalSpend / 2500) * 100));
  return {
    currentTier: 'BRONZE',
    nextTier: 'SILVER',
    currentSpend: totalSpend,
    nextTierThreshold: 2500,
    remainingToNextTier: remaining,
    progressPercent: progress,
    isSubscriptionActive: false,
  };
}
