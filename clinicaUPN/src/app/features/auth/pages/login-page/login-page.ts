import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

// ============================================================
//  login-page.component.ts
//  Cambio clave: username → email (alineado con el backend)
// ============================================================
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  onLogin() {
    if (!this.email() || !this.password()) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService
      .login({
        email: this.email(),
        password: this.password(),
      })
      .subscribe({
        next: (res) => {
          const rol = (res.data.rol ?? '').toUpperCase();
          const rutas: Record<string, string> = {
            ADMINISTRADOR: '/app/pacientes',
            ADMINISTRATIVO: '/app/pacientes',
            DOCTOR: '/app/agenda',
            MEDICO: '/app/agenda',
            PRACTICANTE: '/app/practicantes/agenda',
            DIRECTOR: '/app/dashboard',
            PACIENTE: '/app/mis-citas',
            PATIENT: '/app/mis-citas',
          };
          this.router.navigate([rutas[rol] || '/app']);
        },
        error: (err) => {
          this.error.set(
            err.status === 401
              ? 'Usuario o contraseña incorrectos'
              : 'Error del servidor, intenta más tarde',
          );
          this.loading.set(false);
        },
      });
  }
}
