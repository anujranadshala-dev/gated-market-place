import { Injectable, computed, signal, inject } from '@angular/core';
import { Store, CreateStoreDto, StoreStatus, StoreTier } from '../core/models/store.model';
import { AuthStore } from '../core/auth/auth.store';

/**
 * Modern Angular 21 Signal Store for Store Management & Multi-Tenant Oversight
 */
@Injectable({
  providedIn: 'root',
})
export class StoreState {
  private readonly authStore = inject(AuthStore);

  // Initial Seed Data for B2B2C Gated Ecosystem
  private readonly _stores = signal<Store[]>([
    {
      id: 'str_vance_01',
      name: 'Vance Luxury Atelier',
      slug: 'vance-luxury-atelier',
      ownerId: 'usr_owner_01',
      ownerName: 'Eleanor Vance',
      ownerEmail: 'eleanor@vance-atelier.com',
      description: 'Handcrafted bespoke leather goods and high-horology accessories for verified private patrons.',
      status: 'ACTIVE',
      tier: 'LUXURY_EXCLUSIVE',
      logoUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150&auto=format&fit=crop&q=80',
      currency: 'USD',
      gatingConfig: {
        requireInvitation: true,
        allowedEmailDomains: ['vance-atelier.com', 'private-client.com'],
        minimumLoyaltyTier: 'GOLD',
        autoApproveWhitelist: true,
      },
      metrics: {
        totalRevenue: 248900,
        totalOrders: 142,
        activeProductsCount: 18,
        invitedCustomersCount: 380,
        averageOrderValue: 1752,
      },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-02-01T15:30:00Z',
    },
    {
      id: 'str_aethel_02',
      name: 'Aethelgard Rare Botanicals',
      slug: 'aethelgard-rare-botanicals',
      ownerId: 'usr_owner_02',
      ownerName: 'Marcus Thorne',
      ownerEmail: 'marcus@aethelgard.co',
      description: 'Exclusive artisanal fragrances distilled in micro-batches from heritage Alpine estates.',
      status: 'ACTIVE',
      tier: 'PREMIUM_BRAND',
      logoUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=150&auto=format&fit=crop&q=80',
      currency: 'USD',
      gatingConfig: {
        requireInvitation: true,
        allowedEmailDomains: [],
        minimumLoyaltyTier: 'SILVER',
        autoApproveWhitelist: false,
      },
      metrics: {
        totalRevenue: 134500,
        totalOrders: 98,
        activeProductsCount: 12,
        invitedCustomersCount: 210,
        averageOrderValue: 1372,
      },
      createdAt: '2025-01-18T12:00:00Z',
      updatedAt: '2025-02-10T09:15:00Z',
    },
    {
      id: 'str_zenith_03',
      name: 'Zenith Haute Audio',
      slug: 'zenith-haute-audio',
      ownerId: 'usr_owner_03',
      ownerName: 'Clara Oswald',
      ownerEmail: 'clara@zenith-audio.ch',
      description: 'Bespoke vacuum-tube amplifiers and planar acoustic transducers for discerning audiophiles.',
      status: 'ACTIVE',
      tier: 'ENTERPRISE',
      logoUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=150&auto=format&fit=crop&q=80',
      currency: 'USD',
      gatingConfig: {
        requireInvitation: true,
        allowedEmailDomains: ['audiophile-club.org'],
        minimumLoyaltyTier: 'VIP_BLACK',
        autoApproveWhitelist: true,
      },
      metrics: {
        totalRevenue: 412000,
        totalOrders: 64,
        activeProductsCount: 8,
        invitedCustomersCount: 145,
        averageOrderValue: 6437,
      },
      createdAt: '2024-12-05T08:30:00Z',
      updatedAt: '2025-02-12T14:00:00Z',
    },
    {
      id: 'str_solaris_04',
      name: 'Solaris Precision Optics',
      slug: 'solaris-precision-optics',
      ownerId: 'usr_owner_04',
      ownerName: 'Dr. Evelyn Reed',
      ownerEmail: 'evelyn@solaris-optics.de',
      description: 'German-engineered titanium eyewear and optical sapphire camera lenses.',
      status: 'PENDING_APPROVAL',
      tier: 'STARTER',
      logoUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=150&auto=format&fit=crop&q=80',
      currency: 'EUR',
      gatingConfig: {
        requireInvitation: false,
        allowedEmailDomains: [],
        minimumLoyaltyTier: 'BRONZE',
        autoApproveWhitelist: false,
      },
      metrics: {
        totalRevenue: 0,
        totalOrders: 0,
        activeProductsCount: 4,
        invitedCustomersCount: 12,
        averageOrderValue: 0,
      },
      createdAt: '2025-02-11T16:20:00Z',
      updatedAt: '2025-02-11T16:20:00Z',
    },
  ]);

