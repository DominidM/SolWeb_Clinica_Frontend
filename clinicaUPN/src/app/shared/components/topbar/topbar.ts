import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';
import { NotificacionBellComponent } from '../../../features/teleconsulta/components/notificacion-bell/notificacion-bell';

export interface Crumb {
  label: string;
  path: string;
}

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  pacientes: 'Pacientes',
  citas: 'Citas',
  atencion: 'Atención',
  'historia-clinica': 'Historia Clínica',
  teleconsulta: 'Teleconsulta',
  sala: 'Sala',
  reportes: 'Reportes',
  consultorios: 'Consultorios',
  doctores: 'Doctores',
  usuarios: 'Usuarios',
  'mi-perfil': 'Mi Perfil',
  'mis-citas': 'Mis Citas',
  'mi-historia': 'Mi Historia',
  practicantes: 'Practicantes',
  agenda: 'Agenda',
  'registrar-consulta': 'Registrar Consulta',
  evaluaciones: 'Evaluaciones',
  'evaluaciones-practicantes': 'Evaluaciones',
  administrativo: 'Administrativo',
  'gestion-citas': 'Gestión de Citas',
  'registro-pacientes': 'Registro de Pacientes',
  'reportes-diarios': 'Reportes Diarios',
  director: 'Director',
  'bi-dashboard': 'BI Dashboard',
};

function buildCrumbs(url: string): Crumb[] {
  const segments = url.split('/').filter(s => s && s !== 'app');
  const crumbs: Crumb[] = [];
  let acc = '/app';
  for (const seg of segments) {
    const paramMatch = seg.match(/^\d+$/);
    if (paramMatch) continue;
    acc += '/' + seg;
    const label = LABEL_MAP[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    crumbs.push({ label, path: acc });
  }
  return crumbs;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificacionBellComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);
  private sub?: Subscription;

  breadcrumbs = signal<Crumb[]>([]);

  ngOnInit() {
    this.updateCrumbs(this.router.url);
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateCrumbs(this.router.url));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private updateCrumbs(url: string) {
    this.breadcrumbs.set(buildCrumbs(url));
  }

  get user() {
    return this.auth.getUser();
  }

  get rolLabel(): string {
    const labels: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      ADMINISTRATIVO: 'Administrativo',
      DOCTOR: 'Doctor',
      DIRECTOR: 'Director',
      PRACTICANTE: 'Practicante',
      PACIENTE: 'Paciente',
    };
    const r = this.auth.getRol() ?? '';
    return labels[r] || r;
  }
}
