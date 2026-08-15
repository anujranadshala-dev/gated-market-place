import { Injectable, computed, signal, inject } from '@angular/core';
import { Product, CreateProductDto, ProductStatus, GatedAccessTier } from '../core/models/product.model';
import { AuthStore } from '../core/auth/auth.store';
import { StoreState } from './store.state';

/**
 * Modern Angular 21 Signal Store for Product Inventory & Catalog Management
 */
@Injectable({
  providedIn: 'root',
})
export class ProductState {
  private readonly authStore = inject(AuthStore);
  private readonly storeState = inject(StoreState);

  // Initial Product Seeds across multi-tenant stores
  private readonly _products = signal<Product[]>([
    {
      id: 'prod_01',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      name: 'Vanguard Hand-Stitched Leather Briefcase',
      slug: 'vanguard-leather-briefcase',
      description: 'Vegetable-tanned bridle leather with solid brass hardware, serialized brass tag, and suede interior lining.',
      category: 'Leather Goods',
      price: 2450,
      compareAtPrice: 2800,
      inventory: {
        stockQuantity: 14,
        lowStockThreshold: 3,
        sku: 'VNC-BRF-001',
        weightKg: 2.4,
      },
      status: 'ACTIVE',
      gatedTier: 'GOLD',
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      ],
      tags: ['Bespoke', 'Heritage', 'Gated Exclusive'],
      isFeatured: true,
      createdAt: '2025-01-12T10:00:00Z',
      updatedAt: '2025-02-01T11:00:00Z',
    },
    {
      id: 'prod_02',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      name: 'Chronos Horology Travel Roll (Quad)',
      slug: 'chronos-horology-travel-roll',
      description: 'Alcantara-cushioned watch roll with modular dividers for up to 4 timepieces.',
      category: 'Accessories',
      price: 890,
      compareAtPrice: 950,
      inventory: {
        stockQuantity: 28,
        lowStockThreshold: 5,
        sku: 'VNC-WTR-004',
        weightKg: 0.8,
      },
      status: 'ACTIVE',
      gatedTier: 'SILVER',
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      ],
      tags: ['Watches', 'Travel'],
      isFeatured: true,
      createdAt: '2025-01-14T09:00:00Z',
      updatedAt: '2025-01-20T14:30:00Z',
    },
    {
      id: 'prod_03',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      name: 'Black Label Monogrammed Desk Pad',
      slug: 'black-label-desk-pad',
      description: 'Top-grain Tuscan calfskin with weighted corners and micro-textured mouse-friendly surface.',
      category: 'Workspace',
      price: 420,
      inventory: {
        stockQuantity: 45,
        lowStockThreshold: 10,
        sku: 'VNC-DSK-012',
        weightKg: 1.1,
      },
      status: 'ACTIVE',
      gatedTier: 'PUBLIC_MEMBER',
      images: [
        'https://images.unsplash.com/photo-1585776245993-841961e6878b?w=600&auto=format&fit=crop&q=80',
      ],
      tags: ['Office', 'Desk'],
      isFeatured: false,
      createdAt: '2025-01-16T15:00:00Z',
      updatedAt: '2025-01-16T15:00:00Z',
    },
    {
      id: 'prod_04',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      name: 'Sovereign Damascus Steel Cigar Cutter',
      slug: 'sovereign-damascus-cigar-cutter',
      description: 'Pattern-welded Damascus steel with titanium screws and hand-polished mirror bevels.',
      category: 'Accessories',
      price: 1350,
      inventory: {
        stockQuantity: 2, // Low stock!
        lowStockThreshold: 4,
        sku: 'VNC-ACC-99',
        weightKg: 0.3,
      },
      status: 'ACTIVE',
      gatedTier: 'VIP_BLACK',
      images: [
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
      ],
      tags: ['Collector', 'Limited Edition'],
      isFeatured: true,
      createdAt: '2025-01-20T16:00:00Z',
      updatedAt: '2025-02-05T12:00:00Z',
    },
    {
      id: 'prod_05',
      storeId: 'str_aethel_02',
      storeName: 'Aethelgard Rare Botanicals',
      name: 'Nocturne Alpine Oud Parfum Extrait 50ml',
      slug: 'nocturne-alpine-oud-extrait',
      description: 'Wild-harvested cedarwood, dark amber resin, and Himalayan oud macerated for 18 months.',
      category: 'Fragrance',
      price: 680,
      inventory: {
        stockQuantity: 30,
        lowStockThreshold: 5,
        sku: 'AET-OUD-050',
        weightKg: 0.4,
      },
      status: 'ACTIVE',
      gatedTier: 'SILVER',
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
      ],
      tags: ['Artisanal', 'Extrait'],
      isFeatured: true,
      createdAt: '2025-01-19T11:00:00Z',
      updatedAt: '2025-02-02T10:00:00Z',
    },
    {
      id: 'prod_06',
      storeId: 'str_zenith_03',
      storeName: 'Zenith Haute Audio',
      name: 'Aether Monoblock Class-A Tube Amplifier',
      slug: 'aether-monoblock-tube-amp',
      description: 'Custom point-to-point hand wired 300B triodes with silver-wound output transformers.',
      category: 'Audio',
      price: 8400,
      inventory: {
        stockQuantity: 4,
        lowStockThreshold: 2,
        sku: 'ZNT-AMP-300B',
        weightKg: 28.0,
      },
      status: 'ACTIVE',
      gatedTier: 'VIP_BLACK',
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
      ],
      tags: ['Audiophile', 'Bespoke'],
      isFeatured: true,
      createdAt: '2025-01-05T14:00:00Z',
      updatedAt: '2025-02-10T11:00:00Z',
    },
  ]);

  private readonly _searchFilter = signal<string>('');
  private readonly _categoryFilter = signal<string>('ALL');
  private readonly _tierFilter = signal<GatedAccessTier | 'ALL'>('ALL');
  private readonly _selectedStoreScope = signal<string | 'ALL'>('ALL');

  // Readonly signals
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

  public addProduct(dto: CreateProductDto): Product {
    const activeStore = this.storeState.stores().find((s) => s.id === dto.storeId);
    const newProduct: Product = {
      id: `prod_${Date.now().toString(36)}`,
      storeId: dto.storeId,
      storeName: activeStore?.name || 'Assigned Store',
      name: dto.name,
      slug: dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this._products.update((prods) => [newProduct, ...prods]);
    return newProduct;
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
