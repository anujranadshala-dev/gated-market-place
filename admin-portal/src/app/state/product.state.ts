import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Product, CreateProductDto, ProductStatus, GatedAccessTier } from '../core/models/product.model';
import { AuthStore } from '../core/auth/auth.store';
import { StoreState } from './store.state';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Modern Angular 21 Signal Store for Product Inventory & Catalog Management
 */
@Injectable({
  providedIn: 'root',
})
export class ProductState {
  private readonly authStore = inject(AuthStore);
  private readonly storeState = inject(StoreState);
  private readonly http = inject(HttpClient);

  private readonly _products = signal<Product[]>([]);

  private readonly _searchFilter = signal<string>('');
  private readonly _categoryFilter = signal<string>('ALL');
  private readonly _tierFilter = signal<GatedAccessTier | 'ALL'>('ALL');
  private readonly _selectedStoreScope = signal<string | 'ALL'>('ALL');

  constructor() {
    effect(() => {
      const user = this.authStore.user();
      if (user) {
        this.getProducts();
      } else {
        this._products.set([]);
      }
    });
  }
  readonly products = this._products.asReadonly();
  readonly searchFilter = this._searchFilter.asReadonly();
  readonly categoryFilter = this._categoryFilter.asReadonly();
  readonly tierFilter = this._tierFilter.asReadonly();

  // Computed signals
  readonly currentStoreProducts = computed<Product[]>(() => {
    const assignedStoreId = this.authStore.assignedStoreId();
    if (!assignedStoreId) return [];
    return this._products().filter((p) => p.storeId === assignedStoreId);
  });

  readonly availableCategories = computed<string[]>(() => {
    const unique = new Set(this._products().map((p) => p.category));
    return Array.from(unique);
  });

  readonly filteredProducts = computed<Product[]>(() => {
    const query = this._searchFilter().toLowerCase().trim();
    const cat = this._categoryFilter();
    const tier = this._tierFilter();
    const isSuperAdmin = this.authStore.isSuperAdmin();
    const assignedStoreId = this.authStore.assignedStoreId();

    return this._products().filter((product) => {
      // Role scope check
      if (!isSuperAdmin && assignedStoreId && product.storeId !== assignedStoreId) {
        return false;
      }

      if (isSuperAdmin && this._selectedStoreScope() !== 'ALL' && product.storeId !== this._selectedStoreScope()) {
        return false;
      }

      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.inventory.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCat = cat === 'ALL' || product.category === cat;
      const matchesTier = tier === 'ALL' || product.gatedTier === tier;

      return matchesQuery && matchesCat && matchesTier;
    });
  });

  readonly lowStockProducts = computed<Product[]>(() => {
    const items = this.authStore.isSuperAdmin() ? this._products() : this.currentStoreProducts();
    return items.filter((p) => p.inventory.stockQuantity <= p.inventory.lowStockThreshold);
  });

  readonly totalCatalogValue = computed<number>(() => {
    const items = this.authStore.isSuperAdmin() ? this._products() : this.currentStoreProducts();
    return items.reduce((acc, p) => acc + p.price * p.inventory.stockQuantity, 0);
  });

  // Action methods
  public setSearchFilter(query: string): void {
    this._searchFilter.set(query);
  }

  public setCategoryFilter(cat: string): void {
    this._categoryFilter.set(cat);
  }

  public setTierFilter(tier: GatedAccessTier | 'ALL'): void {
    this._tierFilter.set(tier);
  }

  public setStoreScope(storeId: string | 'ALL'): void {
    this._selectedStoreScope.set(storeId);
  }

  public async getProducts(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ products: any[] }>(`${API_BASE_URL}/products`, { withCredentials: true })
      );

      if (response?.products) {
        const mappedProducts: Product[] = response.products.map((p: any) => ({
          id: p._id || p.id,
          storeId: p.storeId,
          storeName: p.storeName,
          name: p.name,
          slug: p.slug,
          description: p.description,
          category: p.category,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          inventory: p.inventory,
          status: p.status,
          gatedTier: p.gatedTier,
          images: p.images,
          tags: p.tags,
          isFeatured: p.isFeatured,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
        this._products.set(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      this._products.set([]);
    }
  }

  public async addProduct(dto: CreateProductDto): Promise<void> {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload = {
      storeId: dto.storeId,
      name: dto.name,
      slug,
      description: dto.description,
      category: dto.category,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      inventory: {
        stockQuantity: dto.stockQuantity,
        lowStockThreshold: dto.lowStockThreshold,
        sku: dto.sku.toUpperCase(),
        weightKg: 1.0,
      },
      status: 'ACTIVE',
      gatedTier: dto.gatedTier,
      images: [
        dto.imageUrl ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      ],
      tags: dto.tags || ['New Arrival'],
      isFeatured: false,
    };

    try {
      await firstValueFrom(
        this.http.post<{ message: string; productId: string }>(
          `${API_BASE_URL}/create-product`,
          payload,
          { withCredentials: true }
        )
      );

      await this.getProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  public updateProduct(productId: string, updates: Partial<Product>): void {
    this._products.update((prods) =>
      prods.map((p) => (p.id === productId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  }

  public updateStock(productId: string, newStock: number): void {
    this._products.update((prods) =>
      prods.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            inventory: { ...p.inventory, stockQuantity: Math.max(0, newStock) },
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }

  public deleteProduct(productId: string): void {
    this._products.update((prods) => prods.filter((p) => p.id !== productId));
  }
}
