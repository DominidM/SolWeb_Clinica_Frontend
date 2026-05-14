import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class ChatComponent {
  consultaId = input.required<number>();

  mensajes = signal<Mensaje[]>([
    { id: 1, usuario: 'Dr. Ricardo Palma', texto: 'Hola, ¿cómo te sientes hoy?', hora: '10:00', propio: false },
    { id: 2, usuario: 'Tú', texto: 'Buenos días doctor, mejorando gracias.', hora: '10:01', propio: true },
  ]);

  nuevoTexto = signal('');

  enviar() {
    const texto = this.nuevoTexto().trim();
    if (!texto) return;
    this.mensajes.update(msjs => [...msjs, {
      id: Date.now(),
      usuario: 'Tú',
      texto,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      propio: true,
    }]);
    this.nuevoTexto.set('');
  }
}
