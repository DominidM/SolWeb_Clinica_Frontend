import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Cie10Item {
  codigo: string;
  descripcion: string;
  categoria: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class Cie10Service {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/cie10';

  buscar(q: string): Observable<Cie10Item[]> {
    return this.http.get<ApiResponse<Cie10Item[]>>(`${this.API}/buscar`, { params: { q } })
      .pipe(map(res => res.data));
  }
}
