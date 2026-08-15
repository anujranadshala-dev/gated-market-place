import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductState } from '../../../state/product.state';
import { StoreState } from '../../../state/store.state';
import { AuthStore } from '../../../core/auth/auth.store';
import { Product, GatedAccessTier, CreateProductDto } from '../../../core/models/product.model';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';

/**
 * Modern Angular 21 Standalone Product Management Component
 * Features Signal-based form state, SKU generation, and tiered gating controls.
 */
@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './product-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductManagementComponent {
  readonly productState = inject(ProductState);
  readonly storeState = inject(StoreState);
  readonly authStore = inject(AuthStore);

  // Modal & Form State Signals
  readonly isModalOpen = signal<boolean>(false);
  readonly editingProductId = signal<string | null>(null);
  readonly deleteConfirmId = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);

  // Signal Form Model
  readonly formName = signal<string>('');
  readonly formCategory = signal<string>('Leather Goods');
  readonly formDescription = signal<string>('');
  readonly formPrice = signal<number>(500);
  readonly formCompareAtPrice = signal<number | undefined>(undefined);
  readonly formStock = signal<number>(10);
  readonly formLowStock = signal<number>(3);
  readonly formSku = signal<string>('');
  readonly formGatedTier = signal<GatedAccessTier>('GOLD');
  readonly formImageUrl = signal<string>('');

  public openCreateModal(): void {
    const activeStore = this.storeState.activeStore();
    const prefix = activeStore ? activeStore.name.substring(0, 3).toUpperCase() : 'PRD';
    const rand = Math.floor(100 + Math.random() * 900);

    this.editingProductId.set(null);
    this.formName.set('');
    this.formCategory.set('Leather Goods');
    this.formDescription.set('');
    this.formPrice.set(750);
    this.formCompareAtPrice.set(900);
    this.formStock.set(15);
    this.formLowStock.set(3);
    this.formSku.set(`${prefix}-CAT-${rand}`);
    this.formGatedTier.set('GOLD');
    this.formImageUrl.set('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80');
    this.isModalOpen.set(true);
  }

  public openEditModal(product: Product): void {
    this.editingProductId.set(product.id);
    this.formName.set(product.name);
    this.formCategory.set(product.category);
    this.formDescription.set(product.description);
    this.formPrice.set(product.price);
    this.formCompareAtPrice.set(product.compareAtPrice);
    this.formStock.set(product.inventory.stockQuantity);
    this.formLowStock.set(product.inventory.lowStockThreshold);
    this.formSku.set(product.inventory.sku);
    this.formGatedTier.set(product.gatedTier);
    this.formImageUrl.set(product.images[0] || '');
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProductId.set(null);
  }

  public saveProduct(): void {
    const storeId = this.authStore.assignedStoreId() || this.storeState.activeStore()?.id || 'str_vance_01';

    if (!this.formName().trim() || !this.formSku().trim() || this.formPrice() <= 0) {
      this.showToast('Please fill in all mandatory product attributes.');
      return;
    }

    const editId = this.editingProductId();
    if (editId) {
      // Update existing
      this.productState.updateProduct(editId, {
        name: this.formName(),
        category: this.formCategory(),
        description: this.formDescription(),
        price: Number(this.formPrice()),
        compareAtPrice: this.formCompareAtPrice() ? Number(this.formCompareAtPrice()) : undefined,
        inventory: {
          stockQuantity: Number(this.formStock()),
          lowStockThreshold: Number(this.formLowStock()),
          sku: this.formSku().toUpperCase(),
        },
        gatedTier: this.formGatedTier(),
        images: [this.formImageUrl() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      });
      this.showToast('Product specifications updated successfully.');
    } else {
      // Create new
      const dto: CreateProductDto = {
        storeId,
        name: this.formName(),
        category: this.formCategory(),
        description: this.formDescription(),
        price: Number(this.formPrice()),
        compareAtPrice: this.formCompareAtPrice() ? Number(this.formCompareAtPrice()) : undefined,
        stockQuantity: Number(this.formStock()),
        lowStockThreshold: Number(this.formLowStock()),
        sku: this.formSku(),
        gatedTier: this.formGatedTier(),
        imageUrl: this.formImageUrl(),
      };
      this.productState.addProduct(dto);
      this.showToast('New gated catalog product published.');
    }

    this.closeModal();
  }

  public confirmDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  public cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  public executeDelete(id: string): void {
    this.productState.deleteProduct(id);
    this.deleteConfirmId.set(null);
    this.showToast('Product successfully removed from catalog.');
  }

  public quickStockAdjust(productId: string, currentStock: number, delta: number): void {
    this.productState.updateStock(productId, currentStock + delta);
  }

  public showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
