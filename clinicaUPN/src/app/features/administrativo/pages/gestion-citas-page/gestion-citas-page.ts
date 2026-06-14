import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { AdministrativoService, CitaOperativa } from '../../services/administrativo.service';

@Component({
  selector: 'app-gestion-citas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './gestion-citas-page.html',
  styleUrl: './gestion-citas-page.css',
})
export class GestionCitasPageComponent implements OnInit {
  private svc = inject(AdministrativoService);

  citas = signal<CitaOperativa[]>([]);
  loading = signal(false);
  error = signal('');
  fecha = signal(new Date().toISOString().split('T')[0]);
  filtroEstado = signal('');
  accionId = signal<number | null>(null);

  mostrarModalCancelar = signal(false);
  citaACancelar = signal<CitaOperativa | null>(null);

  mostrarModalReprogramar = signal(false);
  citaAReprogramar = signal<CitaOperativa | null>(null);
  reprogFecha = signal('');
  reprogHora = signal('');

  slotsHorario = [
    '08:00','08:30','09:00','09:30','10:00','10:30',
    '11:00','11:30','12:00','12:30',
    '14:00','14:30','15:00','15:30','16:00','16:30'
  ];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.error.set('');
    this.svc.listarCitas(this.fecha(), this.filtroEstado() || undefined).subscribe({
      next: (data) => { this.citas.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar citas.'); this.loading.set(false); }
    });
  }

  confirmar(id: number) {
    this.accionId.set(id);
    this.svc.confirmarCita(id).subscribe({
      next: (actualizada) => {
        this.citas.update(list => list.map(c => c.idCita === id ? actualizada : c));
        this.accionId.set(null);
      },
      error: () => { this.error.set('Error al confirmar.'); this.accionId.set(null); }
    });
  }

  abrirModalCancelar(cita: CitaOperativa) {
    this.citaACancelar.set(cita);
    this.mostrarModalCancelar.set(true);
  }

  cerrarModalCancelar() {
    this.mostrarModalCancelar.set(false);
    this.citaACancelar.set(null);
  }

  confirmarCancelacion() {
    const cita = this.citaACancelar();
    if (!cita) return;
    this.accionId.set(cita.idCita);
    this.svc.cancelarCita(cita.idCita).subscribe({
      next: () => {
        this.citas.update(list => list.filter(c => c.idCita !== cita.idCita));
        this.cerrarModalCancelar();
        this.accionId.set(null);
      },
      error: () => { this.error.set('Error al cancelar.'); this.cerrarModalCancelar(); this.accionId.set(null); }
    });
  }

  abrirModalReprogramar(cita: CitaOperativa) {
    this.citaAReprogramar.set(cita);
    this.reprogFecha.set(cita.fecha);
    this.reprogHora.set(cita.hora);
    this.mostrarModalReprogramar.set(true);
  }

  cerrarModalReprogramar() {
    this.mostrarModalReprogramar.set(false);
    this.citaAReprogramar.set(null);
  }

  confirmarReprogramacion() {
    const cita = this.citaAReprogramar();
    if (!cita || !this.reprogFecha() || !this.reprogHora()) return;
    this.accionId.set(cita.idCita);
    this.svc.reprogramarCita(cita.idCita, this.reprogFecha(), this.reprogHora()).subscribe({
      next: (actualizada) => {
        this.citas.update(list => list.map(c => c.idCita === cita.idCita ? actualizada : c));
        this.cerrarModalReprogramar();
        this.accionId.set(null);
      },
      error: () => { this.error.set('Error al reprogramar.'); this.accionId.set(null); }
    });
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'badge-warning',
      'CONFIRMADA': 'badge-primary',
      'EN_ATENCION': 'badge-info',
      'ATENDIDA': 'badge-success',
      'CANCELADA': 'badge-danger',
      'NO_ASISTIO': 'badge-secondary',
    };
    return map[estado] || 'badge-secondary';
  }
}
