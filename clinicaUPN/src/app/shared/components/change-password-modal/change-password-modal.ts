import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible()) {
      <div class="modal-overlay" (click)="cerrar()">
        <div class="modal-content" (click)="\$event.stopPropagation()">
          <div class="modal-header">
            <h2>Cambiar Contraseña</h2>
            <p>Tu contraseña actual es la generada por el sistema. Debes cambiarla para continuar.</p>
          </div>

          @if (error()) {
            <div class="alert-error">{{ error() }}</div>
          }

          <div class="form-group">
            <label>Contraseña Actual</label>
            <input type="password" [(ngModel)]="passActual" class="form-input" placeholder="Ingresa tu contraseña actual">
          </div>

          <div class="form-group">
            <label>Nueva Contraseña</label>
            <input type="password" [(ngModel)]="passNueva" class="form-input" placeholder="Mínimo 6 caracteres">
          </div>

          <div class="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input type="password" [(ngModel)]="passConfirm" class="form-input" placeholder="Repite la nueva contraseña">
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" (click)="cerrar()" [disabled]="guardando()">Cerrar Sesión</button>
            <button class="btn-save" (click)="guardar()" [disabled]="guardando() || !passActual() || !passNueva() || !passConfirm()">
              {{ guardando() ? 'Guardando...' : 'Cambiar Contraseña' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
    }
    .modal-content {
      background: white; border-radius: 14px; padding: 28px;
      width: 420px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .modal-header { margin-bottom: 20px; }
    .modal-header h2 { margin: 0 0 6px; font-size: 1.2rem; color: #1e293b; }
    .modal-header p { margin: 0; font-size: 0.85rem; color: #64748b; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .form-input {
      width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0;
      border-radius: 8px; font-size: 0.9rem; box-sizing: border-box;
    }
    .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .alert-error {
      background: #fef2f2; color: #dc2626; padding: 10px 14px;
      border-radius: 8px; font-size: 0.85rem; margin-bottom: 14px;
      border: 1px solid #fecaca;
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-cancel {
      padding: 9px 18px; background: #f1f5f9; color: #475569;
      border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 0.85rem;
    }
    .btn-cancel:hover { background: #e2e8f0; }
    .btn-save {
      padding: 9px 18px; background: #6366f1; color: white;
      border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600;
    }
    .btn-save:hover { background: #4f46e5; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class ChangePasswordModalComponent {
  private authService = inject(AuthService);

  visible = signal(true);
  guardando = signal(false);
  error = signal('');

  passActual = signal('');
  passNueva = signal('');
  passConfirm = signal('');

  onClose = output<void>();

  cerrar(): void {
    this.authService.logout();
    this.visible.set(false);
    this.onClose.emit();
  }

  guardar(): void {
    if (this.passNueva() !== this.passConfirm()) {
      this.error.set('Las contraseñas nuevas no coinciden');
      return;
    }
    if (this.passNueva().length < 6) {
      this.error.set('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    this.authService.cambiarPassword(this.passActual(), this.passNueva()).subscribe({
      next: () => {
        this.authService.marcarPasswordCambiada();
        this.guardando.set(false);
        this.visible.set(false);
        this.onClose.emit();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.message || 'Error al cambiar la contraseña');
      },
    });
  }
}
