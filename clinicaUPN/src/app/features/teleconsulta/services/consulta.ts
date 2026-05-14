import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';

export interface TeleconsultaDTO {
  idTeleconsulta?: number;
  paciente: string;
  medico: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: string;
  linkSala?: string;
  motivo?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class TeleconsultaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API = 'http://localhost:8080/api/teleconsulta';

  listar(): Observable<TeleconsultaDTO[]> {
    const email = this.auth.getUser()?.email;
    const params = new HttpParams().set('email', email ?? '');
    return this.http.get<ApiResponse<TeleconsultaDTO[]>>(`${this.API}/mis-teleconsultas`, { params })
      .pipe(map(res => res.data));
  }

  solicitar(dto: Partial<TeleconsultaDTO>): Observable<TeleconsultaDTO> {
    const email = this.auth.getUser()?.email;
    return this.http.post<ApiResponse<TeleconsultaDTO>>(`${this.API}/solicitar?email=${email}`, dto)
      .pipe(map(res => res.data));
  }

  obtenerSala(id: number): Observable<TeleconsultaDTO> {
    return this.http.get<ApiResponse<TeleconsultaDTO>>(`${this.API}/${id}`)
      .pipe(map(res => res.data));
  }
}
