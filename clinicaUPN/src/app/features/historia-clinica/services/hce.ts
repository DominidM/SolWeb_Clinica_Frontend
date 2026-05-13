import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';

export interface DocumentoHCE {
  id: number;
  titulo: string;
  tipo: string;
  fecha: string;
  medico: string;
  url: string;
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
    const email = this.auth.getUser()?.email;
    const params = new HttpParams().set('email', email ?? '');
    return this.http.get<ApiResponse<DocumentoHCE[]>>(`${this.API}/documentos`, { params })
      .pipe(map(res => res.data));
  }

  descargar(id: number): void {
    const email = this.auth.getUser()?.email;
    const url = `${this.API}/documentos/${id}/descargar?email=${email}`;
    window.open(url, '_blank');
  }
}
