import { GatedTierLevel, GatedTierConfig, User, Order, Store } from '../types';

export const GATED_TIERS: Record<GatedTierLevel, GatedTierConfig> = {
  'Bronze': {
    tier: 'Bronze',
    level: 'Bronze',
    name: 'Bronze Member',
    badge: 'Bronze Member',
    minSpend: 0,
    discountPercent: 0,
    badgeColor: 'text-amber-800 dark:text-amber-300',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    icon: '🥉',
    iconName: 'Shield',
    shippingPerk: 'Standard shipping (₹799 or free over ₹12,000)',
    perks: [
      'Welcome member pricing on all invited stores',
      'Track real-time order history & spend metrics',
      'Custom delivery address book management',
      'Earn spend progress with every order toward Silver'
    ]
  },
  'Silver': {
    tier: 'Silver',
    level: 'Silver',
    name: 'Silver VIP',
    badge: 'Silver VIP',
    minSpend: 250000,
    discountPercent: 5,
    badgeColor: 'text-slate-700 dark:text-slate-200',
    badgeBg: 'bg-slate-200/90 dark:bg-slate-800',
    badgeBorder: 'border-slate-400 dark:border-slate-600',
    badgeClass: 'bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-600',
    icon: '🥈',
    iconName: 'Award',
    shippingPerk: 'Free shipping on orders over ₹6,000',
    perks: [
      'Automatic 5% extra discount on every cart',
      'Free shipping threshold lowered to ₹6,000',
      'Priority customer support queue',
      'Spend progress tracked toward Gold Elite status'
    ]
  },
  'Gold': {
    tier: 'Gold',
    level: 'Gold',
    name: 'Gold Elite',
    badge: 'Gold Elite',
    minSpend: 1000000,
    discountPercent: 10,
    badgeColor: 'text-amber-900 dark:text-amber-200',
    badgeBg: 'bg-gradient-to-r from-amber-200 to-yellow-300 dark:from-amber-950 dark:to-yellow-900',
    badgeBorder: 'border-amber-400 dark:border-amber-700',
    badgeClass: 'bg-gradient-to-r from-amber-200 to-yellow-300 dark:from-amber-950 dark:to-yellow-900 text-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-700',
    icon: '🥇',
    iconName: 'Crown',
    shippingPerk: 'Free standard shipping on all orders',
    perks: [
      'Automatic 10% extra discount on every cart across all stores',
      '100% Free standard shipping on all orders (no minimum)',
      'Priority warehouse picking and 48hr SLA',
      'Dedicated account specialist and exclusive seasonal offers'
    ]
  },
  'VIP Black': {
    tier: 'VIP Black',
    level: 'VIP Black',
    name: 'VIP Black Reserve',
    badge: 'VIP Black Reserve',
    minSpend: 0, // Subscription based
    discountPercent: 15,
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-gradient-to-r from-slate-950 via-zinc-900 to-black',
    badgeBorder: 'border-amber-500/70 shadow-amber-500/10 shadow-lg',
    badgeClass: 'bg-gradient-to-r from-slate-950 via-zinc-900 to-black text-amber-400 border border-amber-500/70 shadow-amber-500/10 shadow-lg',
    icon: '👑',
    iconName: 'Sparkles',
    isSubscription: true,
    shippingPerk: 'Free Priority Express 1-Day Air on all orders',
    perks: [
      'Automatic 15% VIP store-wide discount',
      'Free 1-Day Priority Air shipping on all orders',
      'Zero MOQ requirements on all parts & wholesale catalogs',
      '24/7 VIP Concierge & White-Glove fulfillment'
    ]
  }
};

export const TIER_RANK: Record<GatedTierLevel, number> = {
  'Bronze': 1,
  'Silver': 2,
  'Gold': 3,
  'VIP Black': 4
};

/**
 * Calculates user's lifetime total spend across all recorded orders + baseline spend
 */
export function getUserLifetimeSpend(user?: User | null, orders?: Order[]): number {
  if (!user) return 0;
  
  let orderSpend = 0;
  if (orders && orders.length > 0) {
    orderSpend = orders
      .filter((o) => o.userId === user.id || o.userEmail === user.email)
      .reduce((sum, o) => sum + o.grandTotal, 0);
  }

  // Combine with initial baseline spend on user record if any
  const baseSpend = user.totalSpent || 0;
  return Math.max(baseSpend, Math.round((baseSpend + orderSpend) * 100) / 100);
}

/**
 * Computes Assigned Gated Tier automatically based on user's spend and VIP Black subscription.
 * Does NOT need manual setting.
 */
