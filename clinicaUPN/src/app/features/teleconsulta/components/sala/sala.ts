import { Component, OnInit, signal, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeleconsultaService, TeleconsultaDTO } from '../../services/consulta';
import { ChatComponent } from '../chat/chat';

declare const JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './sala.html',
  styleUrl: './sala.css',
})
export class SalaComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(TeleconsultaService);

  @ViewChild('jitsiContainer') jitsiContainer!: ElementRef;

  consulta = signal<TeleconsultaDTO | null>(null);
  cargando = signal(true);
  error = signal('');
  micActivo = signal(true);
  camActivo = signal(true);
  jitsiApi: any = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('Sala no encontrada'); this.cargando.set(false); return; }
    this.service.obtenerSala(id).subscribe({
      next: (data) => { this.consulta.set(data); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar la sala.'); this.cargando.set(false); }
    });
  }

  ngAfterViewInit() {
    this.cargarJitsi();
  }

  private cargarJitsi() {
    if (typeof JitsiMeetExternalAPI !== 'undefined') {
      this.iniciarJitsi();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = () => this.iniciarJitsi();
    document.head.appendChild(script);
  }

  private iniciarJitsi() {
    const linkSala = this.consulta()?.linkSala;
    if (!linkSala) return;
    const roomName = linkSala.replace('https://meet.jit.si/', '');
    this.jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: this.jitsiContainer?.nativeElement,
      configOverrides: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        disableDeepLinking: true,
      },
      interfaceConfigOverrides: {
        TOOLBAR_ALWAYS_VISIBLE: true,
        FILM_STRIP_ENABLED: false,
      },
    });
  }

  toggleMic() {
    if (this.jitsiApi) {
      this.micActivo.update(v => !v);
      this.jitsiApi.executeCommand('toggleAudio');
    }
  }

  toggleCam() {
    if (this.jitsiApi) {
      this.camActivo.update(v => !v);
      this.jitsiApi.executeCommand('toggleVideo');
    }
  }

  salir() {
    if (this.jitsiApi) this.jitsiApi.dispose();
    this.router.navigate(['/app/teleconsulta']);
  }
}
