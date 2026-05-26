import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { HceService, DocumentoHCE } from '../../services/hce';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-hce-page',
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './hce-page.html',
  styleUrl: './hce-page.css',
})
export class HcePageComponent implements OnInit {
  private hceService = inject(HceService);
  private auth = inject(AuthService);

  documentos = signal<DocumentoHCE[]>([]);
  cargando = signal(true);
  error = signal('');
  esAdmin = signal(false);

  ngOnInit() {
    this.esAdmin.set(this.auth.getRol() === 'ADMINISTRADOR');
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');

    const obs = this.esAdmin()
      ? this.hceService.listarTodas()
      : this.hceService.listarDocumentos();

    obs.subscribe({
      next: (data) => { this.documentos.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar los documentos.'); this.cargando.set(false); }
    });
  }

  descargar(doc: DocumentoHCE) {
    console.log('idConsulta:', doc.idConsulta, typeof doc.idConsulta);
    if (!doc.idConsulta) return;
    const win = window.open('', '_blank');
    if (!win) { this.error.set('Permite ventanas emergentes para ver el PDF.'); return; }
    win.document.write('Cargando PDF...');
    const obs = this.esAdmin()
      ? this.hceService.descargarPdfAdmin(doc.idConsulta)
      : this.hceService.descargar(doc.idConsulta);
    obs.subscribe({
      next: blob => {
        win.location.replace(URL.createObjectURL(blob));
      },
      error: () => { win.close(); this.error.set('Error al descargar el PDF.'); }
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
