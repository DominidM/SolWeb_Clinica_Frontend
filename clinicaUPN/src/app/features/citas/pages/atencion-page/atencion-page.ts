import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ConsultaService, ConsultaResponse } from '../../services/consulta.service';
import { CitaService, AgendaItem } from '../../services/cita';

@Component({
  selector: 'app-atencion-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './atencion-page.html',
  styleUrl: './atencion-page.css',
})
export class AtencionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
  private citaService = inject(CitaService);

  cita = signal<AgendaItem | null>(null);
  consulta = signal<ConsultaResponse | null>(null);
  loading = signal(true);
  error = signal('');

  // formulario diagnóstico
  diagnosticoCie10 = signal('');
  descripcionDiagnostico = signal('');

  // formulario tratamiento
  tratamiento = signal('');

  // formulario prescripción
  prescripcion = signal('');

  guardando = signal(false);
  guardado = signal(false);
  paso = signal<'iniciar' | 'diagnostico' | 'tratamiento' | 'prescripcion' | 'completo'>('iniciar');
  consultaId = signal<number | null>(null);

  ngOnInit(): void {
    const idCita = Number(this.route.snapshot.paramMap.get('idCita'));
    if (!idCita) {
      this.error.set('ID de cita no válido');
      this.loading.set(false);
      return;
    }
    this.cargarCita(idCita);
  }

  private cargarCita(idCita: number): void {
    this.citaService.verAgenda(undefined, undefined).subscribe({
      next: (citas) => {
        const encontrada = citas.find(c => c.idCita === idCita);
        if (encontrada) {
          this.cita.set(encontrada);
          this.iniciarConsulta(idCita);
        } else {
          this.error.set('Cita no encontrada en la agenda de hoy');
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Error al cargar la cita');
        this.loading.set(false);
      },
    });
  }

  private iniciarConsulta(idCita: number): void {
    this.consultaService.iniciar(idCita).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.consultaId.set(res.idConsulta);
        this.loading.set(false);
        this.paso.set('diagnostico');
      },
      error: (err) => {
        this.error.set('Error al iniciar consulta: ' + (err.error?.message || 'Intente de nuevo'));
        this.loading.set(false);
      },
    });
  }

  guardarDiagnostico(): void {
    if (!this.diagnosticoCie10().trim() && !this.descripcionDiagnostico().trim()) return;
    this.guardando.set(true);
    this.consultaService.registrarDiagnostico(this.consultaId()!, this.diagnosticoCie10(), this.descripcionDiagnostico()).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.guardando.set(false);
        this.guardado.set(true);
        this.paso.set('tratamiento');
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('Error al guardar diagnóstico');
      },
    });
  }

  guardarTratamiento(): void {
    if (!this.tratamiento().trim()) return;
    this.guardando.set(true);
    this.consultaService.registrarTratamiento(this.consultaId()!, this.tratamiento()).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.guardando.set(false);
        this.guardado.set(true);
        this.paso.set('prescripcion');
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('Error al guardar tratamiento');
      },
    });
  }

  guardarPrescripcion(): void {
    if (!this.prescripcion().trim()) return;
    this.guardando.set(true);
    this.consultaService.prescribir(this.consultaId()!, this.prescripcion()).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.guardando.set(false);
        this.guardado.set(true);
        this.paso.set('completo');
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('Error al guardar prescripción');
      },
    });
  }

  saltarPaso(): void {
    const pasos = ['diagnostico', 'tratamiento', 'prescripcion'] as const;
    const idx = pasos.indexOf(this.paso() as typeof pasos[number]);
    if (idx < pasos.length - 1) {
      this.paso.set(pasos[idx + 1]);
    } else {
      this.paso.set('completo');
    }
  }

  volverAgenda(): void {
    this.router.navigate(['/app/citas']);
  }
}
