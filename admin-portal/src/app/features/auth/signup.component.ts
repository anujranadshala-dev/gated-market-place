import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { UserRole } from '../../core/auth/auth.models';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  readonly authStore = inject(AuthStore);
  readonly router = inject(Router);

  readonly name = signal<string>('');
  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly confirmPassword = signal<string>('');
  readonly role = signal<UserRole>('STORE_OWNER');
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);

  readonly isEmailValid = computed<boolean>(() => {
    const email = this.email().trim();
    const regex = /^[^\s@]+@gmail\.com$/i;
    return regex.test(email);
  });

  public onSubmit(): void {
    this.errorMessage.set(null);

    if (!this.name() || !this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    if (!this.isEmailValid()) {
      this.errorMessage.set('Please use a valid Gmail address (@gmail.com).');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    this.isLoading.set(true);

    this.authStore.signup({
      name: this.name(),
      email: this.email(),
      password: this.password(),
      role: this.role(),
    }).then((success) => {
      this.isLoading.set(false);
      if (!success) {
        this.errorMessage.set('Sign up failed. Please try again.');
      }
    });
  }

  public navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
