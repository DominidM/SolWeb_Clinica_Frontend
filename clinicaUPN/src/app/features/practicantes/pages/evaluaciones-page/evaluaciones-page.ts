import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PracticanteService, EvaluacionDTO } from '../../services/practicante';

@Component({
  selector: 'app-evaluaciones-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluaciones-page.html',
  styleUrl: './evaluaciones-page.css',
})
export class EvaluacionesPageComponent {
  private svc = inject(PracticanteService);

  evaluaciones = signal<EvaluacionDTO[]>([]);
  loading = signal(false);

  constructor() {
    this.cargarEvaluaciones();
  }

  cargarEvaluaciones() {
    this.loading.set(true);
    this.svc.listarEvaluaciones().subscribe({
      next: (res) => this.evaluaciones.set(res),
      complete: () => this.loading.set(false),
    });
  }
}
