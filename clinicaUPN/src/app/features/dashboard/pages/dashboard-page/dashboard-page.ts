import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { DashboardService, ReporteDiario } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  reporte = signal<ReporteDiario | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboardService.obtenerReporteDiario().subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el dashboard');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
