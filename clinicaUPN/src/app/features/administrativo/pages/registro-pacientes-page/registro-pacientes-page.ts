import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PacienteService, PacienteDTO } from '../../../../features/pacientes/services/paciente';

@Component({
  selector: 'app-registro-pacientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './registro-pacientes-page.html',
  styleUrl: './registro-pacientes-page.css',
})
export class RegistroPacientesPageComponent {
  private svc = inject(PacienteService);

  guardando = signal(false);
  mensaje = signal('');
  esError = signal(false);

  form = signal<PacienteDTO>({
    nombre: '',
    apellido: '',
    email: '',
    password: 'ClinicaUPN2024',
    telefono: '',
    codigoEstudiante: '',
    fechaNacimiento: '',
    genero: '',
    tipoSangre: '',
    alergias: '',
  });

  limpiar() {
    this.form.set({
      nombre: '',
      apellido: '',
      email: '',
      password: 'ClinicaUPN2024',
      telefono: '',
      codigoEstudiante: '',
      fechaNacimiento: '',
      genero: '',
      tipoSangre: '',
      alergias: '',
    });
    this.mensaje.set('');
    this.esError.set(false);
  }

  registrar() {
    const f = this.form();
    if (!f.nombre.trim() || !f.apellido.trim() || !f.email.trim() || !f.fechaNacimiento || !f.genero) {
      this.mensaje.set('Completa todos los campos obligatorios.');
      this.esError.set(true);
      return;
    }
    this.guardando.set(true);
    this.mensaje.set('');
    this.esError.set(false);
    this.svc.registrar(f).subscribe({
      next: () => {
        this.mensaje.set('Paciente registrado exitosamente.');
        this.limpiar();
        this.guardando.set(false);
      },
      error: (err) => {
        this.mensaje.set(err.error?.message || 'Error al registrar paciente.');
        this.esError.set(true);
        this.guardando.set(false);
      }
    });
  }
}
