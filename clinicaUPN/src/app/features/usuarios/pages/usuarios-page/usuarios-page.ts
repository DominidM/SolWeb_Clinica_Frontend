import { Component, inject, OnInit } from '@angular/core';
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

  usuarios: Usuario[] = [];
  loading = true;
  error = '';

  usuarioEditando: Usuario | null = null;
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
    this.loading = true;
    this.usuariosService.listar().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      },
    });
  }

  editarRol(usuario: Usuario): void {
    this.usuarioEditando = { ...usuario };
  }

  cancelarEdicion(): void {
    this.usuarioEditando = null;
  }

  guardarRol(): void {
    if (!this.usuarioEditando) return;
    this.usuariosService.asignarRol(this.usuarioEditando.id, this.usuarioEditando.rol).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.usuarioEditando = null;
      },
      error: () => {
        this.error = 'Error al asignar rol';
      },
    });
  }
}
