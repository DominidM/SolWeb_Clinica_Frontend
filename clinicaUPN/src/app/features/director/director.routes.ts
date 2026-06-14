import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const DIRECTOR_ROUTES: Routes = [
  { path: '', redirectTo: 'bi-dashboard', pathMatch: 'full' },
  {
    path: 'bi-dashboard',
    canActivate: [roleGuard(['DIRECTOR', 'ADMINISTRADOR'])],
    loadComponent: () => import('./pages/bi-dashboard-page/bi-dashboard-page').then(m => m.BiDashboardPageComponent)
  },
];
