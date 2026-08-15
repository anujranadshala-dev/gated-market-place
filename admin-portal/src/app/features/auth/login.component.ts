import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { UserRole } from '../../core/auth/auth.models';

/**
 * Authentication & Persona Portal Component
 * Provides seamless demo switching between Store Owner and Super Admin roles.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly authStore = inject(AuthStore);
  readonly router = inject(Router);

  readonly email = signal<string>('eleanor@vance-atelier.com');
  readonly password = signal<string>('••••••••••••');
  readonly selectedRole = signal<UserRole>('STORE_OWNER');

  public quickSignIn(role: UserRole, storeId?: string, storeName?: string): void {
    this.authStore.switchPersona(role, storeId, storeName);
  }

  public onSubmit(): void {
    this.authStore.login({
      email: this.email(),
      password: this.password(),
      role: this.selectedRole(),
    });
  }
}
