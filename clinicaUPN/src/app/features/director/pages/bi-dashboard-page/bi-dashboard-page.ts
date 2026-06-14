import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { BIDashboardService, BIDashboardData, FiltrosBI } from '../../services/bi-dashboard.service';

@Component({
  selector: 'app-bi-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './bi-dashboard-page.html',
  styleUrl: './bi-dashboard-page.css',
})
export class BiDashboardPageComponent implements OnInit {
  private svc = inject(BIDashboardService);

  loading = signal(false);
  data = signal<BIDashboardData | null>(null);

  periodo = signal('HOY');
  especialidad = signal('');

  periodos = [
    { value: 'HOY', label: 'Hoy' },
    { value: 'SEMANA', label: 'Esta Semana' },
    { value: 'MES', label: 'Este Mes' },
    { value: 'CICLO_2026_1', label: 'Ciclo 2026-1' },
  ];

  especialidades = [
    'Medicina General',
    'Obstetricia',
    'Nutrición',
    'Psicología',
    'Rehabilitación',
    'Fisioterapia',
  ];

  ngOnInit() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.loading.set(true);
    const filtros: FiltrosBI = {
      periodo: this.periodo(),
      especialidad: this.especialidad(),
    };
    this.svc.obtenerDashboard(filtros).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(this.generarMockData(filtros));
        this.loading.set(false);
      },
    });
  }

  private generarMockData(filtros: FiltrosBI): BIDashboardData {
    const multi = filtros.periodo === 'SEMANA' ? 5
                : filtros.periodo === 'MES' ? 22
                : filtros.periodo === 'CICLO_2026_1' ? 90
                : 1;
    return {
      kpi: {
        totalAtenciones: 28 * multi,
        variacionAtenciones: 12,
        citasAgendadas: 42 * multi,
        tasaCancelacion: 8.3,
        teleconsultasActivas: 6,
      },
      enfermedades: [
        { codigo: 'R10.4', descripcion: 'Dolor abdominal', cantidad: 32 },
        { codigo: 'J00', descripcion: 'Resfriado común', cantidad: 28 },
        { codigo: 'K29.5', descripcion: 'Gastritis crónica', cantidad: 21 },
        { codigo: 'I10', descripcion: 'Hipertensión esencial', cantidad: 17 },
        { codigo: 'M54.5', descripcion: 'Lumbago', cantidad: 13 },
      ],
      distribucion: [
        { especialidad: 'Medicina General', cantidad: 94, porcentaje: 31 },
        { especialidad: 'Psicología', cantidad: 62, porcentaje: 20 },
        { especialidad: 'Nutrición', cantidad: 48, porcentaje: 16 },
        { especialidad: 'Obstetricia', cantidad: 40, porcentaje: 13 },
        { especialidad: 'Rehabilitación', cantidad: 35, porcentaje: 12 },
        { especialidad: 'Fisioterapia', cantidad: 25, porcentaje: 8 },
      ],
      practicantes: [
        { nombre: 'Luis García', codigo: 'UPN001', consultasRegistradas: 18, enviosRevision: 15, promedioEvaluacion: 17.5 },
        { nombre: 'Braulio Aguirre', codigo: 'UPN002', consultasRegistradas: 14, enviosRevision: 12, promedioEvaluacion: 14.2 },
        { nombre: 'Sebastian Asmat', codigo: 'UPN003', consultasRegistradas: 21, enviosRevision: 19, promedioEvaluacion: 18.1 },
        { nombre: 'John Rojas', codigo: 'UPN004', consultasRegistradas: 9, enviosRevision: 7, promedioEvaluacion: 12.8 },
      ],
    };
  }

  notaColor(promedio: number): string {
    if (promedio >= 16) return 'nota-verde';
    if (promedio >= 13) return 'nota-ambar';
    return 'nota-roja';
  }

  especialidadColor(especialidad: string): string {
    const colores: Record<string, string> = {
      'Medicina General': '#3b82f6',
      'Obstetricia': '#ec4899',
      'Nutrición': '#22c55e',
      'Psicología': '#a78bfa',
      'Rehabilitación': '#f59e0b',
      'Fisioterapia': '#06b6d4',
    };
    return colores[especialidad] || '#64748b';
  }

  porcentajeBarra(cantidad: number, maximo: number): number {
    return maximo > 0 ? (cantidad / maximo) * 100 : 0;
  }
}
