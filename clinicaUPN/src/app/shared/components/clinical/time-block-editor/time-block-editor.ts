import { Component, inject, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, DisponibilidadDTO } from '../../../features/citas/services/doctor/doctor.service';

export const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
export const HORAS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

@Component({
  selector: 'app-time-block-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="time-block-editor">
      <h6 class="fw-bold mb-3">{{ label() }}</h6>

      <div class="dias-grid">
        @for (dia of dias; track dia) {
          <div class="dia-column">
            <div class="dia-header">{{ dia.charAt(0) + dia.slice(1).toLowerCase() }}</div>
            @for (hora of horas; track hora) {
              <div
                class="hora-slot"
                [class.ocupado]="isOcupado(dia, hora)"
                (click)="toggleSlot(dia, hora)"
              >
                {{ hora }}
              </div>
            }
          </div>
        }
      </div>

      @if (guardando()) {
        <div class="small text-muted mt-2">Guardando...</div>
      }
      @if (error()) {
        <div class="small text-danger mt-2">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    .dias-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
    .dia-column { display: flex; flex-direction: column; gap: 2px; }
    .dia-header { font-size: .7rem; font-weight: 700; text-transform: uppercase; text-align: center; padding: 4px; background: var(--bg-muted, #f0f0f0); border-radius: 4px; margin-bottom: 4px; }
    .hora-slot { font-size: .7rem; text-align: center; padding: 4px 2px; border: 1px solid var(--border-color, #dee2e6); border-radius: 3px; cursor: pointer; transition: all .12s; user-select: none; }
    .hora-slot:hover { background: var(--bg-hover, #eef2ff); }
    .hora-slot.ocupado { background: #3498db; color: #fff; border-color: #2980b9; font-weight: 600; }
    @media (max-width: 900px) { .dias-grid { grid-template-columns: repeat(3, 1fr); } }
  `]
})
export class TimeBlockEditorComponent {
  private doctorService = inject(DoctorService);

  label = () => 'Disponibilidad Horaria';

  idDoctor = input.required<number>();
  bloques = model<DisponibilidadDTO[]>([]);
  guardando = signal(false);
  error = signal('');

  readonly dias = DIAS;
  readonly horas = HORAS;

  isOcupado(dia: string, hora: string): boolean {
    return this.bloques().some(b =>
      b.diaSemana === dia &&
      hora >= b.horaInicio &&
      hora < b.horaFin
    );
  }

  toggleSlot(dia: string, hora: string) {
    const [hh, mm] = hora.split(':').map(Number);
    const horaInicio = hora;
    const horaFin = `${String(hh + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

    const existente = this.bloques().findIndex(b =>
      b.diaSemana === dia &&
      b.horaInicio <= hora &&
      b.horaFin > hora
    );

    if (existente >= 0) {
      this.bloques.update(list => list.filter((_, i) => i !== existente));
    } else {
      this.bloques.update(list => [...list, {
        idDoctor: this.idDoctor(),
        diaSemana: dia,
        horaInicio,
        horaFin
      }]);
    }
  }
}