export function getUserGatedTier(user?: User | null, orders?: Order[]): GatedTierLevel {
  if (!user) return 'Bronze';

  // 1. VIP Black is subscription-based
  if (user.isVipBlackSubscribed) {
    return 'VIP Black';
  }

  const spend = getUserLifetimeSpend(user, orders);

  // 2. Spend-based automatic progression
  if (spend >= GATED_TIERS['Gold'].minSpend) {
    return 'Gold';
  }
  if (spend >= GATED_TIERS['Silver'].minSpend) {
    return 'Silver';
  }

  return 'Bronze';
}

/**
 * Returns progress information towards the next tier.
 */
export function getTierProgress(user?: User | null, orders?: Order[]) {
  const currentTier = getUserGatedTier(user, orders);
  const totalSpent = getUserLifetimeSpend(user, orders);
  const isVipBlack = user?.isVipBlackSubscribed || currentTier === 'VIP Black';

  if (isVipBlack) {
    return {
      currentTier: 'VIP Black' as GatedTierLevel,
      currentTierConfig: GATED_TIERS['VIP Black'],
      nextTier: null,
      nextTierConfig: null,
      totalSpent,
      targetSpend: 0,
      minSpendRequired: 0,
      remainingSpend: 0,
      progressPercent: 100,
      isMaxSpendTier: true,
      isVipBlack: true
    };
  }

  if (currentTier === 'Gold') {
    return {
      currentTier: 'Gold' as GatedTierLevel,
      currentTierConfig: GATED_TIERS['Gold'],
      nextTier: 'VIP Black' as GatedTierLevel,
      nextTierConfig: GATED_TIERS['VIP Black'],
      totalSpent,
      targetSpend: GATED_TIERS['Gold'].minSpend,
      minSpendRequired: GATED_TIERS['Gold'].minSpend,
      remainingSpend: 0,
      progressPercent: 100,
      isMaxSpendTier: true,
      isVipBlack: false
    };
  }

  if (currentTier === 'Silver') {
    const goldThreshold = GATED_TIERS['Gold'].minSpend;
    const silverThreshold = GATED_TIERS['Silver'].minSpend;
    const remainingSpend = Math.max(0, goldThreshold - totalSpent);
    const range = goldThreshold - silverThreshold;
    const progressInTier = totalSpent - silverThreshold;
    const progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / range) * 100)));

    return {
      currentTier: 'Silver' as GatedTierLevel,
      currentTierConfig: GATED_TIERS['Silver'],
      nextTier: 'Gold' as GatedTierLevel,
      nextTierConfig: GATED_TIERS['Gold'],
      totalSpent,
      targetSpend: goldThreshold,
      minSpendRequired: silverThreshold,
      remainingSpend: Math.round(remainingSpend * 100) / 100,
      progressPercent,
      isMaxSpendTier: false,
      isVipBlack: false
    };
  }

  // Bronze
  const silverThreshold = GATED_TIERS['Silver'].minSpend;
  const remainingSpend = Math.max(0, silverThreshold - totalSpent);
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalSpent / silverThreshold) * 100)));

  return {
    currentTier: 'Bronze' as GatedTierLevel,
    currentTierConfig: GATED_TIERS['Bronze'],
    nextTier: 'Silver' as GatedTierLevel,
    nextTierConfig: GATED_TIERS['Silver'],
    totalSpent,
    targetSpend: silverThreshold,
    minSpendRequired: 0,
    remainingSpend: Math.round(remainingSpend * 100) / 100,
    progressPercent,
    isMaxSpendTier: false,
    isVipBlack: false
  };
}

/**
 * Checks if a user has access to a store based on their direct invitations or VIP status.
 * Stores do not require tiers; tiers are earned by the user over time through spending to get offers & discounts.
 */
export function checkStoreTierAccess(
  store: Store,
  userTier: GatedTierLevel,
  accessibleStoreIds: string[] = []
): {
  isAccessible: boolean;
  isUnlocked: boolean;
  unlockedByTier: boolean;
  unlockedByInvite: boolean;
  unlockedByVipBlack: boolean;
  requiredTier: GatedTierLevel;
  spendNeeded: number;
} {
  const isVipBlack = userTier === 'VIP Black';
  const unlockedByInvite = accessibleStoreIds.includes(store.id);
  const unlockedByVipBlack = isVipBlack;

  // Store access is granted if the user is invited to this store or holds VIP Black
  const isAccessible = unlockedByInvite || unlockedByVipBlack;

  return {
    isAccessible,
    isUnlocked: isAccessible,
    unlockedByTier: false,
    unlockedByInvite,
    unlockedByVipBlack,
    requiredTier: 'Bronze',
    spendNeeded: 0
  };
}
