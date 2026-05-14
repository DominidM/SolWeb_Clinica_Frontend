import { Routes } from '@angular/router';
import { ConsultaPageComponent } from './pages/consulta-page/consulta-page';
import { SalaComponent } from './components/sala/sala';

export const TELECONSULTA_ROUTES: Routes = [
  { path: '', component: ConsultaPageComponent },
  { path: 'sala/:id', component: SalaComponent },
];
