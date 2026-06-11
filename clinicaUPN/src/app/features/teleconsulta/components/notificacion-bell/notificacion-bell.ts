import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-notificacion-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-bell.html',
  styleUrl: './notificacion-bell.css',
})
export class NotificacionBellComponent {
  private router = inject(Router);
  notiSvc = inject(NotificacionService);
  auth = inject(AuthService);

  abierto = false;

  get soloDoctor() {
    const r = this.auth.getRol();
    return r === 'DOCTOR' || r === 'MEDICO';
  }

  toggle() {
    this.abierto = !this.abierto;
    if (this.abierto) {
      this.notiSvc.marcarLeidas();
    }
  }

  cerrar() {
    this.abierto = false;
  }

  ir(teleconsultaId: number) {
    this.cerrar();
    this.router.navigate(['/app/teleconsulta']);
  }
}
