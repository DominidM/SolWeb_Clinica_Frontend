import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';

export interface DocumentoHCE {
  idPaciente: number;
  nombrePaciente: string;
  fecha: string;
  diagnosticoCie10: string;
  descripcionDiag: string;
  tratamiento: string;
  prescripcion: string;
  nombreDoctor: string;
  especialidad: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class HceService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API = 'http://localhost:8080/api/hce';

  listarDocumentos(): Observable<DocumentoHCE[]> {
    return this.http
      .get<ApiResponse<DocumentoHCE[]>>(`${this.API}/documentos`)
      .pipe(map((res) => res.data));
  }

  descargar(id: number): void {
    const email = this.auth.getUser()?.email;
    const url = `${this.API}/documentos/${id}/descargar?email=${email}`;
    window.open(url, '_blank');
  }
}
