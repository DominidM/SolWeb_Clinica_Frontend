import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeleconsultaService, TeleconsultaDTO } from '../../services/consulta';
import { ChatComponent } from '../chat/chat';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './sala.html',
  styleUrl: './sala.css',
})
export class SalaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(TeleconsultaService);

  consulta = signal<TeleconsultaDTO | null>(null);
  cargando = signal(true);
  error = signal('');
  micActivo = signal(true);
  camActivo = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('Sala no encontrada'); this.cargando.set(false); return; }
    this.service.obtenerSala(id).subscribe({
      next: (data) => { this.consulta.set(data); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar la sala.'); this.cargando.set(false); }
    });
  }

  toggleMic() { this.micActivo.update(v => !v); }
  toggleCam() { this.camActivo.update(v => !v); }

  salir() { this.router.navigate(['/app/teleconsulta']); }
}