  private readonly _selectedStoreId = signal<string | null>(null);
  private readonly _searchQuery = signal<string>('');
  private readonly _tierFilter = signal<StoreTier | 'ALL'>('ALL');

  // Readonly Signals
  readonly stores = this._stores.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly tierFilter = this._tierFilter.asReadonly();

  // Computed Signals
  readonly currentStoreOwnerStore = computed<Store | null>(() => {
    const assignedId = this.authStore.assignedStoreId();
    if (!assignedId) return null;
    return this._stores().find((s) => s.id === assignedId) ?? null;
  });

  readonly activeStore = computed<Store | null>(() => {
    if (this.authStore.isStoreOwner()) {
      return this.currentStoreOwnerStore();
    }
    const selectedId = this._selectedStoreId();
    if (selectedId) {
      return this._stores().find((s) => s.id === selectedId) ?? null;
    }
    return this._stores()[0] ?? null;
  });

  readonly filteredStores = computed<Store[]>(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const tier = this._tierFilter();

    return this._stores().filter((store) => {
      const matchesQuery =
        !query ||
        store.name.toLowerCase().includes(query) ||
        store.ownerName.toLowerCase().includes(query) ||
        store.ownerEmail.toLowerCase().includes(query) ||
        store.slug.toLowerCase().includes(query);

      const matchesTier = tier === 'ALL' || store.tier === tier;

      return matchesQuery && matchesTier;
    });
  });

  readonly totalMarketplaceGMV = computed<number>(() => {
    return this._stores().reduce((acc, s) => acc + s.metrics.totalRevenue, 0);
  });

  readonly totalPlatformOrders = computed<number>(() => {
    return this._stores().reduce((acc, s) => acc + s.metrics.totalOrders, 0);
  });

  readonly activeStoresCount = computed<number>(() => {
    return this._stores().filter((s) => s.status === 'ACTIVE').length;
  });

  // State Mutation Actions
  public setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  public setTierFilter(tier: StoreTier | 'ALL'): void {
    this._tierFilter.set(tier);
  }

  public selectStore(storeId: string | null): void {
    this._selectedStoreId.set(storeId);
  }

  public createStore(dto: CreateStoreDto): Store {
    const newStore: Store = {
      id: `str_${Date.now().toString(36)}`,
      name: dto.name,
      slug: dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ownerId: `usr_${Date.now().toString(36)}`,
      ownerName: dto.ownerName,
      ownerEmail: dto.ownerEmail,
      description: dto.description,
      status: 'ACTIVE',
      tier: dto.tier,
      logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80',
      currency: 'USD',
      gatingConfig: {
        requireInvitation: dto.gatingConfig.requireInvitation ?? true,
        allowedEmailDomains: dto.gatingConfig.allowedEmailDomains ?? [],
        minimumLoyaltyTier: dto.gatingConfig.minimumLoyaltyTier ?? 'SILVER',
        autoApproveWhitelist: dto.gatingConfig.autoApproveWhitelist ?? false,
      },
      metrics: {
        totalRevenue: 0,
        totalOrders: 0,
        activeProductsCount: 0,
        invitedCustomersCount: 0,
        averageOrderValue: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this._stores.update((stores) => [newStore, ...stores]);
    return newStore;
  }

  public updateStore(storeId: string, updates: Partial<Store>): void {
    this._stores.update((stores) =>
      stores.map((s) => (s.id === storeId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
  }

  public updateStoreStatus(storeId: string, status: StoreStatus): void {
    this.updateStore(storeId, { status });
  }

  public deleteStore(storeId: string): void {
    this._stores.update((stores) => stores.filter((s) => s.id !== storeId));
    if (this._selectedStoreId() === storeId) {
      this._selectedStoreId.set(null);
    }
  }
}
