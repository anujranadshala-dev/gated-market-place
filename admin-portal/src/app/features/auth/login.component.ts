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

  readonly email = signal<string>('anujranadshala@gmail.com');
  readonly password = signal<string>('Anuj123');
  readonly selectedRole = signal<UserRole>('SUPER_ADMIN');

  public onSubmit(): void {
    this.authStore.login({
      email: this.email(),
      password: this.password(),
      role: this.selectedRole(),
    });
  }

    public navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
