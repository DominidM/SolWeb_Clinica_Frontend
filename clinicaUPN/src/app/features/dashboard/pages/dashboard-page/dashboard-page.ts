import { Component, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { DashboardService, ReporteDiario, EnfermedadFrecuente, RendimientoPracticante } from '../../services/dashboard.service';
import { AuthService } from '../../../../core/services/auth';
import { createIcons, ClipboardList, CheckCircle, Stethoscope, XCircle, CalendarX, Users, UserCheck, Calendar, Activity, ArrowUpRight, TrendingUp, BarChart3, Brain } from 'lucide';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);

  reporte = signal<ReporteDiario | null>(null);
  loading = signal(true);
  error = signal('');
  fecha = signal(new Date().toISOString().split('T')[0]);

  // Filtros avanzados para DIRECTOR
  periodo = signal('diario');
  especialidadFiltro = signal('');

  enfermedadesFrecuentes = signal<EnfermedadFrecuente[]>([]);
  rendimientoPracticantes = signal<RendimientoPracticante[]>([]);

  especialidades = [
    'Medicina General', 'Obstetricia', 'Nutrición',
    'Psicología', 'Rehabilitación', 'Fisioterapia'
  ];

  esDirector = this.auth.getRol() === 'DIRECTOR';

  ngOnInit(): void {
    this.cargarReporte();
  }

  private renderIcons() {
    createIcons({
      icons: {
        Activity,
        ClipboardList,
        CheckCircle,
        Stethoscope,
        XCircle,
        CalendarX,
        Users,
        UserCheck,
        Calendar,
        ArrowUpRight,
        TrendingUp,
        BarChart3,
        Brain,
      },
    });
  }

  ngAfterViewInit() {
    this.renderIcons();
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboardService.obtenerReporteDiario(this.fecha()).subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.enfermedadesFrecuentes.set(data.enfermedadesFrecuentes || []);
        this.rendimientoPracticantes.set(data.rendimientoPracticantes || []);
        this.loading.set(false);
        setTimeout(() => this.renderIcons());
      },
      error: () => {
        this.error.set('Error al cargar el dashboard');
        this.loading.set(false);
      },
    });
  }

  cambiarPeriodo(p: string) {
    this.periodo.set(p);
    this.cargarReporte();
  }

  maxCantidad(items: { cantidad: number }[]): number {
    return Math.max(...items.map(i => i.cantidad), 1);
  }
}
