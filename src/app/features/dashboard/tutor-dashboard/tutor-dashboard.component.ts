import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { ScheduledClass } from '@core/models';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tutor-dashboard.component.html',
  styleUrl: './tutor-dashboard.component.scss',
})
export class TutorDashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);

  readonly currentUser = computed(() => this.dataService.currentUser());
  readonly currentTutor = computed(() => {
    const tutorId = this.dataService.currentTutorId();
    return tutorId ? this.dataService.getTutorProfile(tutorId) : null;
  });
  readonly tutorUpcomingClasses = computed(() => this.dataService.tutorUpcomingClasses());
  readonly tutorPastClasses = computed(() => this.dataService.tutorPastClasses());
  readonly tutorPendingClasses = computed(() => this.dataService.tutorPendingClasses());
  readonly tutorProjectedEarnings = computed(() => this.dataService.tutorProjectedEarnings());
  readonly tutorProjectedEarningsFormatted = computed(() =>
    this.tutorProjectedEarnings().toLocaleString('es-CO') + ' COP',
  );

  stats = computed(() => {
    const upcoming = this.tutorUpcomingClasses();
    const past = this.tutorPastClasses();
    const pending = this.tutorPendingClasses();
    const confirmed = upcoming.filter(c => c.status === 'confirmed').length;
    const completed = past.filter(c => c.status === 'completed').length;

    return {
      total: upcoming.length + past.length,
      confirmed,
      pending: pending.length,
      completed,
    };
  });

  ngOnInit(): void {
    this.dataService.refreshFromStorage();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      rescheduled: 'status-rescheduled',
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      rescheduled: 'Reagendada',
    };
    return labels[status] || status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  formatDateParts(dateStr: string): { day: string; month: string; weekday: string } {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('es-CO', { day: 'numeric' }),
      month: date.toLocaleDateString('es-CO', { month: 'short' }),
      weekday: date.toLocaleDateString('es-CO', { weekday: 'short' }),
    };
  }

  formatTime(timeStr: string): string {
    return timeStr.slice(0, 5);
  }

  getStudentName(studentId: string): string {
    const user = this.dataService.users().find(u => u.id === studentId);
    return user?.name || 'Estudiante';
  }

  cancelClass(classId: string): void {
    if (confirm('¿Cancelar esta clase?')) {
      const reason = prompt('Motivo (opcional):') || 'Cancelada por el tutor';
      this.dataService.cancelClass(classId, reason, 'tutor');
    }
  }

  confirmClass(classId: string): void {
    if (confirm('¿Confirmar esta clase?')) {
      this.dataService.confirmClass(classId);
    }
  }

  openChat(classId: string): void {
    this.router.navigate(['/tutor/classes'], { queryParams: { chat: classId } });
  }

  rescheduleClass(classId: string): void {
    const cls = this.dataService.scheduledClasses().find(c => c.id === classId);
    if (!cls) return;

    const newDate = prompt('Nueva fecha (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!newDate) return;

    const newStartTime = prompt('Hora inicio (HH:MM):', cls.startTime);
    if (!newStartTime) return;

    const newEndTime = prompt('Hora fin (HH:MM):', cls.endTime);
    if (!newEndTime) return;

    const reason = prompt('Motivo:') || 'Reagendada por el tutor';
    this.dataService.rescheduleClass(classId, newDate, newStartTime, newEndTime, reason);
  }
}