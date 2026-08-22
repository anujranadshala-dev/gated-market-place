import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthStore } from './core/auth/auth.store';
import { ThemeService } from './core/theme/theme.service';

/**
 * Root Application Shell Component
 * Integrates responsive sidebar navigation, persona bar, and router outlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly authStore = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  readonly router = inject(Router);
  readonly isInitializing = signal(true);

  constructor() {
    this.authStore.tryAutoLogin().then((success) => {
      if (success && this.isLoginPage()) {
        this.router.navigate(['/store-owner/dashboard']);
      }
      this.isInitializing.set(false);
    });
  }

  public isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }
}

