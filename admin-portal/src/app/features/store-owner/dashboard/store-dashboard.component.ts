import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../core/auth/auth.store';
import { StoreState } from '../../../state/store.state';
import { ProductState } from '../../../state/product.state';
import { OrderState } from '../../../state/order.state';
import { InvitationState } from '../../../state/invitation.state';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';
import { Order } from '../../../core/models/order.model';

/**
 * Store Owner Dashboard Component
 * Highlights assigned merchant store health, gating settings, pending fulfillment queue, and inventory alerts.
 */
@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  templateUrl: './store-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreDashboardComponent {
  readonly authStore = inject(AuthStore);
  readonly storeState = inject(StoreState);
  readonly productState = inject(ProductState);
  readonly orderState = inject(OrderState);
  readonly invitationState = inject(InvitationState);

  readonly isEditingGating = signal<boolean>(false);
  readonly toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  public toggleGatingEditor(): void {
    this.isEditingGating.update((v) => !v);
  }

  public async saveGatingSettings(requireInvite: boolean, minTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK'): Promise<void> {
    const store = this.storeState.activeStore();
    if (!store) return;

    try {
      await this.storeState.updateStore(store.id, {
        gatingConfig: {
          ...store.gatingConfig,
          requireInvitation: requireInvite,
          minimumLoyaltyTier: minTier,
        },
      });
      this.isEditingGating.set(false);
      this.showToast('Gating access criteria updated successfully.');
    } catch (error: any) {
      this.showToast(error?.error?.message || 'Failed to update gating settings. Please try again.', 'error');
    }
  }

  public showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  public async onPackOrder(order: Order): Promise<void> {
    try {
      await this.orderState.markAsPacked(order.id);
      this.showToast(`Order ${order.orderNumber} marked as 'Packed'. Handoff sent to Super Admin Logistics.`);
    } catch (error: any) {
      this.showToast(error?.error?.message || 'Failed to pack order. Please try again.', 'error');
    }
  }
}
