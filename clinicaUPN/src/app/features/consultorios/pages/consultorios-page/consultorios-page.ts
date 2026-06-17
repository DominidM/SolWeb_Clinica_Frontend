import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ConsultorioService, ConsultorioConAsignacion, AsignarRequest, DoctorItem } from '../../services/consultorio.service';

@Component({
  selector: 'app-consultorios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './consultorios-page.html',
  styleUrl: './consultorios-page.css',
})
export class ConsultoriosPageComponent implements OnInit {
  private svc = inject(ConsultorioService);

  consultorios = signal<ConsultorioConAsignacion[]>([]);
  loading = signal(false);
  error = signal('');
  mensaje = signal('');
  esError = signal(false);

  mostrarFormulario = signal(false);
  idConsultorioSel = signal<number | null>(null);
  idDoctor = signal<number | null>(null);
  diaSemana = signal('');
  horaInicio = signal('');
  horaFin = signal('');
  guardando = signal(false);

  listaDoctores = signal<DoctorItem[]>([]);

  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.error.set('');
    this.svc.listarConDetalle().subscribe({
      next: (data) => { this.consultorios.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar consultorios.'); this.loading.set(false); }
    });
    this.svc.listarDoctores().subscribe({
      next: (data) => this.listaDoctores.set(data),
    });
  }

  abrirAsignar(consultorio: ConsultorioConAsignacion) {
    this.idConsultorioSel.set(consultorio.idConsultorio);
    this.idDoctor.set(null);
    this.diaSemana.set('');
    this.horaInicio.set('');
    this.horaFin.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.idConsultorioSel.set(null);
  }

  asignar() {
    if (!this.idConsultorioSel() || !this.idDoctor() || !this.diaSemana() || !this.horaInicio() || !this.horaFin()) {
      this.mensaje.set('Completa todos los campos.');
      this.esError.set(true);
      return;
    }
    this.guardando.set(true);
    this.mensaje.set('');
    this.esError.set(false);

    const dto: AsignarRequest = {
      idConsultorio: this.idConsultorioSel()!,
      idDoctor: this.idDoctor()!,
      diaSemana: this.diaSemana(),
      horaInicio: this.horaInicio() + ':00',
      horaFin: this.horaFin() + ':00',
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
}
