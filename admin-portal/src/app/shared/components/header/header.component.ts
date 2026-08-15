import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { ThemeService } from '../../../core/theme/theme.service';
import { StoreState } from '../../../state/store.state';
import { OrderState } from '../../../state/order.state';
import { StatusBadgeComponent } from '../badge/status-badge.component';

/**
 * Modern Angular 21 Standalone Header Component
 * Displays live tenant context, quick RBAC persona switching, dark/light theme toggle, and fulfillment counters.
 */
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

  readonly isPersonaMenuOpen = signal<boolean>(false);

  public togglePersonaMenu(): void {
    this.isPersonaMenuOpen.update((v) => !v);
  }

  public closePersonaMenu(): void {
    this.isPersonaMenuOpen.set(false);
  }

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public selectPersona(role: 'SUPER_ADMIN' | 'STORE_OWNER', storeId?: string, storeName?: string): void {
    this.authStore.switchPersona(role, storeId, storeName);
    this.closePersonaMenu();
  }

  public logout(): void {
    this.authStore.logout();
    this.closePersonaMenu();
  }
}

