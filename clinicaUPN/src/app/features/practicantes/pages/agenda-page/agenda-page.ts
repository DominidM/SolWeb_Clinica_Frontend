import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PracticanteService, ActividadDTO } from '../../services/practicante';
import { createIcons, RefreshCw, X, Calendar, Clock, User, ClipboardList, BadgeCheck, ChevronRight } from 'lucide';

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
      error: () => this.loading.set(false),
    });
  }

  verDetalle(act: ActividadDTO) {
    this.svc.obtenerActividad(act.idActividad).subscribe({
      next: (res) => this.actividadSeleccionada.set(res),
    });
  }

  cerrarDetalle() {
    this.actividadSeleccionada.set(null);
  }
}
