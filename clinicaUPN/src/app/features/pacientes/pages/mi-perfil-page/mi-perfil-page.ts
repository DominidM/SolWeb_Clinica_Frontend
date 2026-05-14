import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { AuthService } from '../../../../core/services/auth';
import { PacienteService, PacienteDTO } from '../../services/paciente';

@Component({
  selector: 'app-mi-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './mi-perfil-page.html',
  styleUrl: './mi-perfil-page.css',
})
export class MiPerfilPageComponent implements OnInit {
  private auth = inject(AuthService);
  private pacienteService = inject(PacienteService);

  paciente = signal<PacienteDTO | null>(null);
  cargando = signal(true);
  error = signal('');
  editando = signal(false);
  guardando = signal(false);
  exito = signal('');

  form: Partial<PacienteDTO> = {};

  ngOnInit() {
    const email = this.auth.getUser()?.email;
    if (!email) { this.error.set('Sesión no encontrada'); this.cargando.set(false); return; }
    this.pacienteService.buscarPorEmail(email).subscribe({
      next: (data) => {
        this.paciente.set(data);
        this.form = { ...data };
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil.');
        this.cargando.set(false);
      }
    });
  }

  activarEdicion() {
    this.form = { ...this.paciente()! };
    this.editando.set(true);
    this.exito.set('');
  }

  cancelarEdicion() {
    this.editando.set(false);
    this.form = {};
    this.exito.set('');
  }

  guardar() {
    if (!this.form.nombre || !this.form.apellido || !this.form.email) {
      this.error.set('Nombre, apellido y email son obligatorios');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');
    this.pacienteService.actualizar(this.paciente()!.idPaciente!, this.form as PacienteDTO).subscribe({
      next: (actualizado) => {
        this.paciente.set(actualizado);
        this.form = { ...actualizado };
        this.editando.set(false);
        this.guardando.set(false);
        this.exito.set('Datos actualizados correctamente');
      },
      error: () => {
        this.error.set('Error al actualizar. Intenta de nuevo.');
        this.guardando.set(false);
      }
    });
  }
}
