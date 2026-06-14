import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CitaOperativa {
  idCita: number;
  paciente: string;
  emailPaciente: string;
  doctor: string;
  especialidad: string;
  fecha: string;
  hora: string;
  tipo: string;
  estado: string;
  motivo: string;
}

export interface ReporteOperativoDiario {
  fecha: string;
  totalAtenciones: number;
  totalCanceladas: number;
  totalReprogramadas: number;
  citas: CitaOperativa[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdministrativoService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin';

  listarCitas(fecha: string, estado?: string): Observable<CitaOperativa[]> {
    let params = new HttpParams().set('fecha', fecha);
    if (estado) params = params.set('estado', estado);
    return this.http.get<ApiResponse<CitaOperativa[]>>(`${this.API}/citas`, { params })
      .pipe(map(r => r.data));
  }

  confirmarCita(idCita: number): Observable<CitaOperativa> {
    return this.http.put<ApiResponse<CitaOperativa>>(`${this.API}/citas/${idCita}/confirmar`, {})
      .pipe(map(r => r.data));
  }

  cancelarCita(idCita: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.API}/citas/${idCita}/cancelar`, {})
      .pipe(map(() => void 0));
  }

  reprogramarCita(idCita: number, fecha: string, hora: string): Observable<CitaOperativa> {
    return this.http.put<ApiResponse<CitaOperativa>>(`${this.API}/citas/${idCita}/reprogramar`, { fecha, hora })
      .pipe(map(r => r.data));
  }

  obtenerReporteDiario(fecha: string): Observable<ReporteOperativoDiario> {
    return this.http.get<ApiResponse<ReporteOperativoDiario>>(`${this.API}/reportes/operativo-diario?fecha=${fecha}`)
      .pipe(map(r => r.data));
  }
}
