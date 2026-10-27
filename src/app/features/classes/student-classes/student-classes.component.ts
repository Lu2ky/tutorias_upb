import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { ScheduledClass } from '@core/models';

@Component({
  selector: 'app-student-classes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-classes.component.html',
  styleUrl: './student-classes.component.scss',
})
export class StudentClassesComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly upcomingClasses = computed(() => this.dataService.upcomingClasses());
  readonly pastClasses = computed(() => this.dataService.pastClasses());
  activeTab = signal<'upcoming' | 'past'>('upcoming');
  showBookedToast = signal(false);

  ngOnInit(): void {
    this.dataService.refreshFromStorage();
    this.route.queryParams.subscribe(params => {
      if (params['booked']) {
        this.showBookedToast.set(true);
        setTimeout(() => this.showBookedToast.set(false), 4000);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  getTutorInfo(tutorId: string) {
    return this.dataService.getTutorById(tutorId);
  }

  cancelClass(classId: string): void {
    if (confirm('¿Estás seguro de que quieres cancelar esta clase?')) {
      const reason = prompt('Motivo de la cancelación (opcional):') || 'Cancelada por el estudiante';
      this.dataService.cancelClass(classId, reason, 'student');
    }
  }

  rescheduleClass(classId: string): void {
    this.router.navigate(['/student/schedule'], { queryParams: { reschedule: classId } });
  }
}