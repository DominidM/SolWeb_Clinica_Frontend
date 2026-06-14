import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicamentoService, MedicamentoItem } from '../../../features/citas/services/medicamento.service';

export interface MedicationEntry {
  idMedicamento?: number;
  nombreMedicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  via: string;
}

@Component({
  selector: 'app-medication-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medication-list">
      <h6 class="fw-bold mb-3">{{ label() }}</h6>

      <div class="med-items">
        @for (item of items(); track $index; let i = $index) {
          <div class="med-row">
            <div class="med-row-header">
              <strong class="small">{{ item.nombreMedicamento || 'Medicamento #' + (i + 1) }}</strong>
              <button class="btn-close btn-close-sm" (click)="eliminar(i)" title="Eliminar"></button>
            </div>
            <div class="med-row-fields">
              <input type="text" class="form-control form-control-sm" placeholder="Medicamento" [ngModel]="item.nombreMedicamento" (ngModelChange)="item.nombreMedicamento = $event; sugerir(i, $event)" />
              <input type="text" class="form-control form-control-sm" placeholder="Dosis" [ngModel]="item.dosis" (ngModelChange)="item.dosis = $event" />
              <input type="text" class="form-control form-control-sm" placeholder="Frecuencia" [ngModel]="item.frecuencia" (ngModelChange)="item.frecuencia = $event" />
              <input type="text" class="form-control form-control-sm" placeholder="Duración" [ngModel]="item.duracion" (ngModelChange)="item.duracion = $event" />
              <select class="form-select form-select-sm" [ngModel]="item.via" (ngModelChange)="item.via = $event">
                <option value="">Vía</option>
                <option value="ORAL">Oral</option>
                <option value="IV">IV</option>
                <option value="IM">IM</option>
                <option value="SC">SC</option>
                <option value="TOPICO">Tópico</option>
                <option value="INHALADO">Inhalado</option>
              </select>
            </div>
            @if (sugerenciasIndex() === i && sugerencias().length > 0) {
              <ul class="med-suggestions">
                @for (s of sugerencias(); track s.idMedicamento) {
                  <li (mousedown)="seleccionarSugerencia(i, s)">
                    <strong>{{ s.nombre }}</strong>
                    <span class="text-muted small"> {{ s.concentracion }} - {{ s.laboratorio }}</span>
                  </li>
                }
              </ul>
            }
          </div>
        }
      </div>

      <button class="btn btn-outline-primary btn-sm mt-2" (click)="agregar()">
        <i class="bi bi-plus-lg me-1"></i>Agregar medicamento
      </button>
    </div>
  `,
  styles: [`
    .med-items { display: flex; flex-direction: column; gap: 12px; }
    .med-row { background: var(--bg-body, #f8f9fa); border: 1px solid var(--border-color, #dee2e6); border-radius: 8px; padding: 12px; position: relative; }
    .med-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .med-row-fields { display: grid; grid-template-columns: 1fr 80px 100px 90px 100px; gap: 6px; }
    .med-suggestions {
      position: absolute; z-index: 100; left: 12px; right: 12px; top: 100%;
      background: var(--bg-card, #fff); border: 1px solid var(--border-color, #ddd);
      border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,.12);
      list-style: none; padding: 4px; margin-top: 2px;
    }
    .med-suggestions li { padding: 4px 8px; cursor: pointer; border-radius: 4px; font-size: .8rem; }
    .med-suggestions li:hover { background: var(--bg-hover, #eef2ff); }
    @media (max-width: 768px) { .med-row-fields { grid-template-columns: 1fr 1fr; } }
  `]
})
export class MedicationListComponent {
  private medService = inject(MedicamentoService);

  label = () => 'Medicamentos';
  items = signal<MedicationEntry[]>([]);
  sugerencias = signal<MedicamentoItem[]>([]);
  sugerenciasIndex = signal<number | null>(null);

  agregar() {
    this.items.update(list => [...list, {
      nombreMedicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      via: ''
    }]);
  }

  eliminar(index: number) {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  sugerir(index: number, q: string) {
    if (q.trim().length < 2) {
      this.sugerencias.set([]);
      this.sugerenciasIndex.set(null);
      return;
    }
    this.sugerenciasIndex.set(index);
    this.medService.buscar(q).subscribe(r => this.sugerencias.set(r));
  }

  seleccionarSugerencia(index: number, item: MedicamentoItem) {
    this.items.update(list => {
      const updated = [...list];
      updated[index] = {
        ...updated[index],
        idMedicamento: item.idMedicamento,
        nombreMedicamento: `${item.nombre} ${item.concentracion}`.trim()
      };
      return updated;
    });
    this.sugerencias.set([]);
    this.sugerenciasIndex.set(null);
  }
}
