import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DetalleReceta {
  idMedicamento?: number;
  nombreMedicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  via: string;
}

export interface RecetaRequest {
  idConsulta: number;
  indicaciones?: string;
  detalles: DetalleReceta[];
}

export interface RecetaResponse {
  idReceta: number;
  idConsulta: number;
  doctor: string;
  paciente: string;
  indicaciones: string;
  createdAt: string;
  detalles: {
    idDetalle: number;
    idMedicamento: number | null;
    nombreMedicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    via: string;
  }[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class RecetaService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/recetas';

  crear(req: RecetaRequest): Observable<RecetaResponse> {
    return this.http.post<ApiResponse<RecetaResponse>>(this.API, req)
      .pipe(map(res => res.data));
  }

  listarPorConsulta(idConsulta: number): Observable<RecetaResponse[]> {
    return this.http.get<ApiResponse<RecetaResponse[]>>(`${this.API}/consulta/${idConsulta}`)
      .pipe(map(res => res.data));
  }
}
