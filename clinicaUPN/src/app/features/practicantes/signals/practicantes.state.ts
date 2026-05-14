import { signal, computed } from '@angular/core';
import { ActividadDTO, ConsultaDTO, EvaluacionDTO } from '../services/practicante';

export const actividades = signal<ActividadDTO[]>([]);
export const consultas = signal<ConsultaDTO[]>([]);
export const evaluaciones = signal<EvaluacionDTO[]>([]);
export const cargando = signal(false);
export const errorMsg = signal<string | null>(null);

export const actividadesPendientes = computed(() =>
  actividades().filter(a => a.estado === 'PENDIENTE' || a.estado === 'PROGRAMADA')
);

export const actividadesCompletadas = computed(() =>
  actividades().filter(a => a.estado === 'COMPLETADA')
);
