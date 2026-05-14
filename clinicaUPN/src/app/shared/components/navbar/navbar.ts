import { Component, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  activeSection = 'inicio';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  get tieneToken(): boolean {
    return this.authService.isAuthenticated(); // usa la clave correcta 'clinica_token'
  }

  irAlSistema(): void {
    const rol = this.authService.getRol();
    const rutas: Record<string, string> = {
      ADMINISTRADOR:  '/app/pacientes',
      ADMINISTRATIVO: '/app/pacientes',
      DOCTOR:         '/app/citas',
      MEDICO:         '/app/citas',
      PRACTICANTE:    '/app/practicantes/agenda',
      DIRECTOR:       '/app/reportes',
      PACIENTE:       '/app/mis-citas',
      PATIENT:        '/app/mis-citas',
    };
    this.router.navigate([rutas[rol ?? ''] || '/app']);
  }

  @HostListener('window:scroll')
  onScroll() {
    const sections = ['inicio', 'servicios', 'especialidades', 'nosotros', 'contacto'];
    for (const id of [...sections].reverse()) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 80) {
        this.activeSection = id;
        break;
      }
    }
  }
}