import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { AuthService } from './core/services/auth';

export const routes: Routes = [
  // login SIN layout
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login-page/login-page')
      .then(m => m.LoginPageComponent)
  },

  // público CON navbar
  {
    path: '',
    loadComponent: () => import('./shared/layouts/public-layout/public-layout')
      .then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/pages/landing-page/landing-page')
          .then(m => m.LandingPageComponent)
      }
    ]
  },

  // privado CON sidebar
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/private-layout/private-layout')
      .then(m => m.PrivateLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [() => {
          const auth = inject(AuthService);
          const router = inject(Router);
          const rol = auth.getRol();
          const rutas: Record<string, string> = {
            ADMINISTRADOR:  'pacientes',
            ADMINISTRATIVO: 'administrativo/gestion-citas',
            DOCTOR:         'citas',
            MEDICO:         'citas',
            PRACTICANTE:    'practicantes/agenda',
            DIRECTOR:       'director/bi-dashboard',
            PACIENTE:       'mis-citas',
            PATIENT:        'mis-citas',
          };
          return router.parseUrl(rutas[rol ?? ''] || 'pacientes');
        }],
        children: []
      },
      { path: 'pacientes',        loadChildren: () => import('./features/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES) },
      { path: 'citas',            loadChildren: () => import('./features/citas/citas.routes').then(m => m.CITAS_ROUTES) },
      { path: 'historia-clinica', loadChildren: () => import('./features/historia-clinica/historia-clinica.routes').then(m => m.HCE_ROUTES) },
      { path: 'teleconsulta',     loadChildren: () => import('./features/teleconsulta/teleconsulta.routes').then(m => m.TELECONSULTA_ROUTES) },
      { path: 'reportes', canActivate: [roleGuard(['ADMINISTRADOR', 'DIRECTOR', 'ADMINISTRATIVO'])], loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES) },
      { path: 'practicantes',     loadChildren: () => import('./features/practicantes/practicantes.routes').then(m => m.PRACTICANTES_ROUTES) },
      { path: 'mis-citas',        loadComponent: () => import('./features/citas/pages/mis-citas-page/mis-citas-page').then(m => m.MisCitasPageComponent) },
      { path: 'mi-perfil',        loadComponent: () => import('./features/pacientes/pages/mi-perfil-page/mi-perfil-page').then(m => m.MiPerfilPageComponent) },
      { path: 'mi-historia',      loadComponent: () => import('./features/historia-clinica/pages/hce-paciente-page/hce-paciente-page').then(m => m.HcePacientePageComponent) },
      { path: 'dashboard',        canActivate: [roleGuard(['ADMINISTRADOR'])], loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'director',         canActivate: [roleGuard(['DIRECTOR', 'ADMINISTRADOR'])], loadChildren: () => import('./features/director/director.routes').then(m => m.DIRECTOR_ROUTES) },
      { path: 'consultorios',     canActivate: [roleGuard(['ADMINISTRADOR', 'ADMINISTRATIVO'])], loadChildren: () => import('./features/consultorios/consultorios.routes').then(m => m.CONSULTORIOS_ROUTES) },
      { path: 'doctores',         canActivate: [roleGuard(['ADMINISTRADOR', 'DIRECTOR'])], loadChildren: () => import('./features/doctores/doctores.routes').then(m => m.DOCTORES_ROUTES) },
      { path: 'evaluaciones-practicantes', canActivate: [roleGuard(['ADMINISTRADOR', 'DOCTOR', 'DIRECTOR'])], loadChildren: () => import('./features/evaluaciones-practicantes/evaluaciones-practicantes.routes').then(m => m.EVALUACIONES_PRACTICANTES_ROUTES) },
      { path: 'usuarios',         canActivate: [roleGuard(['ADMINISTRADOR'])], loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES) },
      { path: 'administrativo',   canActivate: [roleGuard(['ADMINISTRATIVO', 'ADMINISTRADOR'])], loadChildren: () => import('./features/administrativo/administrativo.routes').then(m => m.ADMINISTRATIVO_ROUTES) },
    ]
  },

  { path: '**', redirectTo: '' }
];