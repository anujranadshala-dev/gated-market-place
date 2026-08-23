import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { OrderState } from '../../../state/order.state';
import { InvitationState } from '../../../state/invitation.state';
import { StoreState } from '../../../state/store.state';

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
  readonly storeState = inject(StoreState);
  readonly orderState = inject(OrderState);
  readonly invitationState = inject(InvitationState);
  private readonly router = inject(Router);

  public navigateToSuperAdmin(url: string[]): void {
    this.storeState.clearSelectedStore();
    this.router.navigate(url);
  }
}
