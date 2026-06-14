import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ConsultorioService, ConsultorioDTO, RegistrarAsignacionRequest } from '../../services/consultorio.service';

@Component({
  selector: 'app-consultorios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './consultorios-page.html',
  styleUrl: './consultorios-page.css',
})
export class ConsultoriosPageComponent implements OnInit {
  private svc = inject(ConsultorioService);

  consultorios = signal<ConsultorioDTO[]>([]);
  loading = signal(false);
  error = signal('');
  mensaje = signal('');
  esError = signal(false);

  mostrarFormulario = signal(false);
  idConsultorioSel = signal<number | null>(null);
  idDoctor = signal<number | null>(null);
  especialidad = signal('');
  horario = signal('');
  guardando = signal(false);

  listaDoctores = signal<{ idDoctor: number; nombre: string; especialidad: string }[]>([]);

  especialidades = [
    'Medicina General', 'Obstetricia', 'Nutrición',
    'Psicología', 'Rehabilitación', 'Fisioterapia'
  ];

  horarios = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.error.set('');
    this.svc.listar().subscribe({
      next: (data) => { this.consultorios.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar consultorios.'); this.loading.set(false); }
    });
  }

  abrirAsignar(consultorio: ConsultorioDTO) {
    this.idConsultorioSel.set(consultorio.idConsultorio);
    this.idDoctor.set(null);
    this.especialidad.set('');
    this.horario.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.idConsultorioSel.set(null);
  }

  asignar() {
    if (!this.idConsultorioSel() || !this.idDoctor() || !this.especialidad() || !this.horario()) {
      this.mensaje.set('Completa todos los campos.');
      this.esError.set(true);
      return;
    }
    this.guardando.set(true);
    this.mensaje.set('');
    this.esError.set(false);

    const dto: RegistrarAsignacionRequest = {
      idConsultorio: this.idConsultorioSel()!,
      idDoctor: this.idDoctor()!,
      especialidad: this.especialidad(),
      horario: this.horario(),
    };

    this.svc.asignar(dto).subscribe({
      next: () => {
        this.mensaje.set('Asignación registrada exitosamente.');
        this.cargar();
        this.cerrarFormulario();
        this.guardando.set(false);
      },
      error: (err) => {
        this.mensaje.set(err.error?.message || 'Error: conflicto de horario. El consultorio ya está asignado en este turno.');
        this.esError.set(true);
        this.guardando.set(false);
      }
    });
  }

  liberar(asignacionId: number) {
    if (!confirm('¿Liberar este consultorio?')) return;
    this.svc.liberar(asignacionId).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('Error al liberar consultorio.')
    });
  }

  getEstadoLabel(asignado: boolean): string {
    return asignado ? 'Asignado' : 'Disponible';
  }

  getEstadoClass(asignado: boolean): string {
    return asignado ? 'badge-primary' : 'badge-success';
  }
}
