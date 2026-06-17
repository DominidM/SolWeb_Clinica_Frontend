import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { SupervisionService, PracticanteAsignado, ConsultaPendiente } from '../../services/supervision.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-evaluaciones-practicantes-page',
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './evaluaciones-practicantes-page.html',
  styleUrl: './evaluaciones-practicantes-page.css',
})
export class EvaluacionesPracticantesPageComponent {
  private svc = inject(SupervisionService);
  private auth = inject(AuthService);

  practicantes = signal<PracticanteAsignado[]>([]);
  practicanteSeleccionado = signal<PracticanteAsignado | null>(null);
  consultasPendientes = signal<ConsultaPendiente[]>([]);
  evaluaciones = signal<any[]>([]);
  loading = signal(false);
  loadingConsultas = signal(false);
  mensaje = signal('');

  // Formulario actividad
  actTitulo = '';
  actDescripcion = '';
  actTipo = 'REVISION_VIRTUAL';
  actFecha = '';
  actHora = '';
  actPacienteId: number | null = null;

  // Evaluacion
  evalObservaciones = '';
  evalEstado = 'APROBADO';

  // Asignar practicante
  busquedaPracticante = '';
  resultadosBusqueda = signal<PracticanteAsignado[]>([]);

  // Tabs
  tabActivo: 'actividades' | 'consultas' | 'evaluaciones' = 'actividades';

  constructor() {
    this.cargarPracticantes();
  }

  buscarPracticantes() {
    const q = this.busquedaPracticante.trim();
    if (q.length < 2) { this.resultadosBusqueda.set([]); return; }
    this.svc.buscarPracticantesDisponibles(q).subscribe({
      next: (res) => this.resultadosBusqueda.set(res),
    });
  }

  asignarPracticante(p: PracticanteAsignado) {
    this.svc.asignarPracticante(p.idPracticante).subscribe({
      next: () => {
        this.mensaje.set(`Practicante ${p.nombre} asignado`);
        this.resultadosBusqueda.set([]);
        this.busquedaPracticante = '';
        this.cargarPracticantes();
      },
      error: () => this.mensaje.set('Error al asignar practicante'),
    });
  }

  removerPracticante(event: Event, p: PracticanteAsignado) {
    event.stopPropagation();
    if (!confirm(`¿Remover a ${p.nombre} de tu lista?`)) return;
    this.svc.removerPracticante(p.idPracticante).subscribe({
      next: () => {
        this.mensaje.set(`Practicante ${p.nombre} removido`);
        if (this.practicanteSeleccionado()?.idPracticante === p.idPracticante) {
          this.cerrarDetalle();
        }
        this.cargarPracticantes();
      },
      error: () => this.mensaje.set('Error al remover practicante'),
    });
  }

  cargarPracticantes() {
    this.loading.set(true);
    this.svc.listarPracticantes().subscribe({
      next: (res) => { this.practicantes.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.mensaje.set('Error al cargar practicantes'); },
    });
  }

  seleccionarPracticante(p: PracticanteAsignado) {
    this.practicanteSeleccionado.set(p);
    this.mensaje.set('');
    this.tabActivo = 'actividades';
    this.cargarConsultasPendientes(p.idPracticante);
    this.cargarEvaluaciones(p.idPracticante);
  }

  cerrarDetalle() {
    this.practicanteSeleccionado.set(null);
    this.consultasPendientes.set([]);
  }

  cargarConsultasPendientes(idPracticante: number) {
    this.loadingConsultas.set(true);
    this.svc.listarConsultasPendientes(idPracticante).subscribe({
      next: (res) => { this.consultasPendientes.set(res); this.loadingConsultas.set(false); },
      error: () => { this.loadingConsultas.set(false); },
    });
  }

  cargarEvaluaciones(idPracticante: number) {
    this.svc.listarEvaluaciones(idPracticante).subscribe({
      next: (res) => this.evaluaciones.set(res),
    });
  }

  asignarActividad() {
    const p = this.practicanteSeleccionado();
    if (!p || !this.actTitulo.trim()) return;

    this.svc.asignarActividad({
      idPracticante: p.idPracticante,
      titulo: this.actTitulo,
      descripcion: this.actDescripcion,
      tipo: this.actTipo,
      fecha: this.actFecha || undefined,
      hora: this.actHora || undefined,
      idPaciente: this.actPacienteId || undefined,
    }).subscribe({
      next: () => {
        this.mensaje.set('Actividad asignada correctamente');
        this.actTitulo = '';
        this.actDescripcion = '';
        this.actFecha = '';
        this.actHora = '';
        this.actPacienteId = null;
        this.cargarPracticantes();
      },
      error: () => this.mensaje.set('Error al asignar actividad'),
    });
  }

  evaluarConsulta(consulta: ConsultaPendiente, estado: string) {
    const p = this.practicanteSeleccionado();
    if (!p) return;

    this.svc.evaluar({
      idPracticante: p.idPracticante,
      idConsulta: consulta.idConsulta,
      estado: estado,
      observaciones: this.evalObservaciones,
    }).subscribe({
      next: () => {
        this.mensaje.set(`Consulta ${estado === 'APROBADO' ? 'aprobada' : 'rechazada'}`);
        this.evalObservaciones = '';
        this.cargarConsultasPendientes(p.idPracticante);
        this.cargarEvaluaciones(p.idPracticante);
      },
      error: () => this.mensaje.set('Error al evaluar consulta'),
    });
  }
}
