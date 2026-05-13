import { signal, computed } from '@angular/core';
import { TeleconsultaDTO } from '../services/consulta';

export const teleconsultas = signal<TeleconsultaDTO[]>([]);
export const cargando = signal(false);
export const errorMsg = signal<string | null>(null);

export const pendientes = computed(() =>
  teleconsultas().filter(t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADA')
);
export const completadas = computed(() =>
  teleconsultas().filter(t => t.estado === 'COMPLETADA' || t.estado === 'CANCELADA')
);

export function cargarTeleconsultas(lista: TeleconsultaDTO[]) {
  teleconsultas.set(lista);
}
