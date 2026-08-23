import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreState } from '../../../state/store.state';
import { ProductState } from '../../../state/product.state';
import { OrderState } from '../../../state/order.state';
import { InvitationState } from '../../../state/invitation.state';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';

/**
 * Super Admin Global Platform Dashboard Component
 * Omnipotent aggregated view of all merchant tenants, GMV, catalog depth, and logistics.
 */
@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './super-admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent {
  readonly storeState = inject(StoreState);
  readonly productState = inject(ProductState);
  readonly orderState = inject(OrderState);
  readonly invitationState = inject(InvitationState);

  public manageStore(storeId: string): void {
    this.storeState.selectStore(storeId);
  }
}
