import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ConsultorioConAsignacion {
  idConsultorio: number;
  nombre: string;
  ubicacion: string;
  estado: string;
  asignacion?: AsignacionDetalle;
}

export interface AsignacionDetalle {
  idAsignacion: number;
  idDoctor: number;
  doctorNombre: string;
  especialidad: string;
  diaSemana: string;
  horario: string;
}

export interface AsignarRequest {
  idConsultorio: number;
  idDoctor: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface DoctorItem {
  idDoctor: number;
  nombre: string;
  especialidad: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ConsultorioService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/operaciones/consultorios';

  listarConDetalle(): Observable<ConsultorioConAsignacion[]> {
    return this.http.get<ApiResponse<ConsultorioConAsignacion[]>>(`${this.API}/con-detalle`)
      .pipe(map(r => r.data));
  }

  listarDoctores(): Observable<DoctorItem[]> {
    return this.http.get<ApiResponse<DoctorItem[]>>('http://localhost:8080/api/admin/doctores')
      .pipe(map(r => r.data));
  }

  asignar(dto: AsignarRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.API}/asignar`, dto)
      .pipe(map(() => void 0));
  }

  liberar(idAsignacion: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/asignacion/${idAsignacion}`)
      .pipe(map(() => void 0));
  }
}
