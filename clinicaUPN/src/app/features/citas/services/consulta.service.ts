import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ConsultaResponse {
  idConsulta: number;
  idCita: number;
  idPaciente: number;
  paciente: string;
  idDoctor: number;
  doctor: string;
  diagnosticoCie10: string | null;
  descripcionDiagnostico: string | null;
  tratamiento: string | null;
  prescripcion: string | null;
  presionArterial: string | null;
  frecuenciaCardiaca: string | null;
  temperatura: string | null;
  frecuenciaRespiratoria: string | null;
  saturacionOxigeno: string | null;
  motivoConsulta: string | null;
  enfermedadActual: string | null;
  sintomas: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/consultas';

  iniciar(idCita: number): Observable<ConsultaResponse> {
    return this.http.post<ApiResponse<ConsultaResponse>>(this.API, { idCita })
      .pipe(map(res => res.data));
  }

  obtener(id: number): Observable<ConsultaResponse> {
    return this.http.get<ApiResponse<ConsultaResponse>>(`${this.API}/${id}`)
      .pipe(map(res => res.data));
  }

  registrarDiagnostico(id: number, cie10: string, descripcion: string): Observable<ConsultaResponse> {
    return this.http.put<ApiResponse<ConsultaResponse>>(`${this.API}/${id}/diagnostico`, { diagnosticoCie10: cie10, descripcionDiagnostico: descripcion })
      .pipe(map(res => res.data));
  }

  registrarTratamiento(id: number, tratamiento: string): Observable<ConsultaResponse> {
    return this.http.put<ApiResponse<ConsultaResponse>>(`${this.API}/${id}/tratamiento`, { tratamiento })
      .pipe(map(res => res.data));
  }

  prescribir(id: number, prescripcion: string): Observable<ConsultaResponse> {
    return this.http.put<ApiResponse<ConsultaResponse>>(`${this.API}/${id}/prescripcion`, { prescripcion })
      .pipe(map(res => res.data));
  }

  registrarSignosVitales(id: number, data: { presionArterial?: string; frecuenciaCardiaca?: string; temperatura?: string; frecuenciaRespiratoria?: string; saturacionOxigeno?: string }): Observable<ConsultaResponse> {
    return this.http.put<ApiResponse<ConsultaResponse>>(`${this.API}/${id}/signos-vitales`, data)
      .pipe(map(res => res.data));
  }

  registrarNotasSOAP(id: number, data: { motivoConsulta?: string; enfermedadActual?: string; sintomas?: string }): Observable<ConsultaResponse> {
    return this.http.put<ApiResponse<ConsultaResponse>>(`${this.API}/${id}/notas-soap`, data)
      .pipe(map(res => res.data));
  }
}
