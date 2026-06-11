import { Component, input, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { Client } from '@stomp/stompjs';

export interface Mensaje {
  id: number;
  usuario: string;
  texto: string;
  hora: string;
  propio: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  consultaId = input.required<number>();
  private auth = inject(AuthService);

  mensajes = signal<Mensaje[]>([]);
  nuevoTexto = signal('');
  private stompClient: Client | null = null;

  ngOnInit() {
    this.conectarWebSocket();
  }

  ngOnDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }

  private conectarWebSocket() {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      debug: () => {},
      onConnect: () => {
        const destino = `/topic/chat/${this.consultaId()}`;
        this.stompClient!.subscribe(destino, (msg) => {
          const body = JSON.parse(msg.body);
          this.mensajes.update(msjs => [...msjs, {
            id: body.id,
            usuario: body.usuario,
            texto: body.texto,
            hora: body.hora,
            propio: body.email === this.auth.getUser()?.email,
          }]);
        });
      },
    });
    this.stompClient.activate();
  }

  enviar() {
    const texto = this.nuevoTexto().trim();
    if (!texto) return;
    if (!this.stompClient?.connected) return;

    const user = this.auth.getUser();
    const mensaje = {
      consultaId: this.consultaId(),
      usuario: user?.nombre || 'Usuario',
      email: user?.email || '',
      texto,
      rol: user?.rol || '',
    };

    this.stompClient.publish({
      destination: `/app/chat/${this.consultaId()}`,
      body: JSON.stringify(mensaje),
    });
    this.nuevoTexto.set('');
  }
}
