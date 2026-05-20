import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CitaPublicaService, DoctorDisponible } from '../../services/cita-publica';
import { LanguageService, Lang } from '../../../../core/services/language.service';
import { PUBLIC_TRANSLATIONS } from '../../../../shared/utils/public-translations';

@Component({
  selector: 'app-landing-page', 
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private citaService = inject(CitaPublicaService);
  private languageService = inject(LanguageService);

  videoMuted = signal(true);

  get currentLang(): Lang {
    return this.languageService.currentLang;
  }

  t(key: string): string {
    return PUBLIC_TRANSLATIONS[key]?.[this.currentLang] ?? key;
  }

  readonly logoUpn =
    'https://res.cloudinary.com/dxuk9bogw/image/upload/v1777099556/b6a20ee7-0a8d-4ba0-be44-ca617db1cb2e.png';

  servicios = [
    { key: 'med',  titulo: 'Medicina General',  icon: 'bi-heart-pulse-fill',  tituloKey: 'srv.medicina',        descKey: 'srv.medicinaDesc',        imagen: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&auto=format&fit=crop&q=80' },
    { key: 'obs',  titulo: 'Obstetricia',       icon: 'bi-gender-female',     tituloKey: 'srv.obstetricia',     descKey: 'srv.obstetriciaDesc',     imagen: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&auto=format&fit=crop&q=80' },
    { key: 'nut',  titulo: 'Nutrición',         icon: 'bi-egg-fried',          tituloKey: 'srv.nutricion',       descKey: 'srv.nutricionDesc',       imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80' },
    { key: 'psi',  titulo: 'Psicología',        icon: 'bi-brain',              tituloKey: 'srv.psicologia',      descKey: 'srv.psicologiaDesc',      imagen: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&auto=format&fit=crop&q=80' },
    { key: 'reh',  titulo: 'Rehabilitación',    icon: 'bi-activity',           tituloKey: 'srv.rehabilitacion',  descKey: 'srv.rehabilitacionDesc',  imagen: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80' },
    { key: 'fis',  titulo: 'Fisioterapia',      icon: 'bi-person-walking',    tituloKey: 'srv.fisioterapia',    descKey: 'srv.fisioterapiaDesc',    imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80' },
  ];

  especialidades = [
    {
      nombre: 'Dra. María Torres',
      cargoKey: 'doc.medicina',
      testimonioKey: 'doc.torresTestimonio',
      foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    },
    {
      nombre: 'Dr. Carlos Mendoza',
      cargoKey: 'doc.psicologia',
      testimonioKey: 'doc.mendozaTestimonio',
      foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    },
    {
      nombre: 'Dra. Ana Quispe',
      cargoKey: 'doc.nutricion',
      testimonioKey: 'doc.quispeTestimonio',
      foto: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop&q=80',
    },
  ];

  features = [
    { key: 'hce',    titleKey: 'feat.hce',             descKey: 'feat.hceDesc',       bg: '#E6F1FB', icon: 'bi-file-earmark-text-fill', color: '#185FA5' },
    { key: 'citas',  titleKey: 'feat.citas',           descKey: 'feat.citasDesc',     bg: '#EAF3DE', icon: 'bi-calendar2-check-fill', color: '#3B6D11' },
    { key: 'tele',   titleKey: 'feat.teleconsulta',    descKey: 'feat.teleconsultaDesc', bg: '#EEEDFE', icon: 'bi-camera-video-fill', color: '#534AB7' },
    { key: 'prac',   titleKey: 'feat.practicantes',    descKey: 'feat.practicantesDesc', bg: '#FAEEDA', icon: 'bi-people-fill', color: '#854F0B' },
  ];

  stats = [
    { key: 'profs', value: '+50', labelKey: 'stats.professionals', color: '#1da2ca' },
    { key: 'specs', value: '8', labelKey: 'stats.specialties', color: '#534AB7' },
  ];

  // ── Carrusel servicios ──
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
    this.servicioIndex.set(
      (this.servicioIndex() - 1 + this.servicios.length) % this.servicios.length,
    );
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
  formFechaNacimiento = signal('');
  formGenero = signal('');
  pacienteId: number | null = null;

  // ── Doctores dinámicos desde el backend ──
  doctoresReales = signal<DoctorDisponible[]>([]);
  cargandoDoctores = signal(false);

  // doctoresDisponibles ahora usa los datos reales del backend
  doctoresDisponibles = computed(() => this.doctoresReales());

  slotsDisponibles = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ];

  // ── Llamado al backend al cambiar especialidad ──
  cargarDoctores(especialidad: string) {
    this.formMedico.set('');
    this.doctoresReales.set([]);
    if (!especialidad) return;

    this.cargandoDoctores.set(true);
    this.citaService.listarDoctores(especialidad).subscribe({
      next: (docs) => {
        this.doctoresReales.set(docs);
        this.cargandoDoctores.set(false);
      },
      error: () => {
        this.doctoresReales.set([]);
        this.cargandoDoctores.set(false);
        this.formError.set(this.t('err.doctorsLoad'));
      },
    });
  }

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
      this.formError.set(this.t('agenda.searchError'));
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    this.citaService.buscarPaciente(this.formEmail(), this.formCodigo()).subscribe({
      next: (paciente) => {
        this.formLoading.set(false);
        this.pacienteId = paciente.idPaciente;
        this.formNombre.set(paciente.nombre);
        this.formApellido.set(paciente.apellido);
        this.formEmail.set(paciente.email);
        this.formTelefono.set(paciente.telefono ?? '');
        this.paso.set('cita');
      },
      error: (err) => {
        console.log('>>> Error completo:', err);
        console.log('>>> err.status:', err.status);
        console.log('>>> err.error:', err.error);
        this.formLoading.set(false);
        this.formError.set(
          err.error?.message || this.t('err.notFound'),
        );
      },
    });
  }

  irACita() {
    if (
      !this.formNombre() ||
      !this.formApellido() ||
      !this.formEmail() ||
      !this.formTelefono() ||
      !this.formFechaNacimiento() ||
      !this.formGenero()
    ) {
      this.formError.set(this.t('agenda.completeAll'));
      return;
    }
    this.formError.set('');
    this.paso.set('cita');
  }

  agendarCita() {
    if (!this.formEspecialidad() || !this.formMedico() || !this.formFecha() || !this.formHora()) {
      this.formError.set(this.t('agenda.completeAppt'));
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    this.citaService
      .agendar({
        idPaciente: this.pacienteId ?? undefined,
        nombre: this.formNombre(),
        apellido: this.formApellido(),
        email: this.formEmail(),
        telefono: this.formTelefono(),
        fechaNacimiento: this.formFechaNacimiento(),
        genero: this.formGenero(),
        especialidad: this.formEspecialidad(),
        medico: this.formMedico(),
        fecha: this.formFecha(),
        hora: this.formHora(),
        motivo: 'Consulta general',
        tipo: 'PRESENCIAL',
      })
      .subscribe({
        next: () => {
          this.paso.set('exito');
          this.formLoading.set(false);
        },
        error: (err) => {
          this.formLoading.set(false);
          this.formError.set(err.error?.message || this.t('err.booking'));
        },
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
    this.doctoresReales.set([]);
  }

  // ── Carrusel de especialidades ──
  readonly currentYear = new Date().getFullYear();
  readonly today = new Date().toISOString().split('T')[0]; // ← AGREGA ESTA
  activeIndex = signal(0);
  animating = signal(false);

  private interval: any;

  prevIndex = computed(
    () => (this.activeIndex() - 1 + this.especialidades.length) % this.especialidades.length,
  );
  nextIndex = computed(() => (this.activeIndex() + 1) % this.especialidades.length);

  ngOnInit() {
    import('@splinetool/viewer');
    this.interval = setInterval(() => this.goNext(), 5000);
    this.startServicioInterval();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    clearInterval(this.servicioInterval);
  }

  goNext() {
    clearInterval(this.interval);
    this.activeIndex.set((this.activeIndex() + 1) % this.especialidades.length);
    this.interval = setInterval(() => this.goNext(), 5000);
  }
  goPrev() {
    clearInterval(this.interval);
    this.activeIndex.set(
      (this.activeIndex() - 1 + this.especialidades.length) % this.especialidades.length,
    );
    this.interval = setInterval(() => this.goNext(), 5000);
  }

  getCardClass(i: number): string {
    const active = this.activeIndex();
    const total = this.especialidades.length;
    if (i === active) return 'card-center';
    if (i === (active - 1 + total) % total) return 'card-left';
    if (i === (active + 1) % total) return 'card-right';
    return 'card-hidden';
  }
}
