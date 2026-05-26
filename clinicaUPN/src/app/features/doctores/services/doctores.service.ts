import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Doctor {
  idDoctor: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
  telefono: string;
  estado: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class DoctoresService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin/doctores';

  listar(): Observable<Doctor[]> {
    return this.http.get<ApiResponse<Doctor[]>>(this.API)
      .pipe(map(res => res.data));
  }

  actualizarEspecialidad(id: number, especialidad: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/especialidad`, { especialidad });
  }
}
