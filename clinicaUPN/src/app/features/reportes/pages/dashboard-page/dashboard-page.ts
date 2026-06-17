import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ReporteService, SupervisionReporte } from '../../services/reporte';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPageComponent implements OnInit {
  private service = inject(ReporteService);

  reporte = signal<SupervisionReporte | null>(null);
  loading = signal(false);
  error = signal('');
  expandedDoctor = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.obtenerSupervisionReporte().subscribe({
      next: (data) => { this.reporte.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar reporte de supervisión.'); this.loading.set(false); },
    });
  }

  toggleDoctor(id: number): void {
    const s = new Set(this.expandedDoctor());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.expandedDoctor.set(s);
  }
}
