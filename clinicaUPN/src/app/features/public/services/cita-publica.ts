import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PacienteSearchResult {
  idPaciente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

export interface CitaPublicaRequest {
  idPaciente?: number;
  nombre: string;
  email: string;
  telefono: string;
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
}

export interface CitaPublicaResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class CitaPublicaService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/citas/publica';
  private readonly API_PACIENTES = 'http://localhost:8080/api/pacientes';

  buscarPaciente(email: string, codigo: string): Observable<PacienteSearchResult | null> {
    const params = new HttpParams()
      .set('email', email)
      .set('codigo', codigo);
    return this.http.get<any>(`${this.API_PACIENTES}/buscar`, { params })
      .pipe(map(res => res.data ?? null));
  }

  agendar(dto: CitaPublicaRequest): Observable<CitaPublicaResponse> {
    return this.http.post<CitaPublicaResponse>(this.API, dto);
  }
}
