import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PracticanteService, ConsultaDTO } from '../../services/practicante';

@Component({
  selector: 'app-registrar-consulta-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './registrar-consulta-page.html',
  styleUrl: './registrar-consulta-page.css',
})
export class RegistrarConsultaPageComponent {
  private svc = inject(PracticanteService);

  termino = signal('');
  resultadosPacientes = signal<any[]>([]);
  pacienteSeleccionado = signal<any | null>(null);
  buscando = signal(false);

  diagnostico = signal('');
  cie10 = signal('');
  tratamiento = signal('');
  prescripcion = signal('');
  guardando = signal(false);
  consultaRegistrada = signal<ConsultaDTO | null>(null);
  mensaje = signal('');
  esError = signal(false);
  enviandoRevision = signal(false);

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
    this.mensaje.set('');
    this.consultaRegistrada.set(null);
  }

  registrar() {
    if (!this.pacienteSeleccionado()) {
      this.mensaje.set('Selecciona un paciente asignado.');
      this.esError.set(true);
      return;
    }
    if (!this.diagnostico().trim()) {
      this.mensaje.set('El diagnóstico es obligatorio.');
      this.esError.set(true);
      return;
    }
    this.guardando.set(true);
    this.mensaje.set('');
    this.esError.set(false);

    const dto: Partial<ConsultaDTO> = {
      idPaciente: this.pacienteSeleccionado()!.id,
      diagnostico: this.diagnostico(),
      cie10: this.cie10(),
      tratamiento: this.tratamiento(),
      prescripcion: this.prescripcion(),
    };

    this.svc.registrarConsulta(dto).subscribe({
      next: (res) => {
        this.consultaRegistrada.set(res);
        this.mensaje.set('Consulta registrada bajo supervisión. Pendiente de revisión tutora.');
        this.guardando.set(false);
      },
      error: () => {
        this.mensaje.set('Error al registrar la consulta.');
        this.esError.set(true);
        this.guardando.set(false);
      },
    });
  }

  enviarARevision() {
    const id = this.consultaRegistrada()?.idConsulta;
    if (!id) return;
    this.enviandoRevision.set(true);
    this.svc.enviarARevision(id).subscribe({
      next: () => {
        this.mensaje.set('Consulta enviada a revisión del Dr. Carlos Mendoza.');
        this.limpiarFormulario();
        this.enviandoRevision.set(false);
      },
      error: () => {
        this.mensaje.set('Error al enviar a revisión.');
        this.esError.set(true);
        this.enviandoRevision.set(false);
      },
    });
  }

  limpiarFormulario() {
    this.consultaRegistrada.set(null);
    this.diagnostico.set('');
    this.cie10.set('');
    this.tratamiento.set('');
    this.prescripcion.set('');
    this.pacienteSeleccionado.set(null);
  }
}
