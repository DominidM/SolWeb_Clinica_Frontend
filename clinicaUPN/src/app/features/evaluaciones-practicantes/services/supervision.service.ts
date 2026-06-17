import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PracticanteAsignado {
  idPracticante: number;
  nombre: string;
  email: string;
  consultasPendientes: number;
  consultasRevisadas: number;
}

export interface EvaluacionRequest {
  idPracticante: number;
  idConsulta?: number;
  estado?: string;
  observaciones?: string;
}

export interface EvaluacionResponse {
  idSupervision: number;
  doctor: string;
  practicante: string;
  idConsulta: number | null;
  paciente: string;
  estado: string;
  observaciones: string;
  createdAt: string;
}

export interface AsignarActividadRequest {
  idPracticante: number;
  titulo: string;
  descripcion?: string;
  tipo: string;
  fecha?: string;
  hora?: string;
  idPaciente?: number;
}

export interface ConsultaPendiente {
  idConsulta: number;
  idPaciente: number;
  paciente: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  prescripcion: string;
  fecha: string;
  estadoRevision: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class SupervisionService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/medico/supervision';

  listarPracticantes(): Observable<PracticanteAsignado[]> {
    return this.http.get<ApiResponse<PracticanteAsignado[]>>(`${this.API}/practicantes`)
      .pipe(map(res => res.data));
  }

  listarEvaluaciones(idPracticante: number): Observable<EvaluacionResponse[]> {
    return this.http.get<ApiResponse<EvaluacionResponse[]>>(`${this.API}/evaluaciones/${idPracticante}`)
      .pipe(map(res => res.data));
  }

  evaluar(req: EvaluacionRequest): Observable<EvaluacionResponse> {
    return this.http.post<ApiResponse<EvaluacionResponse>>(`${this.API}/evaluar`, req)
      .pipe(map(res => res.data));
  }

  asignarActividad(req: AsignarActividadRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.API}/actividades`, req)
      .pipe(map(() => void 0));
  }

  listarConsultasPendientes(idPracticante: number): Observable<ConsultaPendiente[]> {
    return this.http.get<ApiResponse<ConsultaPendiente[]>>(`${this.API}/consultas-pendientes/${idPracticante}`)
      .pipe(map(res => res.data));
  }

  buscarPracticantesDisponibles(q: string): Observable<PracticanteAsignado[]> {
    return this.http.get<ApiResponse<PracticanteAsignado[]>>(`${this.API}/practicantes-disponibles?q=${q}`)
      .pipe(map(res => res.data));
  }

  asignarPracticante(idPracticante: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.API}/asignar-practicante/${idPracticante}`, {})
      .pipe(map(() => void 0));
  }

  removerPracticante(idPracticante: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/asignar-practicante/${idPracticante}`)
      .pipe(map(() => void 0));
  }
}
