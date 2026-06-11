import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { NotificacionBellComponent } from '../../../features/teleconsulta/components/notificacion-bell/notificacion-bell';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NotificacionBellComponent],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.css'
})
export class PrivateLayoutComponent {}