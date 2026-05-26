import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { DoctoresService, Doctor } from '../../services/doctores.service';

@Component({
  selector: 'app-doctores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './doctores-page.html',
  styleUrl: './doctores-page.css',
})
export class DoctoresPageComponent implements OnInit {
  private doctoresService = inject(DoctoresService);

  doctores = signal<Doctor[]>([]);
  loading = signal(true);
  error = signal('');

  doctorEditando = signal<Doctor | null>(null);
  especialidadEditando = signal('');

  ngOnInit(): void {
    this.cargarDoctores();
  }

  cargarDoctores(): void {
    this.loading.set(true);
    this.doctoresService.listar().subscribe({
      next: (res) => {
        this.doctores.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando doctores:', err);
        this.error.set('Error al cargar doctores');
        this.loading.set(false);
      },
    });
  }

  editarEspecialidad(doctor: Doctor): void {
    this.doctorEditando.set(doctor);
    this.especialidadEditando.set(doctor.especialidad);
  }

  cancelarEdicion(): void {
    this.doctorEditando.set(null);
    this.especialidadEditando.set('');
  }

  guardarEspecialidad(): void {
    const doctor = this.doctorEditando();
    if (!doctor) return;

    this.doctoresService.actualizarEspecialidad(doctor.idDoctor, this.especialidadEditando()).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarDoctores();
      },
      error: (err) => {
        console.error('Error actualizando especialidad:', err);
        this.error.set('Error al actualizar especialidad');
      },
    });
  }
}
