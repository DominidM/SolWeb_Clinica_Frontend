import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { ChangePasswordModalComponent } from '../../../../shared/components/change-password-modal/change-password-modal';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ChangePasswordModalComponent],
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
  showPasswordModal = signal(false);
  redirectRol = signal('');

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
          this.loading.set(false);
          if (res.data.passwordDefault) {
            this.redirectRol.set((res.data.rol ?? '').toUpperCase());
            this.showPasswordModal.set(true);
          } else {
            this.navegar(res.data.rol);
          }
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

  navegar(rol: string): void {
    const r = (rol ?? '').toUpperCase();
    const rutas: Record<string, string> = {
      ADMINISTRADOR: '/app/pacientes',
      ADMINISTRATIVO: '/app/pacientes',
      DOCTOR: '/app/citas',
      MEDICO: '/app/citas',
      PRACTICANTE: '/app/practicantes/agenda',
      DIRECTOR: '/app/dashboard',
      PACIENTE: '/app/mis-citas',
      PATIENT: '/app/mis-citas',
    };
    this.router.navigate([rutas[r] || '/app']);
  }

  onModalClose(): void {
    this.showPasswordModal.set(false);
    this.navegar(this.redirectRol());
  }
}
