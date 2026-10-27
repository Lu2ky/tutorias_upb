import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@core/services/data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);

  readonly currentUser = computed(() => this.dataService.currentUser());
  readonly isTutor = computed(() => this.dataService.isTutor());
  readonly currentTutor = computed(() => {
    const tutorId = this.dataService.currentTutorId();
    return tutorId ? this.dataService.getTutorProfile(tutorId) : null;
  });

  // Edit form
  editName = signal('');
  editEmail = signal('');
  editCareer = signal('');
  editSemester = signal(1);
  editBio = signal('');
  editHourlyRate = signal(0);
  editSubjects = signal('');
  // Availability editing
  editAvailability = signal<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);
  newAvailabilityDay = signal(1);
  newAvailabilityStart = signal('08:00');
  newAvailabilityEnd = signal('12:00');
  isEditing = signal(false);
  isSaving = signal(false);
  saveError = signal('');

  careers = [
    'Ingeniería de Sistemas',
    'Ingeniería Industrial',
    'Ingeniería Electrónica',
    'Ingeniería Mecánica',
    'Ingeniería Civil',
    'Ingeniería Química',
    'Administración de Empresas',
    'Diseño Industrial',
    'Arquitectura',
    'Derecho',
    'Medicina',
    'Psicología',
    'Comunicación Social',
    'Otra',
  ];

  goBack(): void {
    if (this.isTutor()) {
      this.router.navigate(['/tutor/dashboard']);
    } else {
      this.router.navigate(['/student/dashboard']);
    }
  }

  ngOnInit(): void {
    this.dataService.refreshFromStorage();
    this.loadUserData();
  }

  loadUserData(): void {
    const user = this.currentUser();
    if (user) {
      this.editName.set(user.name);
      this.editEmail.set(user.email);
      this.editCareer.set(user.career);
      this.editSemester.set(user.semester);

      if (this.isTutor() && this.currentTutor()) {
        const tutor = this.currentTutor()!;
        this.editBio.set(tutor.bio);
        this.editHourlyRate.set(tutor.hourlyRate);
        this.editSubjects.set(tutor.subjects.join(', '));
        this.editAvailability.set([...tutor.availability]);
      }
    }
  }

  startEditing(): void {
    this.isEditing.set(true);
    this.saveError.set('');
    // Load current availability into edit form
    if (this.isTutor() && this.currentTutor()) {
      this.editAvailability.set([...this.currentTutor()!.availability]);
    }
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.loadUserData();
  }

  // Availability management
  addAvailabilitySlot(): void {
    const day = this.newAvailabilityDay();
    const start = this.newAvailabilityStart();
    const end = this.newAvailabilityEnd();
    
    if (!start || !end || start >= end) {
      this.saveError.set('Horario inválido: la hora de inicio debe ser anterior a la de fin');
      return;
    }

    // Check for overlapping slots on the same day
    const existing = this.editAvailability().find(
      a => a.dayOfWeek === day && 
           ((start >= a.startTime && start < a.endTime) || (end > a.startTime && end <= a.endTime))
    );
    
    if (existing) {
      this.saveError.set('Ya existe un horario que se superpone en ese día');
      return;
    }

    this.editAvailability.update(arr => [...arr, { dayOfWeek: day, startTime: start, endTime: end }].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
    this.saveError.set('');
  }

  removeAvailabilitySlot(index: number): void {
    this.editAvailability.update(arr => arr.filter((_, i) => i !== index));
  }

  async saveProfile(): Promise<void> {
    this.saveError.set('');
    this.isSaving.set(true);

    const user = this.currentUser();
    if (!user) return;

    await new Promise(resolve => setTimeout(resolve, 800));

    // Update user
    this.dataService.updateProfile({
      name: this.editName(),
      email: this.editEmail(),
      career: this.editCareer(),
      semester: this.editSemester(),
    });

    // Update tutor profile if tutor
    if (this.isTutor()) {
      const tutorId = this.dataService.currentTutorId();
      if (tutorId) {
        this.dataService.updateTutorProfile(tutorId, {
          bio: this.editBio(),
          hourlyRate: this.editHourlyRate(),
          subjects: this.editSubjects().split(',').map(s => s.trim()).filter(s => s),
          availability: this.editAvailability(),
        });
      }
    }

    this.isEditing.set(false);
    this.isSaving.set(false);
  }

  async logout(): Promise<void> {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.dataService.logout();
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isEditing()) {
      this.cancelEditing();
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatTime(timeStr: string): string {
    return timeStr.slice(0, 5);
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek] || '';
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // In a real app, this would upload to a server
        // For now we just update the local avatar
        const user = this.currentUser();
        if (user) {
          this.dataService.updateProfile({ avatar: e.target?.result as string });
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }
}