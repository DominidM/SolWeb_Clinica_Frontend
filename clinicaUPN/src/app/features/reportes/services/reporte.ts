import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SupervisionReporte {
  totalDoctores: number;
  totalPracticantesAsignados: number;
  totalSinSupervisor: number;
  totalEvaluaciones: number;
  doctores: DoctorConPracticantes[];
}

export interface DoctorConPracticantes {
  idDoctor: number;
  nombreDoctor: string;
  especialidad: string;
  totalPracticantes: number;
  consultasSupervisadas: number;
  practicantes: PracticanteReporte[];
}

export interface PracticanteReporte {
  idPracticante: number;
  nombrePracticante: string;
  totalConsultas: number;
  aprobadas: number;
  pendientes: number;
  puntuacionPromedio: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/reportes';

  obtenerSupervisionReporte(): Observable<SupervisionReporte> {
    return this.http.get<ApiResponse<SupervisionReporte>>(`${this.API}/supervision`)
      .pipe(map(res => res.data));
  }
}
