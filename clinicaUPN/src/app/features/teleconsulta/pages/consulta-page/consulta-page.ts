import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeleconsultaService, TeleconsultaDTO } from '../../services/consulta';
import * as state from '../../signals/teleconsulta.state';

@Component({
  selector: 'app-consulta-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-page.html',
  styleUrl: './consulta-page.css',
})
export class ConsultaPageComponent implements OnInit {
  private service = inject(TeleconsultaService);
  private router = inject(Router);

  readonly teleconsultas = state.teleconsultas;
  readonly cargando = state.cargando;
  readonly errorMsg = state.errorMsg;
  readonly pendientes = state.pendientes;
  readonly completadas = state.completadas;

  mostrarFormulario = signal(false);
  formMedico = signal('');
  formEspecialidad = signal('');
  formFecha = signal('');
  formHora = signal('');
  formMotivo = signal('');
  formLoading = signal(false);
  formError = signal('');

  servicios = [
    'Medicina General', 'Obstetricia', 'Nutrición',
    'Psicología', 'Rehabilitación', 'Fisioterapia'
  ];

  medicos: Record<string, string[]> = {
    'Medicina General': ['Dr. Ricardo Palma', 'Dra. Carmen Lozano'],
    Obstetricia: ['Dra. Andrea Montes'],
    Nutrición: ['Dra. Ana Quispe', 'Dr. Luis Vega'],
    Psicología: ['Dr. Carlos Mendoza', 'Dra. Pamela Ríos'],
    Rehabilitación: ['Dr. Marco Silva'],
    Fisioterapia: ['Lic. Pedro Castillo'],
  };

  slots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    state.cargando.set(true);
    state.errorMsg.set(null);
    this.service.listar().subscribe({
      next: (data) => { state.cargarTeleconsultas(data); state.cargando.set(false); },
      error: () => { state.errorMsg.set('No se pudieron cargar las teleconsultas.'); state.cargando.set(false); }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario.set(true);
    this.formError.set('');
  }

  solicitar() {
    if (!this.formEspecialidad() || !this.formMedico() || !this.formFecha() || !this.formHora()) {
      this.formError.set('Completa todos los campos');
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');
    this.service.solicitar({
      especialidad: this.formEspecialidad(),
      medico: this.formMedico(),
      fecha: this.formFecha(),
      hora: this.formHora(),
      motivo: this.formMotivo(),
    }).subscribe({
      next: () => {
        this.formLoading.set(false);
        this.mostrarFormulario.set(false);
        this.formEspecialidad.set('');
        this.formMedico.set('');
        this.formFecha.set('');
        this.formHora.set('');
        this.formMotivo.set('');
        this.cargar();
      },
      error: () => {
        this.formLoading.set(false);
        this.formError.set('Error al solicitar teleconsulta.');
      }
    });
  }

  unirse(t: TeleconsultaDTO) {
    this.router.navigate(['/app/teleconsulta/sala', t.idTeleconsulta]);
  }

  getEstadoClass(e: string): string {
    const m: Record<string,string> = { 'PENDIENTE':'badge-warning','CONFIRMADA':'badge-primary','COMPLETADA':'badge-success','CANCELADA':'badge-danger' };
    return m[e] || 'badge-secondary';
  }
}
