import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin/usuarios';

  listar(page: number = 0, size: number = 10): Observable<PageResult<Usuario>> {
    return this.http.get<ApiResponse<PageResult<Usuario>>>(`${this.API}?page=${page}&size=${size}`)
      .pipe(map(res => res.data));
  }

  asignarRol(id: number, rol: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/rol`, { rol });
  }
}
