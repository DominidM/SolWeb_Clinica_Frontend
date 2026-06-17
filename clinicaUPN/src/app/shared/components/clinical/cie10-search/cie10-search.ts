import { Component, inject, input, model, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, Subscription } from 'rxjs';
import { Cie10Service, Cie10Item } from '../../../../features/citas/services/cie10.service';

@Component({
  selector: 'app-cie10-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cie10-search" (click)="abierto.set(true)" (keydown.escape)="abierto.set(false)">
      <label class="form-label small fw-semibold">{{ label() }}</label>
      <div class="cie10-input-wrap">
        <input
          type="text"
          class="form-control form-control-sm"
          [placeholder]="placeholder()"
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearch($event)"
          (focus)="abierto.set(true)"
          (blur)="onBlur()"
        />
        @if (codigoSeleccionado()) {
          <span class="cie10-badge">{{ codigoSeleccionado() }}</span>
        }
      </div>
      @if (abierto() && resultados().length > 0) {
        <ul class="cie10-dropdown">
          @for (r of resultados(); track r.codigo) {
            <li (mousedown)="seleccionar(r)" [class.active]="codigoSeleccionado() === r.codigo">
              <strong>{{ r.codigo }}</strong>
              <span class="cie10-desc">{{ r.descripcion }}</span>
            </li>
          }
        </ul>
      }
      @if (codigoSeleccionado() && descripcionSeleccionada()) {
        <div class="cie10-selected mt-1 small text-muted">
          {{ descripcionSeleccionada() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .cie10-search { position: relative; }
    .cie10-input-wrap { position: relative; }
    .cie10-badge {
      position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
      background: var(--accent, #3498db); color: #fff; font-size: .7rem;
      font-weight: 700; padding: 1px 8px; border-radius: 10px;
    }
    .cie10-dropdown {
      position: absolute; z-index: 100; width: 100%; max-height: 200px; overflow-y: auto;
      background: var(--bg-card, #fff); border: 1px solid var(--border-color, #ddd);
      border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,.12);
      list-style: none; padding: 4px; margin: 4px 0 0;
    }
    .cie10-dropdown li {
      padding: 6px 10px; cursor: pointer; border-radius: 4px;
      font-size: .82rem; display: flex; gap: 8px; align-items: baseline;
    }
    .cie10-dropdown li:hover, .cie10-dropdown li.active { background: var(--bg-hover, #eef2ff); }
    .cie10-desc { color: var(--text-secondary, #666); font-size: .78rem; }
  `]
})
export class Cie10SearchComponent implements OnDestroy {
  private cie10Service = inject(Cie10Service);

  label = input('CIE-10');
  placeholder = input('Buscar código CIE-10...');
  codigo = model<string>('');
  descripcion = model<string>('');

  searchTerm = signal('');
  resultados = signal<Cie10Item[]>([]);
  abierto = signal(false);
  codigoSeleccionado = signal('');
  descripcionSeleccionada = signal('');

  private searchSubject = new Subject<string>();
  private sub: Subscription;

  constructor() {
    this.sub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.cie10Service.buscar(q))
    ).subscribe(r => this.resultados.set(r));
  }

  onSearch(value: string) {
    this.searchTerm.set(value);
    this.codigoSeleccionado.set('');
    this.descripcionSeleccionada.set('');
    this.codigo.set('');
    this.descripcion.set('');
    if (value.trim().length >= 2) {
      this.searchSubject.next(value.trim());
    } else {
      this.resultados.set([]);
    }
  }

  seleccionar(item: Cie10Item) {
    this.codigoSeleccionado.set(item.codigo);
    this.descripcionSeleccionada.set(item.descripcion);
    this.searchTerm.set(item.codigo + ' - ' + item.descripcion);
    this.codigo.set(item.codigo);
    this.descripcion.set(item.descripcion);
    this.resultados.set([]);
    this.abierto.set(false);
  }

  onBlur() {
    setTimeout(() => this.abierto.set(false), 200);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
