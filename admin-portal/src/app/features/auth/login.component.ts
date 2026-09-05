import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { UserRole } from '../../core/auth/auth.models';

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

  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly selectedRole = signal<UserRole>('STORE_OWNER');

  readonly isUnverifiedError = signal<boolean>(false);
  readonly unverifiedEmail = signal<string>('');

  public onSubmit(): void {
    this.isUnverifiedError.set(false);
    this.authStore.login({
      email: this.email(),
      password: this.password(),
      role: this.selectedRole(),
    }).then((success) => {
      if (!success) {
        const error = this.authStore.authError();
        if (error === 'unverified') {
          this.isUnverifiedError.set(true);
          this.unverifiedEmail.set(this.email());
        }
      }
    });
  }

  public onResendVerification(): void {
    this.authStore.resendVerificationEmail(this.unverifiedEmail());
  }

  public navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
