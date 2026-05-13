import { Routes } from '@angular/router';
import { AgendaPageComponent } from './pages/agenda-page/agenda-page';
import { RegistrarConsultaPageComponent } from './pages/registrar-consulta-page/registrar-consulta-page';
import { EvaluacionesPageComponent } from './pages/evaluaciones-page/evaluaciones-page';

export const PRACTICANTES_ROUTES: Routes = [
  { path: '', redirectTo: 'agenda', pathMatch: 'full' },
  { path: 'agenda', component: AgendaPageComponent },
  { path: 'registrar-consulta', component: RegistrarConsultaPageComponent },
  { path: 'evaluaciones', component: EvaluacionesPageComponent },
];
