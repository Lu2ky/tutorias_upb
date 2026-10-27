import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '@core/services/data.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);

  readonly currentUser = computed(() => this.dataService.currentUser());
  readonly upcomingClasses = computed(() => this.dataService.upcomingClasses());
  readonly pastClasses = computed(() => this.dataService.pastClasses());
  readonly tutorsByCareer = computed(() => this.dataService.tutorsByCareer());
  readonly recentKnowledge = computed(() => this.dataService.knowledgeByCareer().slice(0, 4));

  stats = computed(() => {
    const upcoming = this.upcomingClasses();
    const past = this.pastClasses();
    const confirmed = upcoming.filter(c => c.status === 'confirmed').length;
    const pending = upcoming.filter(c => c.status === 'pending').length;
    const completed = past.filter(c => c.status === 'completed').length;

    return {
      upcoming: upcoming.length,
      confirmed,
      pending,
      completed,
    };
  });

  statItems = computed(() => [
    { key: 'upcoming', label: 'Próximas', value: () => this.stats().upcoming, icon: this.calendarIcon },
    { key: 'confirmed', label: 'Confirmadas', value: () => this.stats().confirmed, icon: this.checkIcon },
    { key: 'pending', label: 'Pendientes', value: () => this.stats().pending, icon: this.clockIcon },
    { key: 'completed', label: 'Completadas', value: () => this.stats().completed, icon: this.checkCircleIcon },
  ]);

  readonly calendarIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>`;
  readonly checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>`;
  readonly clockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>`;
  readonly checkCircleIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>`;

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

  getTutorName(tutorId: string): string {
    const tutor = this.dataService.getTutorById(tutorId);
    return tutor?.name || 'Tutor';
  }

  viewKnowledge(entryId: string): void {
    this.router.navigate(['/student/knowledge'], { queryParams: { entry: entryId } });
  }

  getExcerpt(content: string, length = 150): string {
    const text = content.replace(/[#*`\[\]]/g, '').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  cancelClass(classId: string): void {
    if (confirm('¿Estás seguro de que quieres cancelar esta clase?')) {
      const reason = prompt('Motivo de la cancelación (opcional):') || 'Cancelada por el estudiante';
      this.dataService.cancelClass(classId, reason, 'student');
    }
  }
}