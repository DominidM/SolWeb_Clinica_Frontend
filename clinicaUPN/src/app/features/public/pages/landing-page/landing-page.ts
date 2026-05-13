import { Component, signal, computed, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CitaPublicaService } from '../../services/cita-publica';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private citaService = inject(CitaPublicaService);
readonly logoUpn = 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1777099556/b6a20ee7-0a8d-4ba0-be44-ca617db1cb2e.png';
servicios = [
  {
    icon: 'bi-heart-pulse-fill',
    titulo: 'Medicina General',
    desc: 'Atención integral y preventiva para toda la comunidad universitaria.',
    imagen: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&auto=format&fit=crop&q=80'
  },
  {
    icon: 'bi-gender-female',
    titulo: 'Obstetricia',
    desc: 'Seguimiento y cuidado durante el embarazo, parto y postparto.',
    imagen: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&auto=format&fit=crop&q=80'
  },
  {
    icon: 'bi-egg-fried',
    titulo: 'Nutrición',
    desc: 'Planes alimenticios personalizados adaptados al ritmo universitario.',
    imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80'
  },
  {
    icon: 'bi-brain',
    titulo: 'Psicología',
    desc: 'Apoyo emocional y salud mental profesional para estudiantes y personal.',
    imagen: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&auto=format&fit=crop&q=80'
  },
  {
    icon: 'bi-activity',
    titulo: 'Rehabilitación',
    desc: 'Recuperación física con tecnología especializada de vanguardia.',
    imagen: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80'
  },
  {
    icon: 'bi-person-walking',
    titulo: 'Fisioterapia',
    desc: 'Tratamiento del dolor y mejora del movimiento con atención personalizada.',
    imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80'
  },
];

// Carrusel servicios
servicioIndex = signal(0);
private servicioInterval: any;

get serviciosPrev() {
  return (this.servicioIndex() - 1 + this.servicios.length) % this.servicios.length;
}
get serviciosNext() {
  return (this.servicioIndex() + 1) % this.servicios.length;
}

servicioScrollPrev() {
  clearInterval(this.servicioInterval);
  this.servicioIndex.set((this.servicioIndex() - 1 + this.servicios.length) % this.servicios.length);
  this.startServicioInterval();
}
servicioScrollNext() {
  clearInterval(this.servicioInterval);
  this.servicioIndex.set((this.servicioIndex() + 1) % this.servicios.length);
  this.startServicioInterval();
}
servicioGoTo(i: number) {
  clearInterval(this.servicioInterval);
  this.servicioIndex.set(i);
  this.startServicioInterval();
}
private startServicioInterval() {
  this.servicioInterval = setInterval(() => this.servicioScrollNext(), 4000);
}

