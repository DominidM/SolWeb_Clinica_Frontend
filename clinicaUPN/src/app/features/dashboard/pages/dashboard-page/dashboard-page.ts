import { Component, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { DashboardService, ReporteDiario } from '../../services/dashboard.service';
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

  // Simulación de reportes estratégicos para DIRECTOR
  enfermedadesFrecuentes = signal([
    { codigo: 'J45.0', descripcion: 'Asma alérgica', cantidad: 28 },
    { codigo: 'I10', descripcion: 'Hipertensión esencial', cantidad: 22 },
    { codigo: 'E11.9', descripcion: 'Diabetes tipo 2', cantidad: 19 },
    { codigo: 'F41.9', descripcion: 'Trastorno de ansiedad', cantidad: 15 },
    { codigo: 'M54.5', descripcion: 'Lumbago', cantidad: 12 },
  ]);

  rendimientoPracticantes = signal([
    { nombre: 'Luis García', consultas: 18, revisiones: 15, aprobadas: 14, puntuacion: 4.5 },
    { nombre: 'María Torres', consultas: 14, revisiones: 12, aprobadas: 12, puntuacion: 4.8 },
    { nombre: 'Pedro Sánchez', consultas: 10, revisiones: 8, aprobadas: 7, puntuacion: 4.2 },
  ]);

  especialidades = [
    'Medicina General', 'Obstetricia', 'Nutrición',
    'Psicología', 'Rehabilitación', 'Fisioterapia'
  ];

  esDirector = this.auth.getRol() === 'DIRECTOR';

  ngOnInit(): void {
    this.cargarReporte();
  }

  ngAfterViewInit() {
    createIcons({
      icons: {
        'clipboard-list': ClipboardList,
        'check-circle': CheckCircle,
        'stethoscope': Stethoscope,
        'x-circle': XCircle,
        'calendar-x': CalendarX,
        'users': Users,
        'user-check': UserCheck,
        'calendar': Calendar,
        'activity': Activity,
        'arrow-up-right': ArrowUpRight,
        'trending-up': TrendingUp,
        'bar-chart-3': BarChart3,
        'brain': Brain,
      },
    });
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboardService.obtenerReporteDiario(this.fecha()).subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.loading.set(false);
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
