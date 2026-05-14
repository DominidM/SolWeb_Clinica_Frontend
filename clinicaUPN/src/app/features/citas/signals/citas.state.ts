import { signal, computed } from '@angular/core';
import { CitaDTO } from '../services/cita';

export const misCitas = signal<CitaDTO[]>([]);
export const cargando = signal(false);
export const errorMsg = signal<string | null>(null);

export const citasPendientes = computed(() =>
  misCitas().filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA')
);

export const citasCompletadas = computed(() =>
  misCitas().filter(c => c.estado === 'COMPLETADA' || c.estado === 'CANCELADA')
);

export function cargarCitas(citas: CitaDTO[]) {
  misCitas.set(citas);
}

export function eliminarCita(id: number) {
  misCitas.update(lista => lista.filter(c => c.idCita !== id));
}

export function actualizarCita(actualizada: CitaDTO) {
  misCitas.update(lista =>
    lista.map(c => c.idCita === actualizada.idCita ? actualizada : c)
  );
}
