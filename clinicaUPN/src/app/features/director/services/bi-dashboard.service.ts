import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DashboardKPI {
  totalAtenciones: number;
  variacionAtenciones: number;
  citasAgendadas: number;
  tasaCancelacion: number;
  teleconsultasActivas: number;
}

export interface EnfermedadFrecuente {
  codigo: string;
  descripcion: string;
  cantidad: number;
}

export interface DistribucionEspecialidad {
  especialidad: string;
  cantidad: number;
  porcentaje: number;
}

export interface RendimientoPracticante {
  nombre: string;
  codigo: string;
  consultasRegistradas: number;
  enviosRevision: number;
  promedioEvaluacion: number;
}

export interface BIDashboardData {
  kpi: DashboardKPI;
  enfermedades: EnfermedadFrecuente[];
  distribucion: DistribucionEspecialidad[];
  practicantes: RendimientoPracticante[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FiltrosBI {
  periodo: string;
  especialidad: string;
}

@Injectable({ providedIn: 'root' })
export class BIDashboardService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/director';

  obtenerDashboard(filtros: FiltrosBI): Observable<BIDashboardData> {
    let params = new HttpParams()
      .set('periodo', filtros.periodo)
      .set('especialidad', filtros.especialidad || 'TODAS');
    return this.http.get<ApiResponse<BIDashboardData>>(`${this.API}/dashboard-bi`, { params })
      .pipe(map(r => r.data));
  }
}
