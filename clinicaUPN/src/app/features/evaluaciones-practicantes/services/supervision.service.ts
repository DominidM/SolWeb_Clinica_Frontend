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
}
