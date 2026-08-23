import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
    title: 'Authenticate - GatedPulse Marketplace',
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/signup.component').then((m) => m.SignupComponent),
    title: 'Create Account - GatedPulse Marketplace',
  },
  {
    path: 'store-owner',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/store-owner/store-owner.routes').then((m) => m.STORE_OWNER_ROUTES),
  },
  {
    path: 'super-admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/super-admin/super-admin.routes').then((m) => m.SUPER_ADMIN_ROUTES),
  },
  {
    path: '',
    redirectTo: 'store-owner',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'store-owner',
  },
];
