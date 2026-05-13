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
  descargando = signal<number | null>(null);

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

  descargar(doc: DocumentoHCE) {
    this.descargando.set(doc.id);
    this.hceService.descargar(doc.id);
    setTimeout(() => this.descargando.set(null), 2000);
  }

  getIcon(tipo: string): string {
    const m: Record<string, string> = {
      'RECETA': 'bi-file-text',
      'RESULTADO': 'bi-file-earmark-medical',
      'INFORME': 'bi-file-earmark-pdf',
      'ORDEN': 'bi-file-earmark-check',
    };
    return m[tipo] || 'bi-file-earmark';
  }

  getColor(tipo: string): string {
    const m: Record<string, string> = {
      'RECETA': '#185FA5',
      'RESULTADO': '#198754',
      'INFORME': '#dc3545',
      'ORDEN': '#6f42c1',
    };
    return m[tipo] || '#6c757d';
  }
}
