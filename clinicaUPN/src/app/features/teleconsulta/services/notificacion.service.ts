import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import { AuthService } from '../../../core/services/auth';

export interface Notificacion {
  tipo: string;
  mensaje: string;
  teleconsultaId: number;
  timestamp: string;
  leida: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService implements OnDestroy {
  private auth = inject(AuthService);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly noLeidas = computed(() => this.notificaciones().filter(n => !n.leida).length);

  private _nueva = new Subject<void>();
  readonly onNotificacion$ = this._nueva.asObservable();

  private stompClient: Client | null = null;

  constructor() {
    console.log('[NotificacionService] constructor, autenticado:', this.auth.isAuthenticated());
    if (this.auth.isAuthenticated()) {
      this.conectar();
    }
  }

  conectar() {
    const user = this.auth.getUser();
    if (!user) { return; }
    if (this.stompClient?.active) { return; }

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 0,
      connectionTimeout: 0,
      debug: () => {},
      onConnect: () => {
        const rol = user.rol;
        if (rol === 'DOCTOR' || rol === 'MEDICO') {
          this.stompClient!.subscribe('/topic/notificaciones/doctor', (msg: IMessage) => {
            this.agregar(JSON.parse(msg.body));
          });
        }
        if (rol === 'PACIENTE') {
          const topic = `/topic/notificaciones/paciente/${user.email}`;
          this.stompClient!.subscribe(topic, (msg: IMessage) => {
            this.agregar(JSON.parse(msg.body));
          });
        }
      },
      onStompError: () => {},
      onWebSocketClose: () => {},
    });
    this.stompClient.activate();
  }

  desconectar() {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }

  marcarLeidas() {
    this.notificaciones.update(list => list.map(n => ({ ...n, leida: true })));
  }

  limpiar() {
    this.notificaciones.set([]);
  }

  private agregar(data: any) {
    console.log('[NotificacionService] agregando notificacion:', data.tipo, data.mensaje);
    this.notificaciones.update(list => [{ ...data, leida: false }, ...list]);
    this._nueva.next();
    this.reproducirSonido();
  }

  private reproducirSonido() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio no disponible
    }
  }

  ngOnDestroy() {
    this.desconectar();
  }
}
