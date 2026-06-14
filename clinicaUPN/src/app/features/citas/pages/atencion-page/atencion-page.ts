import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { Cie10SearchComponent } from '../../../../shared/components/clinical/cie10-search/cie10-search';
import { VitalSignsComponent } from '../../../../shared/components/clinical/vital-signs/vital-signs';
import { MedicationListComponent, MedicationEntry } from '../../../../shared/components/clinical/medication-list/medication-list';
import { ConsultaService, ConsultaResponse } from '../../services/consulta.service';
import { RecetaService, RecetaRequest } from '../../services/receta.service';
import { CitaService, AgendaItem } from '../../services/cita';
import { PacienteService, PacienteDTO } from '../../../pacientes/services/paciente';

type TabId = 'subjetivo' | 'objetivo' | 'diagnostico' | 'plan';

@Component({
  selector: 'app-atencion-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeaderComponent,
    Cie10SearchComponent, VitalSignsComponent, MedicationListComponent
  ],
  templateUrl: './atencion-page.html',
  styleUrl: './atencion-page.css',
})
export class AtencionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
  private recetaService = inject(RecetaService);
  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);

  cita = signal<AgendaItem | null>(null);
  consulta = signal<ConsultaResponse | null>(null);
  pacienteInfo = signal<PacienteDTO | null>(null);
  loading = signal(true);
  error = signal('');
  guardando = signal(false);
  guardado = signal(false);
  tabActivo = signal<TabId>('subjetivo');
  consultaId = signal<number | null>(null);
  completado = signal(false);

  motivoConsulta = signal('');
  enfermedadActual = signal('');
  sintomas = signal('');
  tratamiento = signal('');
  recetaCreada = signal(false);

  cie10Codigo = signal('');
  cie10Descripcion = signal('');
  descripcionDiagnostico = signal('');

  readonly tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'subjetivo', label: 'Subjetivo', icon: 'bi-chat-quote' },
    { id: 'objetivo', label: 'Objetivo', icon: 'bi-activity' },
    { id: 'diagnostico', label: 'Diagnóstico', icon: 'bi-clipboard2-pulse' },
    { id: 'plan', label: 'Plan', icon: 'bi-journal-text' },
  ];

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
          this.cargarPaciente(encontrada.idPaciente);
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

  private cargarPaciente(idPaciente: number): void {
    this.pacienteService.buscarPorId(idPaciente).subscribe({
      next: (paciente) => this.pacienteInfo.set(paciente),
    });
  }

  private iniciarConsulta(idCita: number): void {
    this.consultaService.iniciar(idCita).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.consultaId.set(res.idConsulta);
        if (res.motivoConsulta) this.motivoConsulta.set(res.motivoConsulta);
        if (res.enfermedadActual) this.enfermedadActual.set(res.enfermedadActual);
        if (res.sintomas) this.sintomas.set(res.sintomas);
        if (res.tratamiento) this.tratamiento.set(res.tratamiento);
        if (res.diagnosticoCie10) this.cie10Codigo.set(res.diagnosticoCie10);
        if (res.descripcionDiagnostico) this.descripcionDiagnostico.set(res.descripcionDiagnostico);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al iniciar consulta: ' + (err.error?.message || 'Intente de nuevo'));
        this.loading.set(false);
      },
    });
  }

  guardarSubjetivo(): void {
    this.guardando.set(true);
    this.consultaService.registrarNotasSOAP(this.consultaId()!, {
      motivoConsulta: this.motivoConsulta(),
      enfermedadActual: this.enfermedadActual(),
      sintomas: this.sintomas()
    }).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.guardando.set(false);
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 2000);
      },
      error: () => { this.guardando.set(false); this.error.set('Error al guardar notas subjetivas'); }
    });
  }

  guardarSignosVitales(vitalComp: VitalSignsComponent): void {
    this.guardando.set(true);
    this.consultaService.registrarSignosVitales(this.consultaId()!, {
      presionArterial: vitalComp.presionArterial(),
      frecuenciaCardiaca: vitalComp.frecuenciaCardiaca(),
      temperatura: vitalComp.temperatura(),
      frecuenciaRespiratoria: vitalComp.frecuenciaRespiratoria(),
      saturacionOxigeno: vitalComp.saturacionOxigeno()
    }).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.guardando.set(false);
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 2000);
      },
      error: () => { this.guardando.set(false); this.error.set('Error al guardar signos vitales'); }
    });
  }

  guardarDiagnostico(): void {
    this.guardando.set(true);
    this.consultaService.registrarDiagnostico(
      this.consultaId()!,
      this.cie10Codigo(),
      this.descripcionDiagnostico()
    ).subscribe({
      next: (res) => {
        this.consulta.set(res);
        this.guardando.set(false);
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 2000);
      },
      error: () => { this.guardando.set(false); this.error.set('Error al guardar diagnóstico'); }
    });
  }

  guardarPlan(medComp: MedicationListComponent): void {
    this.guardando.set(true);
    const items = medComp.items();
    if (items.length > 0) {
      this.recetaService.crear({
        idConsulta: this.consultaId()!,
        indicaciones: this.tratamiento(),
        detalles: items.map(i => ({
          nombreMedicamento: i.nombreMedicamento,
          dosis: i.dosis,
          frecuencia: i.frecuencia,
          duracion: i.duracion,
          via: i.via
        }))
      }).subscribe({
        next: () => {
          this.recetaCreada.set(true);
          this.finalizar();
        },
        error: () => { this.guardando.set(false); this.error.set('Error al crear receta'); }
      });
    } else {
      this.consultaService.registrarTratamiento(this.consultaId()!, this.tratamiento()).subscribe({
        next: () => this.finalizar(),
        error: () => { this.guardando.set(false); this.error.set('Error al guardar plan'); }
      });
    }
  }

  private finalizar(): void {
    this.completado.set(true);
    this.guardando.set(false);
    this.guardado.set(true);
  }

  volverAgenda(): void {
    this.router.navigate(['/app/citas']);
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'CONFIRMADA': 'badge-primary', 'EN_ATENCION': 'badge-warning',
      'ATENDIDA': 'badge-success', 'CANCELADA': 'badge-danger'
    };
    return map[estado] || 'badge-secondary';
  }
}
