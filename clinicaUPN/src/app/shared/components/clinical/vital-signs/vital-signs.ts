import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vital-signs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vital-signs">
      <h6 class="fw-bold mb-3">{{ label() }}</h6>
      <div class="vital-grid">
        <div class="vital-field">
          <label class="small fw-semibold text-muted">Presión Arterial</label>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="120/80" [ngModel]="presionArterial()" (ngModelChange)="presionArterial.set($event)" />
            <span class="input-group-text">mmHg</span>
          </div>
        </div>
        <div class="vital-field">
          <label class="small fw-semibold text-muted">Frec. Cardíaca</label>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="72" [ngModel]="frecuenciaCardiaca()" (ngModelChange)="frecuenciaCardiaca.set($event)" />
            <span class="input-group-text">lpm</span>
          </div>
        </div>
        <div class="vital-field">
          <label class="small fw-semibold text-muted">Temperatura</label>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="36.5" [ngModel]="temperatura()" (ngModelChange)="temperatura.set($event)" />
            <span class="input-group-text">°C</span>
          </div>
        </div>
        <div class="vital-field">
          <label class="small fw-semibold text-muted">Frec. Respiratoria</label>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="16" [ngModel]="frecuenciaRespiratoria()" (ngModelChange)="frecuenciaRespiratoria.set($event)" />
            <span class="input-group-text">rpm</span>
          </div>
        </div>
        <div class="vital-field">
          <label class="small fw-semibold text-muted">Sat. Oxígeno</label>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="98" [ngModel]="saturacionOxigeno()" (ngModelChange)="saturacionOxigeno.set($event)" />
            <span class="input-group-text">%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vital-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .vital-field { display: flex; flex-direction: column; gap: 4px; }
    .input-group-text { font-size: .75rem; }
  `]
})
export class VitalSignsComponent {
  label = () => 'Signos Vitales';

  presionArterial = model('');
  frecuenciaCardiaca = model('');
  temperatura = model('');
  frecuenciaRespiratoria = model('');
  saturacionOxigeno = model('');
}
