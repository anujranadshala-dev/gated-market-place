import { Routes } from '@angular/router';
import { storeOwnerGuard } from '../../core/auth/role.guard';

/**
 * Store Owner Portal Child Routes
 * Protected strictly by the functional `storeOwnerGuard`.
 */
export const STORE_OWNER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [storeOwnerGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/store-dashboard.component').then((m) => m.StoreDashboardComponent),
        title: 'Store Dashboard - GatedPulse',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/product-management.component').then((m) => m.ProductManagementComponent),
        title: 'Catalog Management - GatedPulse',
      },
      {
        path: 'invitations',
        loadComponent: () =>
          import('./invitations/customer-invitation.component').then((m) => m.CustomerInvitationComponent),
        title: 'VIP Invitations - GatedPulse',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/store-orders.component').then((m) => m.StoreOrdersComponent),
        title: 'Packing Station & Orders - GatedPulse',
      },
    ],
  },
];
