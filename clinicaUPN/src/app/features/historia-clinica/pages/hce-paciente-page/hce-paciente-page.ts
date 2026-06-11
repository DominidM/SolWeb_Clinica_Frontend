import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { HceService, DocumentoHCE } from '../../services/hce';

@Component({
  selector: 'app-hce-paciente-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './hce-paciente-page.html',
  styleUrl: './hce-paciente-page.css',
})
export class HcePacientePageComponent implements OnInit {
  private hceService = inject(HceService);

  documentos = signal<DocumentoHCE[]>([]);
  cargando = signal(true);
  error = signal('');

  private pdfGenerando = signal(false);

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

  descargarPDF(doc: DocumentoHCE) {
    if (this.pdfGenerando()) return;
    this.pdfGenerando.set(true);

    const html = this.generarHTMLReporte(doc);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    if (!win) {
      document.body.removeChild(iframe);
      this.pdfGenerando.set(false);
      return;
    }

    iframe.onload = () => {
      try {
        win!.focus();
        win!.print();
      } catch {
        document.body.removeChild(iframe);
        this.pdfGenerando.set(false);
      }
    };

    const checkClosed = setInterval(() => {
      if (win!.closed) {
        clearInterval(checkClosed);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        this.pdfGenerando.set(false);
      }
    }, 500);

    iframe.srcdoc = html;
  }

  private generarHTMLReporte(doc: DocumentoHCE): string {
    const fechaFormateada = new Date(doc.fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Clínico - ${doc.descripcionDiag}</title>
<style>
  @page { size: auto; margin: 15mm; }
  @media print {
    @page { size: auto; margin: 15mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    padding: 0;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 3px solid #0f3b5e;
    margin-bottom: 24px;
  }
  .header-logo {
    width: 56px;
    height: 56px;
    background: #0f3b5e;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    font-weight: 800;
  }
  .header-info h1 {
    font-size: 20px;
    color: #0f3b5e;
    margin: 0;
  }
  .header-info p {
    font-size: 13px;
    color: #64748b;
    margin: 2px 0 0;
  }
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f3b5e;
    margin: 20px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 6px 12px;
    font-size: 13px;
  }
  .info-grid .label {
    font-weight: 600;
    color: #475569;
  }
  .info-grid .value {
    color: #1e293b;
  }
  .diagnostico-box {
    background: #f1f5f9;
    border-left: 4px solid #0f3b5e;
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    margin: 12px 0;
    font-size: 14px;
  }
  .diagnostico-box strong {
    color: #0f3b5e;
  }
  .cie10-tag {
    display: inline-block;
    background: #dbeafe;
    color: #1e40af;
    font-family: 'Cascadia Code', 'Consolas', monospace;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 4px;
    font-weight: 600;
  }
  .content-block {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 8px 0;
    font-size: 13px;
    white-space: pre-wrap;
  }
  .footer {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    font-size: 11px;
    color: #94a3b8;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-logo">UPN</div>
    <div class="header-info">
      <h1>Clínica UPN &mdash; Reporte Clínico</h1>
      <p>Documento oficial de historial médico</p>
    </div>
  </div>

  <div class="section-title">Datos del Paciente</div>
  <div class="info-grid">
    <span class="label">Paciente</span>
    <span class="value">${doc.nombrePaciente}</span>
    <span class="label">Código</span>
    <span class="value">${doc.codigoEstudiante}</span>
    <span class="label">Fecha de atención</span>
    <span class="value">${fechaFormateada}</span>
  </div>

  <div class="section-title">Diagnóstico</div>
  <div class="diagnostico-box">
    <strong>${doc.descripcionDiag}</strong>
    <div style="margin-top:6px"><span class="cie10-tag">CIE-10: ${doc.diagnosticoCie10}</span></div>
  </div>

  <div class="section-title">Detalle de la Consulta</div>
  <div class="info-grid">
    <span class="label">Especialidad</span>
    <span class="value">${doc.especialidad}</span>
    <span class="label">Médico tratante</span>
    <span class="value">${doc.nombreDoctor}</span>
  </div>

  <div class="section-title">Tratamiento</div>
  <div class="content-block">${doc.tratamiento || 'No se registró tratamiento.'}</div>

  <div class="section-title">Prescripción</div>
  <div class="content-block">${doc.prescripcion || 'No se registró prescripción.'}</div>

  <div class="footer">
    Este documento es parte del historial clínico de ${doc.nombrePaciente}.<br>
    Generado el ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
  </div>
</body>
</html>`;
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
