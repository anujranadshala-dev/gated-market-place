import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderState } from '../../../state/order.state';
import { Order } from '../../../core/models/order.model';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';

/**
 * Super Admin Centralized Logistics & Delivery Tracking Board
 * Real-time pipeline to track Packed orders -> Out_for_Delivery -> Delivered.
 */
@Component({
  selector: 'app-logistics-board',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './logistics-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogisticsBoardComponent {
  readonly orderState = inject(OrderState);

  // Dispatch Modal State
  readonly dispatchingOrder = signal<Order | null>(null);
  readonly carrierName = signal<string>('DHL Express Private Courier');
  readonly trackingNumber = signal<string>('');
  readonly driverName = signal<string>('Matthias Berg');
  readonly driverPhone = signal<string>('+46 70 889 1234');
  readonly toastMessage = signal<string | null>(null);

  public openDispatchModal(order: Order): void {
    const randomTrack = `TRK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.dispatchingOrder.set(order);
    this.carrierName.set('DHL Express White Glove');
    this.trackingNumber.set(randomTrack);
    this.driverName.set('Fleet Driver Alpha');
    this.driverPhone.set('+1 (800) 555-EXPR');
  }

  public closeDispatchModal(): void {
    this.dispatchingOrder.set(null);
  }

  public confirmDispatch(): void {
    const order = this.dispatchingOrder();
    if (!order) return;

    this.orderState.markOutForDelivery(order.id, {
      carrierName: this.carrierName(),
      trackingNumber: this.trackingNumber(),
      driverName: this.driverName(),
      driverPhone: this.driverPhone(),
    });

    this.showToast(`Order ${order.orderNumber} dispatched! Status changed to 'Out_for_Delivery'.`);
    this.closeDispatchModal();
  }

  public markAsDelivered(orderId: string, orderNumber: string): void {
    this.orderState.markDelivered(orderId);
    this.showToast(`Order ${orderNumber} fulfilled and marked as 'Delivered'.`);
  }

  public showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
