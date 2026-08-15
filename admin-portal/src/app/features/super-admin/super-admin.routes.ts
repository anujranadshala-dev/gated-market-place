import { Routes } from '@angular/router';
import { superAdminGuard } from '../../core/auth/role.guard';

/**
 * Super Admin Portal Child Routes
 * Protected strictly by the functional `superAdminGuard`.
 */
export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [superAdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/super-admin-dashboard.component').then((m) => m.SuperAdminDashboardComponent),
        title: 'Super Admin Command - GatedPulse',
      },
      {
        path: 'oversight',
        loadComponent: () =>
          import('./oversight/global-oversight.component').then((m) => m.GlobalOversightComponent),
        title: 'Global Oversight - GatedPulse',
      },
      {
        path: 'logistics',
        loadComponent: () =>
          import('./logistics/logistics-board.component').then((m) => m.LogisticsBoardComponent),
        title: 'Logistics Dispatch Board - GatedPulse',
      },
    ],
  },
];
