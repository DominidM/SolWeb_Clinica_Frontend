import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const ADMINISTRATIVO_ROUTES: Routes = [
  { path: '', redirectTo: 'gestion-citas', pathMatch: 'full' },
  {
    path: 'gestion-citas',
    canActivate: [roleGuard(['ADMINISTRATIVO', 'ADMINISTRADOR'])],
    loadComponent: () => import('./pages/gestion-citas-page/gestion-citas-page').then(m => m.GestionCitasPageComponent)
  },
  {
    path: 'registro-pacientes',
    canActivate: [roleGuard(['ADMINISTRATIVO', 'ADMINISTRADOR'])],
    loadComponent: () => import('./pages/registro-pacientes-page/registro-pacientes-page').then(m => m.RegistroPacientesPageComponent)
  },
  {
    path: 'reportes-diarios',
    canActivate: [roleGuard(['ADMINISTRATIVO', 'ADMINISTRADOR'])],
    loadComponent: () => import('./pages/reportes-diarios-page/reportes-diarios-page').then(m => m.ReportesDiariosPageComponent)
  },
];
