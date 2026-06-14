import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DisponibilidadDTO {
  idDisponibilidad?: number;
  idDoctor: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/doctores';

  listarDisponibilidad(idDoctor: number): Observable<DisponibilidadDTO[]> {
    return this.http.get<ApiResponse<DisponibilidadDTO[]>>(`${this.API}/${idDoctor}/disponibilidad`)
      .pipe(map(res => res.data));
  }

  crearDisponibilidad(dto: DisponibilidadDTO): Observable<DisponibilidadDTO> {
    return this.http.post<ApiResponse<DisponibilidadDTO>>(`${this.API}/disponibilidad`, dto)
      .pipe(map(res => res.data));
  }

  actualizarDisponibilidad(id: number, dto: DisponibilidadDTO): Observable<DisponibilidadDTO> {
    return this.http.put<ApiResponse<DisponibilidadDTO>>(`${this.API}/disponibilidad/${id}`, dto)
      .pipe(map(res => res.data));
  }

  eliminarDisponibilidad(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/disponibilidad/${id}`)
      .pipe(map(() => void 0));
  }
}
