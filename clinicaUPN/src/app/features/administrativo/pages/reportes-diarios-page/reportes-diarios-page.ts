import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { AdministrativoService, ReporteOperativoDiario } from '../../services/administrativo.service';

@Component({
  selector: 'app-reportes-diarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './reportes-diarios-page.html',
  styleUrl: './reportes-diarios-page.css',
})
export class ReportesDiariosPageComponent {
  private svc = inject(AdministrativoService);

  reporte = signal<ReporteOperativoDiario | null>(null);
  loading = signal(false);
  error = signal('');
  fecha = signal(new Date().toISOString().split('T')[0]);

  cargarReporte() {
    this.loading.set(true);
    this.error.set('');
    this.svc.obtenerReporteDiario(this.fecha()).subscribe({
      next: (data) => { this.reporte.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar reporte.'); this.loading.set(false); }
    });
  }

  exportarCSV() {
    const r = this.reporte();
    if (!r) return;
    const headers = ['Paciente', 'Doctor', 'Especialidad', 'Fecha', 'Hora', 'Estado'];
    const rows = r.citas.map(c => [c.paciente, c.doctor, c.especialidad, c.fecha, c.hora, c.estado]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-diario-${this.fecha()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
