import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';

export interface ActividadDTO {
  idActividad: number;
  titulo: string;
  descripcion?: string;
  tipo: string;
  fecha: string;
  hora: string;
  estado: string;
  paciente?: string;
  supervisor?: string;
}

export interface ConsultaDTO {
  idConsulta?: number;
  idPaciente: number;
  paciente: string;
  motivo: string;
  diagnostico?: string;
  receta?: string;
  estado: string;
  fecha: string;
  supervisor?: string;
}

export interface EvaluacionDTO {
  idEvaluacion: number;
  fecha: string;
  puntuacion: number;
  comentario: string;
  supervisor: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class PracticanteService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API = 'http://localhost:8080/api/practicante';

  private email() {
    return this.auth.getUser()?.email ?? '';
  }

  listarActividades(): Observable<ActividadDTO[]> {
    return this.http.get<ApiResponse<ActividadDTO[]>>(`${this.API}/actividades?email=${this.email()}`)
      .pipe(map(res => res.data));
  }

  obtenerActividad(id: number): Observable<ActividadDTO> {
    return this.http.get<ApiResponse<ActividadDTO>>(`${this.API}/actividades/${id}?email=${this.email()}`)
      .pipe(map(res => res.data));
  }

  registrarConsulta(dto: Partial<ConsultaDTO>): Observable<ConsultaDTO> {
    return this.http.post<ApiResponse<ConsultaDTO>>(`${this.API}/consultas?email=${this.email()}`, dto)
      .pipe(map(res => res.data));
  }

  enviarARevision(idConsulta: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.API}/consultas/${idConsulta}/enviar-revision?email=${this.email()}`, {})
      .pipe(map(() => void 0));
  }

  listarEvaluaciones(): Observable<EvaluacionDTO[]> {
    return this.http.get<ApiResponse<EvaluacionDTO[]>>(`${this.API}/evaluaciones?email=${this.email()}`)
      .pipe(map(res => res.data));
  }

  buscarPacienteAsignado(termino: string): Observable<any[]> {
    const params = new HttpParams().set('email', this.email()).set('q', termino);
    return this.http.get<ApiResponse<any[]>>(`${this.API}/pacientes-asignados`, { params })
      .pipe(map(res => res.data));
  }
}
