import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  await authStore.tryAutoLogin();

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  await authStore.tryAutoLogin();

  if (authStore.isAuthenticated()) {
    if (authStore.isSuperAdmin()) {
      return router.createUrlTree(['/super-admin/dashboard']);
    }
    return router.createUrlTree(['/store-owner/dashboard']);
  }

  return true;
};
