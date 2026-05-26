import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { HcePageComponent } from './pages/hce-page/hce-page';

export const HCE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['ADMINISTRADOR', 'DOCTOR', 'PRACTICANTE'])],
    component: HcePageComponent
  }
];