import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { TeleconsultaService, TeleconsultaDTO, EspecialidadDTO, DoctorDisponibleDTO } from '../../services/consulta';
import { AuthService } from '../../../../core/services/auth';
import { NotificacionService } from '../../services/notificacion.service';
import * as state from '../../signals/teleconsulta.state';

@Component({
  selector: 'app-consulta-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './consulta-page.html',
  styleUrl: './consulta-page.css',
})
export class ConsultaPageComponent implements OnInit, OnDestroy {
  private service = inject(TeleconsultaService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notiSvc = inject(NotificacionService);
  private notiSub: Subscription | null = null;

  readonly teleconsultas = state.teleconsultas;
  readonly cargando = state.cargando;
  readonly errorMsg = state.errorMsg;
  readonly pendientes = state.pendientes;
  readonly completadas = state.completadas;

  esDoctor = signal(false);
  mostrarFormulario = signal(false);
  formMedico = signal('');
  formEspecialidad = signal('');
  formFecha = signal('');
  formHora = signal('');
  formMotivo = signal('');
  formLoading = signal(false);
  formError = signal('');
  aceptando = signal<number | null>(null);

  especialidades = signal<EspecialidadDTO[]>([]);
  doctores = signal<DoctorDisponibleDTO[]>([]);
  slots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];

  ngOnInit() {
    const rol = this.auth.getRol();
    this.esDoctor.set(rol === 'DOCTOR' || rol === 'MEDICO');
    this.cargar();
    if (!this.esDoctor()) this.cargarEspecialidades();

    this.notiSub = this.notiSvc.onNotificacion$.subscribe(() => {
      this.cargar();
    });
  }

  ngOnDestroy() {
    this.notiSub?.unsubscribe();
  }

  cargar() {
    state.cargando.set(true);
    state.errorMsg.set(null);
    this.service.listar().subscribe({
      next: (data) => { state.cargarTeleconsultas(data); state.cargando.set(false); },
      error: () => { state.errorMsg.set('No se pudieron cargar las teleconsultas.'); state.cargando.set(false); }
    });
  }

  cargarEspecialidades() {
    this.service.listarEspecialidades().subscribe({
      next: (data) => this.especialidades.set(data),
      error: () => {} // silencioso, se queda vacío
    });
  }

  onEspecialidadChange() {
    this.formMedico.set('');
    const esp = this.formEspecialidad();
    if (esp) {
      this.service.listarDoctores(esp).subscribe({
        next: (data) => this.doctores.set(data),
        error: () => this.doctores.set([])
      });
    } else {
      this.doctores.set([]);
    }
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
    const id = t.idTeleconsulta;
    if (id) this.router.navigate(['/app/teleconsulta/sala', id]);
  }

  aceptar(t: TeleconsultaDTO) {
    const id = t.idTeleconsulta;
    if (!id) return;
    this.aceptando.set(id);
    this.service.aceptar(id).subscribe({
      next: () => { this.aceptando.set(null); this.cargar(); },
      error: () => { this.aceptando.set(null); state.errorMsg.set('Error al aceptar la teleconsulta.'); }
    });
  }

  completar(t: TeleconsultaDTO) {
    const id = t.idTeleconsulta;
    if (!id) return;
    this.aceptando.set(id);
    this.service.completar(id).subscribe({
      next: () => { this.aceptando.set(null); this.cargar(); },
      error: () => { this.aceptando.set(null); state.errorMsg.set('Error al finalizar la teleconsulta.'); }
    });
  }

  getEstadoClass(e: string): string {
    const m: Record<string,string> = { 'PENDIENTE':'badge-warning','CONFIRMADA':'badge-primary','COMPLETADA':'badge-success','CANCELADA':'badge-danger' };
    return m[e] || 'badge-secondary';
  }
}
