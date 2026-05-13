import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PracticanteService, ConsultaDTO } from '../../services/practicante';

@Component({
  selector: 'app-registrar-consulta-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-consulta-page.html',
  styleUrl: './registrar-consulta-page.css',
})
export class RegistrarConsultaPageComponent {
  private svc = inject(PracticanteService);

  // búsqueda paciente
  termino = signal('');
  resultadosPacientes = signal<any[]>([]);
  pacienteSeleccionado = signal<any | null>(null);
  buscando = signal(false);

  // formulario consulta
  motivo = signal('');
  diagnostico = signal('');
  receta = signal('');
  guardando = signal(false);
  consultaRegistrada = signal<ConsultaDTO | null>(null);
  mensaje = signal('');

  buscarPaciente() {
    const t = this.termino().trim();
    if (!t) return;
    this.buscando.set(true);
    this.svc.buscarPacienteAsignado(t).subscribe({
      next: (res) => this.resultadosPacientes.set(res),
      complete: () => this.buscando.set(false),
    });
  }

  seleccionarPaciente(p: any) {
    this.pacienteSeleccionado.set(p);
    this.resultadosPacientes.set([]);
    this.termino.set('');
  }

  registrar() {
    if (!this.pacienteSeleccionado() || !this.motivo().trim()) return;
    this.guardando.set(true);
    this.mensaje.set('');

    const dto: Partial<ConsultaDTO> = {
      idPaciente: this.pacienteSeleccionado()!.id,
      motivo: this.motivo(),
      diagnostico: this.diagnostico(),
      receta: this.receta(),
    };

    this.svc.registrarConsulta(dto).subscribe({
      next: (res) => {
        this.consultaRegistrada.set(res);
        this.mensaje.set('Consulta registrada exitosamente.');
      },
      error: () => {
        this.mensaje.set('Error al registrar la consulta.');
      },
      complete: () => this.guardando.set(false),
    });
  }

  enviarARevision() {
    const id = this.consultaRegistrada()?.idConsulta;
    if (!id) return;
    this.svc.enviarARevision(id).subscribe({
      next: () => {
        this.mensaje.set('Consulta enviada a revisión del médico.');
        this.limpiarFormulario();
      },
      error: () => {
        this.mensaje.set('Error al enviar a revisión.');
      },
    });
  }

  limpiarFormulario() {
    this.consultaRegistrada.set(null);
    this.motivo.set('');
    this.diagnostico.set('');
    this.receta.set('');
    this.pacienteSeleccionado.set(null);
  }
}
