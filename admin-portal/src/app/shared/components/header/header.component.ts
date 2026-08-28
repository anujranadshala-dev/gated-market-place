import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { ThemeService } from '../../../core/theme/theme.service';
import { StoreState } from '../../../state/store.state';
import { OrderState } from '../../../state/order.state';
import { StatusBadgeComponent } from '../badge/status-badge.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly authStore = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  readonly storeState = inject(StoreState);
  readonly orderState = inject(OrderState);
  private readonly router = inject(Router);

  public isProfileOpen = signal(false);

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public backToPlatform(): void {
    this.storeState.clearSelectedStore();
    this.router.navigate(['/super-admin/dashboard']);
  }

  public logout(): void {
    this.isProfileOpen.set(false);
    this.authStore.logout();
  }
}
