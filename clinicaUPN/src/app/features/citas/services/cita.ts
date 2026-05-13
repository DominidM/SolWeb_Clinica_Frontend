import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';

export interface CitaDTO {
  idCita?: number;
  idPaciente?: number;
  paciente?: string;
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
  estado: string;
  motivo?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CitaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API = 'http://localhost:8080/api/citas';

  listarMisCitas(): Observable<CitaDTO[]> {
    const email = this.auth.getUser()?.email;
    const params = new HttpParams().set('email', email ?? '');
    return this.http.get<ApiResponse<CitaDTO[]>>(`${this.API}/mis-citas`, { params })
      .pipe(map(res => res.data));
  }

  cancelar(id: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.API}/${id}/cancelar`, {})
      .pipe(map(() => void 0));
  }

  reprogramar(id: number, fecha: string, hora: string): Observable<CitaDTO> {
    return this.http.put<ApiResponse<CitaDTO>>(`${this.API}/${id}/reprogramar`, { fecha, hora })
      .pipe(map(res => res.data));
  }
}
