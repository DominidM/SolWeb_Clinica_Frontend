import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PracticanteService, ActividadDTO } from '../../services/practicante';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './agenda-page.html',
  styleUrl: './agenda-page.css',
})
export class AgendaPageComponent {
  private svc = inject(PracticanteService);

  actividades = signal<ActividadDTO[]>([]);
  actividadSeleccionada = signal<ActividadDTO | null>(null);
  loading = signal(false);

  constructor() {
    this.cargarActividades();
  }

  cargarActividades() {
    this.loading.set(true);
    this.svc.listarActividades().subscribe({
      next: (res) => this.actividades.set(res),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
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
