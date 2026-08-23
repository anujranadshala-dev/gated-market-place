import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { UserRole } from './auth.models';
import { StoreState } from '../../state/store.state';

/**
 * Functional Role-Based Access Control (RBAC) Guard Factory
 * Enforces strict routing boundaries for Store Owners vs Super Admins.
 */
export const createRoleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const currentRole = authStore.userRole();
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    // Role mismatch: redirect to their respective landing portal
    if (currentRole === 'SUPER_ADMIN') {
      return router.createUrlTree(['/super-admin/dashboard']);
    } else if (currentRole === 'STORE_OWNER') {
      return router.createUrlTree(['/store-owner/dashboard']);
    }

    return router.createUrlTree(['/login']);
  };
};

export const superAdminGuard = createRoleGuard(['SUPER_ADMIN']);

export const storeOwnerGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const storeState = inject(StoreState);

  await authStore.tryAutoLogin();

  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const currentRole = authStore.userRole();

  if (currentRole === 'STORE_OWNER') {
    return true;
  }

  if (currentRole === 'SUPER_ADMIN' && storeState.selectedStoreId()) {
    return true;
  }

  if (currentRole === 'SUPER_ADMIN') {
    return router.createUrlTree(['/super-admin/dashboard']);
  }

  return router.createUrlTree(['/login']);
};
