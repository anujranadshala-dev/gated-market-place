import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderState } from '../../../state/order.state';
import { AuthStore } from '../../../core/auth/auth.store';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';

/**
 * Modern Angular 21 Standalone Store Owner Order Management & Packing Station
 * Dedicated workbench for reviewing line items and transitioning orders to 'Packed' state.
 */
@Component({
  selector: 'app-store-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './store-orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreOrdersComponent {
  readonly orderState = inject(OrderState);
  readonly authStore = inject(AuthStore);

  // Selected Order for Inspection Drawer / Modal
  readonly selectedOrder = signal<Order | null>(null);
  readonly packingNotes = signal<string>('');
  readonly toastMessage = signal<string | null>(null);

  public openOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
    this.packingNotes.set('');
  }

  public closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

  public packOrder(orderId: string): void {
    this.orderState.markAsPacked(orderId, this.packingNotes());
    this.showToast(`Order marked as 'Packed'. Handoff notification sent to Super Admin Logistics.`);
    
    // Refresh selected order state if modal is open
    const updated = this.orderState.orders().find((o) => o.id === orderId);
    if (updated) {
      this.selectedOrder.set(updated);
    }
  }

  public showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
