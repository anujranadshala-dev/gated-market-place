import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { OrderState } from '../../../state/order.state';
import { InvitationState } from '../../../state/invitation.state';

/**
 * Modern Angular 21 Standalone Navigation Sidebar
 * Adapts routes, counters, and navigation state dynamically to active RBAC role.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full flex-shrink-0 flex flex-col'
  }
})
export class SidebarComponent {
  readonly authStore = inject(AuthStore);
  readonly orderState = inject(OrderState);
  readonly invitationState = inject(InvitationState);
}