especialidades = [
  {
    nombre: 'Dra. María Torres',
    cargo: 'Medicina General',
    testimonio: 'Diagnóstico, prevención y tratamiento de enfermedades comunes. Atención para toda la comunidad universitaria con un enfoque integral y humano.',
    foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  },
  {
    nombre: 'Dr. Carlos Mendoza',
    cargo: 'Psicología Clínica',
    testimonio: 'Apoyo psicológico especializado para estudiantes y personal. Manejo del estrés, ansiedad y bienestar emocional en el entorno universitario.',
    foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
  },
  {
    nombre: 'Dra. Ana Quispe',
    cargo: 'Nutrición y Dietética',
    testimonio: 'Planes nutricionales personalizados adaptados al ritmo universitario. Mejora tu rendimiento académico y bienestar desde una alimentación equilibrada.',
    foto: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop&q=80'
  },
];

  features = [
    { title: 'Historia clínica electrónica', desc: 'Acceso digital a tu historial médico completo',   bg: '#E6F1FB', icon: 'bi-file-earmark-text-fill', color: '#185FA5' },
    { title: 'Gestión digital de citas',     desc: 'Agenda y administra tus citas en línea',          bg: '#EAF3DE', icon: 'bi-calendar2-check-fill',   color: '#3B6D11' },
    { title: 'Teleconsulta disponible',      desc: 'Atención médica desde cualquier lugar',           bg: '#EEEDFE', icon: 'bi-camera-video-fill',       color: '#534AB7' },
    { title: 'Seguimiento a practicantes',   desc: 'Supervisión y acompañamiento continuo',           bg: '#FAEEDA', icon: 'bi-people-fill',             color: '#854F0B' },
  ];

  stats = [
    { value: '+50',  label: 'Profesionales',       color: '#1da2ca' },
    { value: '8',    label: 'Especialidades',      color: '#534AB7' },
  ];

  // ── Formulario de cita ──
  paso = signal<'elegir' | 'existente' | 'nuevo' | 'cita' | 'exito'>('elegir');
  formNombre = signal('');
  formApellido = signal('');
  formEmail = signal('');
  formTelefono = signal('');
  formCodigo = signal('');
  formEspecialidad = signal('');
  formMedico = signal('');
  formFecha = signal('');
  formHora = signal('');
  formLoading = signal(false);
  formError = signal('');
  pacienteId: number | null = null;

  doctoresDisponibles = computed(() => {
    const esp = this.formEspecialidad();
    if (!esp) return [];
    return this.medicosPorEspecialidad[esp] ?? [];
  });

  slotsDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  medicosPorEspecialidad: Record<string, { nombre: string; cargo: string }[]> = {
    'Medicina General': [
      { nombre: 'Dr. Ricardo Palma', cargo: 'Medicina General' },
      { nombre: 'Dra. Carmen Lozano', cargo: 'Medicina General' },
    ],
    Obstetricia: [
      { nombre: 'Dra. Andrea Montes', cargo: 'Obstetricia' },
    ],
    Nutrición: [
      { nombre: 'Dra. Ana Quispe', cargo: 'Nutrición y Dietética' },
      { nombre: 'Dr. Luis Vega', cargo: 'Nutrición' },
    ],
    Psicología: [
      { nombre: 'Dr. Carlos Mendoza', cargo: 'Psicología Clínica' },
      { nombre: 'Dra. Pamela Ríos', cargo: 'Psicología' },
    ],
    Rehabilitación: [
      { nombre: 'Dr. Marco Silva', cargo: 'Rehabilitación' },
    ],
    Fisioterapia: [
      { nombre: 'Lic. Pedro Castillo', cargo: 'Fisioterapia' },
    ],
  };

  elegirPacienteExistente() {
    this.paso.set('existente');
    this.formError.set('');
  }

  elegirPacienteNuevo() {
    this.paso.set('nuevo');
    this.formError.set('');
  }

  buscarPaciente() {
    if (!this.formEmail() || !this.formCodigo()) {
      this.formError.set('Ingresa tu correo y código de estudiante');
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');
    this.citaService.buscarPaciente(this.formEmail(), this.formCodigo()).subscribe({
      next: (paciente) => {
        this.formLoading.set(false);
        if (paciente) {
          this.pacienteId = paciente.idPaciente;
          this.formNombre.set(paciente.nombre);
          this.formApellido.set(paciente.apellido);
          this.formEmail.set(paciente.email);
          this.formTelefono.set(paciente.telefono ?? '');
          this.paso.set('cita');
        } else {
          this.formError.set('No encontramos tus datos. Verifica el correo y código.');
        }
      },
      error: () => {
        this.formLoading.set(false);
        this.formError.set('Error al buscar. Intenta de nuevo.');
      }
    });
  }

  irACita() {
    if (!this.formNombre() || !this.formApellido() || !this.formEmail() || !this.formTelefono()) {
      this.formError.set('Completa todos los datos personales');
      return;
    }
    this.paso.set('cita');
    this.formError.set('');
  }

  agendarCita() {
    if (!this.formEspecialidad() || !this.formMedico() || !this.formFecha() || !this.formHora()) {
      this.formError.set('Completa todos los campos de la cita');
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    this.citaService.agendar({
      idPaciente: this.pacienteId ?? undefined,
      nombre: `${this.formNombre()} ${this.formApellido()}`,
      email: this.formEmail(),
      telefono: this.formTelefono(),
      especialidad: this.formEspecialidad(),
      medico: this.formMedico(),
      fecha: this.formFecha(),
      hora: this.formHora(),
    }).subscribe({
      next: () => {
        this.paso.set('exito');
        this.formLoading.set(false);
      },
      error: (err) => {
        this.formLoading.set(false);
        this.formError.set(err.error?.message || 'Error al agendar la cita. Intenta de nuevo.');
      }
    });
  }

  reiniciarFormulario() {
    this.paso.set('elegir');
    this.pacienteId = null;
    this.formNombre.set('');
    this.formApellido.set('');
    this.formEmail.set('');
    this.formTelefono.set('');
    this.formCodigo.set('');
    this.formEspecialidad.set('');
    this.formMedico.set('');
    this.formFecha.set('');
    this.formHora.set('');
    this.formError.set('');
  }

  readonly currentYear = new Date().getFullYear();
  activeIndex = signal(0);
  animating   = signal(false);
  private interval: any;

  prevIndex = computed(() => (this.activeIndex() - 1 + this.especialidades.length) % this.especialidades.length);
  nextIndex = computed(() => (this.activeIndex() + 1) % this.especialidades.length);

  ngOnInit() {
    // carga el web component de Spline en runtime
    import('@splinetool/viewer');
    this.interval = setInterval(() => this.goNext(), 5000);
  }

  ngOnDestroy() { clearInterval(this.interval); }

  goNext() {
    clearInterval(this.interval);
    this.activeIndex.set((this.activeIndex() + 1) % this.especialidades.length);
    this.interval = setInterval(() => this.goNext(), 5000);
  }

  goPrev() {
    clearInterval(this.interval);
    this.activeIndex.set((this.activeIndex() - 1 + this.especialidades.length) % this.especialidades.length);
    this.interval = setInterval(() => this.goNext(), 5000);
  }

  getCardClass(i: number): string {
    const active = this.activeIndex();
    const total  = this.especialidades.length;
    if (i === active)                        return 'card-center';
    if (i === (active - 1 + total) % total)  return 'card-left';
    if (i === (active + 1) % total)          return 'card-right';
    return 'card-hidden';
  }
}