import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { UsuariosService, Usuario } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css',
})
export class UsuariosPageComponent implements OnInit {
  private usuariosService = inject(UsuariosService);

  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  error = signal('');

  page = signal(0);
  size = 10;
  totalElements = signal(0);
  totalPages = signal(0);

  usuarioEditando = signal<Usuario | null>(null);
  rolesDisponibles = [
    'ADMINISTRADOR',
    'ADMINISTRATIVO',
    'DOCTOR',
    'DIRECTOR',
    'PRACTICANTE',
    'PACIENTE',
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading.set(true);
    this.usuariosService.listar(this.page(), this.size).subscribe({
      next: (res) => {
        this.usuarios.set(res.content);
        this.page.set(res.page);
        this.size = res.size;
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error.set('Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  irPagina(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.cargarUsuarios();
  }

  editarRol(usuario: Usuario): void {
    this.usuarioEditando.set({ ...usuario });
  }

  cancelarEdicion(): void {
    this.usuarioEditando.set(null);
  }

  guardarRol(): void {
    const editando = this.usuarioEditando();
    if (!editando) return;
    this.usuariosService.asignarRol(editando.id, editando.rol).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.usuarioEditando.set(null);
      },
      error: (err) => {
        console.error('Error asignando rol:', err);
        this.error.set('Error al asignar rol');
      },
    });
  }
}
