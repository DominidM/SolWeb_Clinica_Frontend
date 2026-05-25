import { Routes } from '@angular/router';
import { AgendaPageComponent } from './pages/agenda-page/agenda-page';

export const CITAS_ROUTES: Routes = [
  { path: '', component: AgendaPageComponent },
  { path: 'atencion/:idCita', loadComponent: () => import('./pages/atencion-page/atencion-page').then(m => m.AtencionPageComponent) },
];
