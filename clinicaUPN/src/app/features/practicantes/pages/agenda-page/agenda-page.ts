import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PracticanteService, ActividadDTO } from '../../services/practicante';
import { createIcons, RefreshCw, X, Calendar, Clock, User, ClipboardList, BadgeCheck, ChevronRight, Play, CheckCircle } from 'lucide';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './agenda-page.html',
  styleUrl: './agenda-page.css',
})
export class AgendaPageComponent implements AfterViewInit {
  private svc = inject(PracticanteService);

  actividades = signal<ActividadDTO[]>([]);
  actividadSeleccionada = signal<ActividadDTO | null>(null);
  loading = signal(false);
  mensaje = signal('');

  constructor() {
    this.cargarActividades();
  }

  ngAfterViewInit() {
    createIcons({
      icons: {
        'refresh-cw': RefreshCw,
        'x': X,
        'calendar': Calendar,
        'clock': Clock,
        'user': User,
        'clipboard-list': ClipboardList,
        'badge-check': BadgeCheck,
        'chevron-right': ChevronRight,
        'play': Play,
        'check-circle': CheckCircle,
      },
    });
  }

  cargarActividades() {
    this.loading.set(true);
    this.svc.listarActividades().subscribe({
      next: (res) => {
        this.actividades.set(res);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.mensaje.set('Error al cargar actividades'); },
    });
  }

  verDetalle(act: ActividadDTO) {
    this.svc.obtenerActividad(act.idActividad).subscribe({
      next: (res) => {
        this.actividadSeleccionada.set(res);
        this.mensaje.set('');
      },
    });
  }

  cerrarDetalle() {
    this.actividadSeleccionada.set(null);
    this.mensaje.set('');
  }

  iniciarActividad(act: ActividadDTO) {
    this.svc.actualizarEstadoActividad(act.idActividad, 'EN_PROGRESO').subscribe({
      next: () => {
        this.mensaje.set('Actividad iniciada');
        this.cargarActividades();
        this.verDetalle(act);
      },
      error: () => this.mensaje.set('Error al iniciar actividad'),
    });
  }

  getEstadoLabel(estado: string | undefined): string {
    const labels: Record<string, string> = {
      'PROGRAMADA': 'Programada',
      'EN_PROGRESO': 'En Progreso',
      'COMPLETADA': 'Completada',
    };
    return labels[estado ?? ''] || estado || '—';
  }

  completarActividad(act: ActividadDTO) {
    this.svc.actualizarEstadoActividad(act.idActividad, 'COMPLETADA').subscribe({
      next: () => {
        this.mensaje.set('Actividad completada');
        this.cargarActividades();
        this.verDetalle(act);
      },
      error: () => this.mensaje.set('Error al completar actividad'),
    });
  }
}
