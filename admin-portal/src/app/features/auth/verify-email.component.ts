import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div class="w-full max-w-md space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0b3c5d] via-[#2988c8] to-[#d97d10] items-center justify-center text-xl font-extrabold text-white shadow-lg shadow-[#2988c8]/25">
            GP
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Email Verification</h1>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
          @if (isLoading()) {
            <p class="text-xs text-slate-500 dark:text-slate-400">Verifying your email...</p>
          } @else if (isSuccess()) {
            <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 space-y-2">
              <p class="font-bold">Email verified successfully!</p>
              <p>Your email has been verified. You can now log in to your account.</p>
              <button
                type="button"
                (click)="goToLogin()"
                class="text-emerald-800 dark:text-emerald-200 font-semibold underline hover:text-emerald-900 dark:hover:text-emerald-100 transition"
              >
                Go to Login
              </button>
            </div>
          } @else if (errorMessage()) {
            <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <p class="font-bold">Verification failed</p>
              <p>{{ errorMessage() }}</p>
              <button
                type="button"
                (click)="goToLogin()"
                class="text-rose-800 dark:text-rose-200 font-semibold underline hover:text-rose-900 dark:hover:text-rose-100 transition"
              >
                Go to Login
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);

  readonly isLoading = signal<boolean>(true);
  readonly isSuccess = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid verification link. Please request a new verification email.');
      return;
    }

    this.authStore.verifyEmail(email, token).then((success) => {
      this.isLoading.set(false);
      if (success) {
        this.isSuccess.set(true);
      } else {
        this.errorMessage.set('Failed to verify email. The link may have expired.');
      }
    });
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
