import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReporteDiario {
  fecha: string;
  resumen: ResumenGeneral;
  porEspecialidad: CitasPorEspecialidad[];
  porDoctor: CitasPorDoctor[];
}

export interface ResumenGeneral {
  totalCitas: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
  noAsistieron: number;
  pacientesAtendidos: number;
  doctoresActivos: number;
}

export interface CitasPorEspecialidad {
  especialidad: string;
  cantidad: number;
}

export interface CitasPorDoctor {
  nombreDoctor: string;
  especialidad: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/reportes';

  obtenerReporteDiario(fecha?: string): Observable<ReporteDiario> {
    let params = new HttpParams();
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<ApiResponse<ReporteDiario>>(`${this.API}/operativo-diario`, { params })
      .pipe(map(res => res.data));
  }
}
