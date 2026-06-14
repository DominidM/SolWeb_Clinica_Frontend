import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { HceService, DocumentoHCE } from '../../services/hce';
import { AuthService } from '../../../../core/services/auth';

function formatFecha(raw: string): string {
  if (!raw) return '—';
  const d = new Date(raw.split('T')[0].split(' ')[0]);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generarHtmlDocumento(doc: DocumentoHCE): string {
  const hoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const t = (v: string | null | undefined) => escHtml(v || '');
  const f = (v: string) => t(v ? formatFecha(v) : '');

  const diagHtml = doc.diagnosticoCie10 || doc.descripcionDiag
    ? `<div class="card">
        <div class="card-title">Diagnóstico</div>
        <div class="card-body">
          ${doc.diagnosticoCie10 ? `<span class="cie10">[${t(doc.diagnosticoCie10)}]</span> ` : ''}
          <span>${t(doc.descripcionDiag)}</span>
        </div>
      </div>`
    : '';

  const trataHtml = doc.tratamiento
    ? `<div class="card">
        <div class="card-title">Tratamiento</div>
        <div class="card-body">${t(doc.tratamiento)}</div>
      </div>`
    : '';

  const recetaHtml = doc.prescripcion
    ? `<div class="card">
        <div class="card-title">Prescripción</div>
        <div class="card-body">${t(doc.prescripcion)}</div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Historia Clínica - ${t(doc.nombrePaciente)}</title>
<style>
  @page { size: auto; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10.5pt;
  }

  /* ── Header ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 14px;
    border-bottom: 1.5px solid #e2e8f0;
    margin-bottom: 22px;
  }
  .header-left {}
  .header-clinica {
    font-size: 18pt;
    font-weight: 800;
    color: #1e3a8a;
    letter-spacing: 0.5px;
  }
  .header-sub {
    font-size: 8.5pt;
    color: #64748b;
    margin-top: 2px;
  }
  .header-right {
    text-align: right;
    font-size: 8pt;
    color: #475569;
    line-height: 1.7;
  }
  .header-right strong {
    color: #1e293b;
  }

  hr.divider {
    border: none;
    border-top: 1.5px solid #e2e8f0;
    margin: 18px 0;
  }

  /* ── Patient info grid ── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 28px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 22px;
  }
  .info-item {}
  .info-item .label {
    display: block;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
    margin-bottom: 1px;
  }
  .info-item .value {
    font-size: 10pt;
    font-weight: 600;
    color: #1e293b;
  }

  /* ── Clinical cards ── */
  .card {
    background: #f8fafc;
    border-left: 4px solid #3b82f6;
    border-radius: 6px;
    padding: 14px 18px;
    margin-bottom: 14px;
  }
  .card-title {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1e3a8a;
    margin-bottom: 8px;
  }
  .card-body {
    font-size: 10pt;
    color: #334155;
    line-height: 1.65;
  }
  .cie10 {
    display: inline-block;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 9pt;
    font-weight: 700;
    color: #1e40af;
    background: #dbeafe;
    padding: 1px 8px;
    border-radius: 4px;
    margin-right: 4px;
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    font-size: 7.5pt;
    color: #94a3b8;
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <div class="header-clinica">CLÍNICA UPN</div>
    <div class="header-sub">Historia Clínica Electrónica</div>
  </div>
  <div class="header-right">
    <strong>Tipo:</strong> Historia Clínica Electrónica<br>
    <strong>Emisión:</strong> ${escHtml(hoy)}<br>
    <strong>Documento:</strong> HCE-${t(doc.codigoEstudiante)}
  </div>
</div>

<div class="info-grid">
  <div class="info-item">
    <span class="label">Paciente</span>
    <span class="value">${t(doc.nombrePaciente)}</span>
  </div>
  <div class="info-item">
    <span class="label">Médico Tratante</span>
    <span class="value">${t(doc.nombreDoctor)}</span>
  </div>
  <div class="info-item">
    <span class="label">Código</span>
    <span class="value">${t(doc.codigoEstudiante)}</span>
  </div>
  <div class="info-item">
    <span class="label">Especialidad</span>
    <span class="value">${t(doc.especialidad)}</span>
  </div>
  <div class="info-item">
    <span class="label">Fecha de Atención</span>
    <span class="value">${f(doc.fecha)}</span>
  </div>
</div>

${diagHtml}
${trataHtml}
${recetaHtml}

<div class="footer">
  Documento generado electrónicamente por el Sistema de Salud de Clínica UPN — ${escHtml(hoy)}
</div>

</body>
</html>`;
}

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
  esStaff = signal(false);

  ngOnInit() {
    const rol = this.auth.getRol();
    this.esAdmin.set(rol === 'ADMINISTRADOR');
    this.esStaff.set(this.esAdmin() || rol === 'DOCTOR' || rol === 'MEDICO' || rol === 'DIRECTOR' || rol === 'PRACTICANTE');
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');

    const obs = this.esStaff()
      ? this.hceService.listarTodas()
      : this.hceService.listarDocumentos();

    obs.subscribe({
      next: (data) => { this.documentos.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar los documentos.'); this.cargando.set(false); }
    });
  }

  descargar(doc: DocumentoHCE) {
    const html = generarHtmlDocumento(doc);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;visibility:hidden';
    document.body.appendChild(iframe);

    const docIframe = iframe.contentWindow!.document;
    docIframe.open();
    docIframe.write(html);
    docIframe.close();

    iframe.contentWindow!.onafterprint = () => {
      document.body.removeChild(iframe);
    };

    iframe.contentWindow!.focus();
    setTimeout(() => iframe.contentWindow!.print(), 300);
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
