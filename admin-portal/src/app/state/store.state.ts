import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Store, CreateStoreDto, StoreStatus, StoreTier } from '../core/models/store.model';
import { AuthStore } from '../core/auth/auth.store';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Modern Angular 21 Signal Store for Store Management & Multi-Tenant Oversight
 */
@Injectable({
  providedIn: 'root',
})
export class StoreState {
  private readonly authStore = inject(AuthStore);
  private readonly http = inject(HttpClient);

  private readonly _stores = signal<Store[]>([]);

  private readonly _selectedStoreId = signal<string | null>(null);
  private readonly _searchQuery = signal<string>('');
  private readonly _tierFilter = signal<StoreTier | 'ALL'>('ALL');

  // Readonly Signals
  readonly stores = this._stores.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly tierFilter = this._tierFilter.asReadonly();
  readonly selectedStoreId = this._selectedStoreId.asReadonly();

  constructor() {
    effect(() => {
      const user = this.authStore.user();
      if (user) {
        this.getStores();
      } else {
        this._stores.set([]);
        this._selectedStoreId.set(null);
      }
    });
  }

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

  public clearSelectedStore(): void {
    this._selectedStoreId.set(null);
  }

  public getSelectedStoreName(): string | null {
    const id = this._selectedStoreId();
    if (!id) return null;
    return this._stores().find((s) => s.id === id)?.name ?? null;
  }

  public async getStores(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ stores: any[] }>(`${API_BASE_URL}/stores`, { withCredentials: true })
      );

      if (response?.stores) {
        const mappedStores: Store[] = response.stores.map((s: any) => ({
          id: s._id || s.id,
          name: s.name,
          slug: s.slug,
          ownerId: s.ownerId,
          ownerName: s.ownerName,
          ownerEmail: s.ownerEmail,
          description: s.description,
          status: s.status,
          tier: s.tier || 'STARTER',
          logoUrl: s.logoUrl,
          currency: s.currency,
          gatingConfig: s.gatingConfig,
          metrics: s.metrics,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        }));
        this._stores.set(mappedStores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      this._stores.set([]);
    }
  }

  public async createStore(dto: CreateStoreDto): Promise<void> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const ownerId = `own_${dto.ownerEmail.replace(/[^a-z0-9]/g, '_').toLowerCase()}`;
    const payload = {
      ownerId,
      ownerEmail: dto.ownerEmail,
      name: dto.name,
      slug,
      ownerName: dto.ownerName,
      description: dto.description,
      tier: dto.tier,
      status: 'ACTIVE',
      logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80',
      currency: 'INR',
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
    };

    try {
      await firstValueFrom(
        this.http.post<{ message: string; storeId: string }>(
          `${API_BASE_URL}/create-store`,
          payload,
          { withCredentials: true }
        )
      );

      await this.getStores();
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  public async updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put<{ message: string; store: any }>(
          `${API_BASE_URL}/stores/${storeId}`,
          updates,
          { withCredentials: true }
        )
      );

      await this.getStores();
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  }

  public async updateStoreStatus(storeId: string, status: StoreStatus): Promise<void> {
    await this.updateStore(storeId, { status });
  }

  public async deleteStore(storeId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<{ message: string }>(
          `${API_BASE_URL}/stores/${storeId}`,
          { withCredentials: true }
        )
      );

      this._stores.update((stores) => stores.filter((s) => s.id !== storeId));
      if (this._selectedStoreId() === storeId) {
        this._selectedStoreId.set(null);
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  }
}
