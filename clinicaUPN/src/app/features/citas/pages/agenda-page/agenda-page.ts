import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { CitaService, AgendaItem } from '../../services/cita';
import { AuthService } from '../../../../core/services/auth';

export interface DoctorItem {
  idDoctor: number;
  nombre: string;
  especialidad: string;
}

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  templateUrl: './agenda-page.html',
  styleUrl: './agenda-page.css',
})
export class AgendaPageComponent implements OnInit {
  private citaService = inject(CitaService);
  private auth = inject(AuthService);

  citas = signal<AgendaItem[]>([]);
  loading = signal(true);
  error = signal('');
  doctores = signal<DoctorItem[]>([]);

  fecha = signal(new Date().toISOString().split('T')[0]);
  filtroEstado = signal('');
  doctorSeleccionado = signal<number | string>('');

  rol = this.auth.getRol();
  esAdmin = this.rol === 'ADMINISTRADOR' || this.rol === 'DIRECTOR';

  ngOnInit(): void {
    if (this.esAdmin) {
      this.cargarDoctores();
    }
    this.cargarAgenda();
  }

  cargarDoctores(): void {
    this.citaService.listarDoctores().subscribe({
      next: (data) => this.doctores.set(data),
    });
  }

  cargarAgenda(): void {
    this.loading.set(true);
    this.error.set('');
    this.citaService.verAgenda(this.fecha(), this.doctorSeleccionado()).subscribe({
      next: (data) => {
        this.citas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la agenda');
        this.loading.set(false);
      },
    });
  }

  cambiarFecha(f: string): void {
    this.fecha.set(f);
    this.cargarAgenda();
  }

  cambiarDoctor(): void {
    this.cargarAgenda();
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'CONFIRMADA': 'badge-primary',
      'EN_ATENCION': 'badge-warning',
      'ATENDIDA': 'badge-success',
      'CANCELADA': 'badge-danger',
      'NO_ASISTIO': 'badge-secondary',
    };
    return map[estado] || 'badge-secondary';
  }

  get citasFiltradas(): AgendaItem[] {
    const f = this.filtroEstado();
    if (!f) return this.citas();
    return this.citas().filter(c => c.estado === f);
  }

  get totalPendientes(): number {
    return this.citas().filter(c => c.estado === 'CONFIRMADA' || c.estado === 'EN_ATENCION').length;
  }

  get totalAtendidas(): number {
    return this.citas().filter(c => c.estado === 'ATENDIDA').length;
  }
}
