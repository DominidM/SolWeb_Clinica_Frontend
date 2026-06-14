import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ConsultorioDTO {
  idConsultorio: number;
  nombre: string;
  ubicacion: string;
  asignacion?: AsignacionDTO;
}

export interface AsignacionDTO {
  idAsignacion: number;
  idDoctor: number;
  doctorNombre: string;
  especialidad: string;
  horario: string;
  fechaAsignacion: string;
}

export interface RegistrarAsignacionRequest {
  idConsultorio: number;
  idDoctor: number;
  especialidad: string;
  horario: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ConsultorioService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin/consultorios';

  listar(): Observable<ConsultorioDTO[]> {
    return this.http.get<ApiResponse<ConsultorioDTO[]>>(this.API)
      .pipe(map(r => r.data));
  }

  asignar(dto: RegistrarAsignacionRequest): Observable<AsignacionDTO> {
    return this.http.post<ApiResponse<AsignacionDTO>>(`${this.API}/asignar`, dto)
      .pipe(map(r => r.data));
  }

  liberar(idAsignacion: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/asignacion/${idAsignacion}`)
      .pipe(map(() => void 0));
  }
}
