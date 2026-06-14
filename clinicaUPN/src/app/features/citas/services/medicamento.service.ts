import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MedicamentoItem {
  idMedicamento: number;
  nombre: string;
  concentracion: string;
  formaFarmaceutica: string;
  presentacion: string;
  laboratorio: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/medicamentos';

  buscar(q: string): Observable<MedicamentoItem[]> {
    return this.http.get<ApiResponse<MedicamentoItem[]>>(`${this.API}/buscar`, { params: { q } })
      .pipe(map(res => res.data));
  }
}
