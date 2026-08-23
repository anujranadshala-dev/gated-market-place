import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreState } from '../../../state/store.state';
import { ProductState } from '../../../state/product.state';
import { InvitationState } from '../../../state/invitation.state';
import { Store, StoreTier, StoreStatus, CreateStoreDto } from '../../../core/models/store.model';
import { Product, GatedAccessTier } from '../../../core/models/product.model';
import { CustomerInvitation } from '../../../core/models/invitation.model';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';

/**
 * Super Admin Omnipotent Global Oversight Component
 * Global CRUD operations across all Stores, Products, and Client Access permissions.
 * Supports on-demand username and temporary password management for all patrons.
 */
@Component({
  selector: 'app-global-oversight',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './global-oversight.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalOversightComponent {
  readonly storeState = inject(StoreState);
  readonly productState = inject(ProductState);
  readonly invitationState = inject(InvitationState);

  // Active View Tab: 'STORES' | 'PRODUCTS' | 'CLIENTS'
  readonly activeTab = signal<'STORES' | 'PRODUCTS' | 'CLIENTS'>('STORES');

  // Store Filtering State for Products & Clients
  readonly productStoreFilter = signal<string>('ALL');
  readonly productSearchQuery = signal<string>('');

  readonly clientStoreFilter = signal<string>('ALL');
  readonly clientSearchQuery = signal<string>('');

  // Password Management Modal Signals
  readonly isPasswordModalOpen = signal<boolean>(false);
  readonly selectedAccountForPassword = signal<CustomerInvitation | null>(null);
  readonly modalNewPassword = signal<string>('');
  readonly modalIsTemp = signal<boolean>(true);
  readonly modalShowPassword = signal<boolean>(false);
  readonly revealedPasswords = signal<Record<string, boolean>>({});

  // Computed filtered products based on selected store and search query
  readonly filteredProducts = computed<Product[]>(() => {
    const storeFilter = this.productStoreFilter();
    const query = this.productSearchQuery().trim().toLowerCase();
    let list = this.productState.products();

    if (storeFilter !== 'ALL') {
      list = list.filter((p) => p.storeId === storeFilter);
    }

    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.storeName && p.storeName.toLowerCase().includes(query)) ||
          p.inventory.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Computed filtered client credentials based on selected store and search query
  readonly filteredInvitations = computed<CustomerInvitation[]>(() => {
    const storeFilter = this.clientStoreFilter();
    const query = this.clientSearchQuery().trim().toLowerCase();
    let list = this.invitationState.invitations();

    if (storeFilter !== 'ALL') {
      list = list.filter((inv) => inv.storeId === storeFilter);
    }

    if (query) {
      list = list.filter(
        (inv) =>
          (inv.recipientName && inv.recipientName.toLowerCase().includes(query)) ||
          inv.recipientEmail.toLowerCase().includes(query) ||
          (inv.username && inv.username.toLowerCase().includes(query)) ||
          inv.storeName.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Store Modal State
  readonly isStoreModalOpen = signal<boolean>(false);
  readonly editingStoreId = signal<string | null>(null);
  readonly storeFormName = signal<string>('');
  readonly storeFormSlug = signal<string>('');
  readonly storeFormOwnerName = signal<string>('');
  readonly storeFormOwnerEmail = signal<string>('');
  readonly storeFormDescription = signal<string>('');
  readonly storeFormTier = signal<StoreTier>('PREMIUM_BRAND');

  readonly storeFormMinTier = signal<'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK'>('SILVER');

  // Product Global Edit Modal State
  readonly isProductModalOpen = signal<boolean>(false);
  readonly editingProductId = signal<string | null>(null);
  readonly productFormStoreId = signal<string>('');
  readonly productFormName = signal<string>('');
  readonly productFormCategory = signal<string>('Leather Goods');
  readonly productFormPrice = signal<number>(1000);
  readonly productFormStock = signal<number>(10);
  readonly productFormSku = signal<string>('');
  readonly productFormTier = signal<GatedAccessTier>('GOLD');

  // Delete Confirm State
  readonly deleteConfirmEntity = signal<{ type: 'STORE' | 'PRODUCT'; id: string; name: string } | null>(null);
  readonly toastMessage = signal<string | null>(null);

  public setTab(tab: 'STORES' | 'PRODUCTS' | 'CLIENTS'): void {
    this.activeTab.set(tab);
  }

  public setProductStoreFilter(storeId: string): void {
    this.productStoreFilter.set(storeId);
  }

  public setClientStoreFilter(storeId: string): void {
    this.clientStoreFilter.set(storeId);
  }

  public toggleTableRowPassword(id: string): void {
    this.revealedPasswords.update((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  public copyText(text: string, label: string = 'Text'): void {
    navigator.clipboard?.writeText(text);
    this.showToast(`${label} copied to clipboard.`);
  }

  public copyFullCredentials(account: CustomerInvitation): void {
    const text = `Gated Access Credentials:\nUsername: ${account.username}\nTemporary Password: ${account.tempPassword}\nStore: ${account.storeName}\nTier: ${account.assignedTier}\n(User can change password anytime)`;
    navigator.clipboard?.writeText(text);
    this.showToast(`Full credentials for ${account.username} copied to clipboard!`);
  }

  // --- Password Modal for Super Admin ---
  public openPasswordModal(account: CustomerInvitation): void {
    this.selectedAccountForPassword.set(account);
    const newTemp = this.invitationState.generateSecureTempPassword(account.storeName);
    this.modalNewPassword.set(newTemp);
    this.modalIsTemp.set(true);
    this.modalShowPassword.set(true);
    this.isPasswordModalOpen.set(true);
  }

  public closePasswordModal(): void {
    this.isPasswordModalOpen.set(false);
    this.selectedAccountForPassword.set(null);
  }

  public generateModalTempPassword(): void {
    const account = this.selectedAccountForPassword();
    const newTemp = this.invitationState.generateSecureTempPassword(account?.storeName);
    this.modalNewPassword.set(newTemp);
    this.modalIsTemp.set(true);
  }

  public saveNewPassword(): void {
    const account = this.selectedAccountForPassword();
    const pwd = this.modalNewPassword().trim();

    if (!account || !pwd) {
      this.showToast('Please enter a valid password.');
      return;
    }

    this.invitationState.changeClientPassword(
      account.id,
      pwd,
      this.modalIsTemp(),
      false
    );

    this.showToast(`Password for ${account.username} successfully updated!`);
    this.closePasswordModal();
  }

  // --- Store Operations ---
  public openCreateStoreModal(): void {
    this.editingStoreId.set(null);
    this.storeFormName.set('');
    this.storeFormSlug.set('');
    this.storeFormOwnerName.set('');
    this.storeFormOwnerEmail.set('');
    this.storeFormDescription.set('');
    this.storeFormTier.set('PREMIUM_BRAND');
    this.storeFormMinTier.set('SILVER');
    this.isStoreModalOpen.set(true);
  }

  public openEditStoreModal(store: Store): void {
    this.editingStoreId.set(store.id);
    this.storeFormName.set(store.name);
    this.storeFormSlug.set(store.slug);
    this.storeFormOwnerName.set(store.ownerName);
    this.storeFormOwnerEmail.set(store.ownerEmail);
    this.storeFormDescription.set(store.description);
    this.storeFormTier.set(store.tier);
    this.storeFormMinTier.set(store.gatingConfig.minimumLoyaltyTier);
    this.isStoreModalOpen.set(true);
  }

  public async saveStore(): Promise<void> {
    if (!this.storeFormName().trim() || !this.storeFormOwnerEmail().trim()) {
      this.showToast('Please provide store name and owner email.');
      return;
    }

    const editId = this.editingStoreId();
    if (editId) {
      this.storeState.updateStore(editId, {
        name: this.storeFormName(),
        slug: this.storeFormSlug() || this.storeFormName().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerName: this.storeFormOwnerName(),
        ownerEmail: this.storeFormOwnerEmail(),
        description: this.storeFormDescription(),
        tier: this.storeFormTier(),
        gatingConfig: {
          requireInvitation: true,
          allowedEmailDomains: [],
          minimumLoyaltyTier: this.storeFormMinTier(),
          autoApproveWhitelist: false,
        },
      });
      this.showToast('Store settings updated.');
    } else {
      const dto: CreateStoreDto = {
        name: this.storeFormName(),
        slug: this.storeFormSlug(),
        ownerName: this.storeFormOwnerName(),
        ownerEmail: this.storeFormOwnerEmail(),
        description: this.storeFormDescription(),
        tier: this.storeFormTier(),
        gatingConfig: {
          requireInvitation: true,
          minimumLoyaltyTier: this.storeFormMinTier(),
        },
      };
      try {
        await this.storeState.createStore(dto);
        this.showToast('New merchant storefront onboarded.');
      } catch (error) {
        this.showToast('Failed to create store. Please try again.');
      }
    }

    this.isStoreModalOpen.set(false);
  }

  public toggleStoreStatus(storeId: string, currentStatus: StoreStatus): void {
    const nextStatus: StoreStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.storeState.updateStoreStatus(storeId, nextStatus);
    this.showToast(`Store status updated to ${nextStatus}.`);
  }

  // --- Product Operations ---
  public openEditProductModal(product: Product): void {
    this.editingProductId.set(product.id);
    this.productFormStoreId.set(product.storeId);
    this.productFormName.set(product.name);
    this.productFormCategory.set(product.category);
    this.productFormPrice.set(product.price);
    this.productFormStock.set(product.inventory.stockQuantity);
    this.productFormSku.set(product.inventory.sku);
    this.productFormTier.set(product.gatedTier);
    this.isProductModalOpen.set(true);
  }

  public saveProduct(): void {
    const editId = this.editingProductId();
    if (!editId) return;

    this.productState.updateProduct(editId, {
      name: this.productFormName(),
      category: this.productFormCategory(),
      price: Number(this.productFormPrice()),
      inventory: {
        stockQuantity: Number(this.productFormStock()),
        lowStockThreshold: 3,
        sku: this.productFormSku().toUpperCase(),
      },
      gatedTier: this.productFormTier(),
    });

    this.isProductModalOpen.set(false);
    this.showToast('Product modified by Super Admin.');
  }

  // --- Delete confirmation ---
  public promptDelete(type: 'STORE' | 'PRODUCT', id: string, name: string): void {
    this.deleteConfirmEntity.set({ type, id, name });
  }

  public cancelDelete(): void {
    this.deleteConfirmEntity.set(null);
  }

  public executeDelete(): void {
    const entity = this.deleteConfirmEntity();
    if (!entity) return;

    if (entity.type === 'STORE') {
      this.storeState.deleteStore(entity.id);
      this.showToast(`Store ${entity.name} deleted from ecosystem.`);
    } else if (entity.type === 'PRODUCT') {
      this.productState.deleteProduct(entity.id);
      this.showToast(`Product ${entity.name} removed from catalog.`);
    }

    this.deleteConfirmEntity.set(null);
  }

  public showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
