import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { Tutor, TutorAvailability, ScheduledClass } from '@core/models';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly tutors = computed(() => this.dataService.tutorsByCareer());
  readonly subjects = computed(() => this.dataService.subjectsByCareer());

  selectedSubject = signal('');
  selectedTutor = signal<Tutor | null>(null);
  selectedDate = signal('');
  selectedTimeSlot = signal<{ start: string; end: string } | null>(null);
  notes = signal('');
  step = signal(1);
  isLoading = signal(false);
  error = signal('');

  minDate = new Date().toISOString().split('T')[0];
  maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  steps = [
    { num: 1, label: 'Materia' },
    { num: 2, label: 'Tutor' },
    { num: 3, label: 'Fecha' },
    { num: 4, label: 'Hora' },
    { num: 5, label: 'Confirmar' },
  ];

  ngOnInit(): void {
    this.dataService.refreshFromStorage();
    this.loadProgress();
    effect(() => this.saveProgress());

    this.route.queryParams.subscribe(params => {
      if (params['reschedule']) {
        // TODO: Handle reschedule flow
      }
    });
  }

  private loadProgress(): void {
    try {
      const saved = sessionStorage.getItem('schedule_wizard_progress');
      if (saved) {
        const progress = JSON.parse(saved);
        if (progress.subject) this.selectedSubject.set(progress.subject);
        if (progress.tutorId) {
          const tutor = this.tutors().find(t => t.id === progress.tutorId);
          if (tutor) this.selectedTutor.set(tutor);
        }
        if (progress.date) this.selectedDate.set(progress.date);
        if (progress.timeSlot) this.selectedTimeSlot.set(progress.timeSlot);
        if (progress.notes) this.notes.set(progress.notes);
        if (progress.step) this.step.set(progress.step);
      }
    } catch (e) {
      console.warn('Failed to load schedule progress:', e);
    }
  }

  private saveProgress(): void {
    try {
      const progress = {
        subject: this.selectedSubject(),
        tutorId: this.selectedTutor()?.id,
        date: this.selectedDate(),
        timeSlot: this.selectedTimeSlot(),
        notes: this.notes(),
        step: this.step(),
        timestamp: Date.now(),
      };
      sessionStorage.setItem('schedule_wizard_progress', JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save schedule progress:', e);
    }
  }

  clearProgress(): void {
    sessionStorage.removeItem('schedule_wizard_progress');
  }

  filteredTutors = computed(() => {
    const subject = this.selectedSubject();
    if (!subject) return this.tutors();
    return this.tutors().filter((t: Tutor) => t.subjects.includes(subject));
  });

  availableSlots = computed(() => {
    const tutor = this.selectedTutor();
    const date = this.selectedDate();
    if (!tutor || !date) return [];

    const dayOfWeek = new Date(date).getDay();
    const availability = tutor.availability.filter((a: TutorAvailability) => a.dayOfWeek === dayOfWeek);

    const slots: { start: string; end: string }[] = [];
    availability.forEach((a: TutorAvailability) => {
      let current = a.startTime;
      while (current < a.endTime) {
        const [hours, minutes] = current.split(':').map(Number);
        const endMinutes = minutes + 60;
        const endHours = hours + Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const end = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        slots.push({ start: current, end });
        current = end;
      }
    });

    const bookedClasses = this.dataService.scheduledClasses().filter(
      (c: ScheduledClass) => c.tutorId === tutor.id && c.date === date && (c.status === 'confirmed' || c.status === 'pending')
    );

    return slots.filter(slot => 
      !bookedClasses.some((c: ScheduledClass) => c.startTime === slot.start && c.endTime === slot.end)
    );
  });

  getDayAvailability = computed(() => {
    const tutor = this.selectedTutor();
    const date = this.selectedDate();
    if (!tutor || !date) return [];
    const dayOfWeek = new Date(date).getDay();
    return tutor.availability.filter((a: TutorAvailability) => a.dayOfWeek === dayOfWeek);
  });

  studentConflicts = computed(() => {
    const timeSlot = this.selectedTimeSlot();
    const date = this.selectedDate();
    if (!timeSlot || !date) return [];
    const studentId = this.dataService.currentUser()?.id;
    if (!studentId) return [];
    const studentClasses = this.dataService.scheduledClasses().filter(
      (c: ScheduledClass) => c.studentId === studentId && c.date === date && (c.status === 'confirmed' || c.status === 'pending')
    );
    return studentClasses.filter((c: ScheduledClass) => 
      c.startTime === this.selectedTimeSlot()!.start && c.endTime === this.selectedTimeSlot()!.end
    );
  });

  allConflicts = computed(() => {
    const tutor = this.selectedTutor();
    const timeSlot = this.selectedTimeSlot();
    const date = this.selectedDate();
    if (!tutor || !timeSlot || !date) return { tutor: false, student: false };

    const tutorConflicts = this.dataService.scheduledClasses().filter(
      (c: ScheduledClass) => c.tutorId === this.selectedTutor()!.id && c.date === date && (c.status === 'confirmed' || c.status === 'pending')
        && c.startTime === timeSlot.start && c.endTime === timeSlot.end
    ).length > 0;

    const studentConflicts = this.studentConflicts().length > 0;

    return { tutor: tutorConflicts, student: studentConflicts };
  });

  hasConflicts = computed(() => {
    const conflicts = this.allConflicts();
    return conflicts.tutor || conflicts.student;
  });

  conflictDetails = computed(() => {
    const conflicts = this.allConflicts();
    const details: string[] = [];
    if (conflicts.tutor) details.push('El tutor ya tiene una clase agendada en ese horario');
    if (conflicts.student) details.push('Ya tienes una clase agendada en ese horario');
    return details;
  });

  canConfirm = computed(() => !this.hasConflicts());

  onSubjectChange(): void {
    this.selectedTutor.set(null);
    this.selectedTimeSlot.set(null);
    this.step.set(2);
  }

  onTutorChange(tutor: Tutor): void {
    this.selectedTutor.set(tutor);
    this.selectedTimeSlot.set(null);
    this.step.set(3);
  }

  onDateChange(): void {
    this.selectedTimeSlot.set(null);
    this.step.set(4);
  }

  onTimeSlotSelect(slot: { start: string; end: string }): void {
    this.selectedTimeSlot.set(slot);
    this.step.set(5);
  }

  goBack(): void {
    this.step.update(s => Math.max(1, s - 1));
  }

  goToDashboard(): void {
    this.router.navigate(['/student/dashboard']);
  }

  async onSubmit(): Promise<void> {
    this.error.set('');
    this.isLoading.set(true);

    if (!this.selectedSubject() || !this.selectedTutor() || !this.selectedDate() || !this.selectedTimeSlot()) {
      this.error.set('Por favor completa todos los pasos');
      this.isLoading.set(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const newClass = this.dataService.scheduleClass({
      studentId: this.dataService.currentUser()!.id,
      tutorId: this.selectedTutor()!.id,
      subject: this.selectedSubject(),
      date: this.selectedDate(),
      startTime: this.selectedTimeSlot()!.start,
      endTime: this.selectedTimeSlot()!.end,
      notes: this.notes() || undefined,
    });

    if (newClass) {
      this.clearProgress();
      this.router.navigate(['/student/classes'], { queryParams: { booked: 'true' } });
    } else {
      this.error.set('Error al agendar la clase. Intenta nuevamente.');
    }

    this.isLoading.set(false);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  formatTime(timeStr: string): string {
    return timeStr.slice(0, 5);
  }

  getTutorAvatar(tutor: Tutor): string {
    return tutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutor.name)}`;
  }
}
