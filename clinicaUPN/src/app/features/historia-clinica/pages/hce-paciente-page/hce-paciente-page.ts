import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HceService, DocumentoHCE } from '../../services/hce';

@Component({
  selector: 'app-hce-paciente-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hce-paciente-page.html',
  styleUrl: './hce-paciente-page.css',
})
export class HcePacientePageComponent implements OnInit {
  private hceService = inject(HceService);

  documentos = signal<DocumentoHCE[]>([]);
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.hceService.listarDocumentos().subscribe({
      next: (data) => { this.documentos.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar los documentos.'); this.cargando.set(false); }
    });
  }

  getIcon(especialidad: string): string {
    const m: Record<string, string> = {
      'Psicología':        'bi-brain',
      'Medicina General':  'bi-heart-pulse',
      'Nutrición':         'bi-egg-fried',
      'Rehabilitación':    'bi-activity',
      'Fisioterapia':      'bi-person-walking',
      'Obstetricia':       'bi-gender-female',
    };
    return m[especialidad] || 'bi-file-earmark-medical';
  }

  getColor(especialidad: string): string {
    const m: Record<string, string> = {
      'Psicología':        '#534AB7',
      'Medicina General':  '#185FA5',
      'Nutrición':         '#3B6D11',
      'Rehabilitación':    '#dc3545',
      'Fisioterapia':      '#854F0B',
      'Obstetricia':       '#d63384',
    };
    return m[especialidad] || '#6c757d';
  }
}