import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { ScheduledClass } from '@core/models';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';

interface RescheduleForm {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

interface RescheduleErrors {
  date?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  submit?: string;
}

interface UnreadMessageCount {
  [classId: string]: number;
}

@Component({
  selector: 'app-tutor-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, FocusTrapDirective],
  templateUrl: './tutor-classes.component.html',
  styleUrl: './tutor-classes.component.scss',
})
export class TutorClassesComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);

  readonly tutorUpcomingClasses = computed(() => this.dataService.tutorUpcomingClasses());
  readonly tutorPastClasses = computed(() => this.dataService.tutorPastClasses());
  readonly tutorPendingClasses = computed(() => this.dataService.tutorPendingClasses());

  // Unread message tracking
  readMessageIds = signal<Set<string>>(new Set());

  // Computed: unread message counts per class (only student messages)
  readonly unreadMessageCounts = computed((): UnreadMessageCount => {
    const readIds = this.readMessageIds();
    const allMessages = this.dataService.classMessages();
    const currentUser = this.dataService.currentUser();
    const tutorId = currentUser?.id;

    const counts: UnreadMessageCount = {};

    // Get all classes this tutor is involved in
    const allClasses = [
      ...this.tutorPendingClasses(),
      ...this.tutorUpcomingClasses(),
      ...this.tutorPastClasses(),
    ];

    for (const cls of allClasses) {
      const classMessages = allMessages
        .filter((m) => m.classId === cls.id)
        .filter((m) => m.senderRole === 'student') // Only student messages
        .filter((m) => m.senderId !== tutorId); // Not sent by tutor (defensive)

      const unreadCount = classMessages.filter((m) => !readIds.has(m.id)).length;
      if (unreadCount > 0) {
        counts[cls.id] = unreadCount;
      }
    }

    return counts;
  });

  // Computed: total unread for confirmed classes (for tab badge)
  readonly unreadConfirmedCount = computed(() => {
    const counts = this.unreadMessageCounts();
    const confirmedClasses = this.tutorUpcomingClasses().filter((c) => c.status === 'confirmed');
    return confirmedClasses.reduce((sum, cls) => sum + (counts[cls.id] || 0), 0);
  });

  activeTab = signal<'pending' | 'upcoming' | 'past'>('pending');
  selectedClass = signal<ScheduledClass | null>(null);
  showChat = signal(false);
  chatMessage = signal('');
  isLoading = signal(false);

  // Reschedule modal state
  showRescheduleModal = signal(false);
  rescheduleClass = signal<ScheduledClass | null>(null);
  rescheduleForm = signal<RescheduleForm>({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  });
  rescheduleErrors = signal<RescheduleErrors>({});
  isRescheduling = signal(false);

  goBack(): void {
    this.router.navigate(['/tutor/dashboard']);
  }

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

  getStudentName(studentId: string): string {
    const user = this.dataService.users().find(u => u.id === studentId);
    return user?.name || 'Estudiante';
  }

  getStudentEmail(studentId: string): string {
    const user = this.dataService.users().find(u => u.id === studentId);
    return user?.email || '';
  }

  getClassMessages(classId: string) {
    return this.dataService.getClassMessages(classId);
  }

  confirmClass(classId: string): void {
    if (confirm('¿Confirmar esta clase? El estudiante será notificado.')) {
      this.dataService.confirmClass(classId);
    }
  }

  completeClass(classId: string): void {
    if (confirm('¿Marcar esta clase como completada?')) {
      this.dataService.completeClass(classId);
    }
  }

  cancelClass(classId: string): void {
    const reason = prompt('Motivo de la cancelación (opcional):');
    if (reason !== null) {
      this.dataService.cancelClass(classId, reason || 'Cancelada por el tutor', 'tutor');
    }
  }

  openRescheduleModal(classId: string): void {
    const cls = this.dataService.scheduledClasses().find(c => c.id === classId);
    if (!cls) return;

    this.rescheduleClass.set(cls);
    this.rescheduleForm.set({
      date: cls.date,
      startTime: cls.startTime,
      endTime: cls.endTime,
      reason: '',
    });
    this.rescheduleErrors.set({});
    this.showRescheduleModal.set(true);
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal.set(false);
    this.rescheduleClass.set(null);
    this.rescheduleForm.set({ date: '', startTime: '', endTime: '', reason: '' });
    this.rescheduleErrors.set({});
  }

  updateRescheduleField(field: keyof RescheduleForm, value: string): void {
    this.rescheduleForm.update(form => ({ ...form, [field]: value }));
    this.rescheduleErrors.update(errors => ({ ...errors, [field]: '' }));
  }

  private validateRescheduleForm(): boolean {
    const form = this.rescheduleForm();
    const errors: RescheduleErrors = {};

    const today = new Date().toISOString().split('T')[0];
    if (!form.date) {
      errors['date'] = 'La fecha es obligatoria';
    } else if (form.date < today) {
      errors['date'] = 'La fecha no puede ser anterior a hoy';
    }

    if (!form.startTime) {
      errors['startTime'] = 'La hora de inicio es obligatoria';
    }

    if (!form.endTime) {
      errors['endTime'] = 'La hora de fin es obligatoria';
    } else if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      errors['endTime'] = 'La hora de fin debe ser posterior a la de inicio';
    }

    if (!form.reason.trim()) {
      errors['reason'] = 'El motivo es obligatorio';
    }

    this.rescheduleErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  submitReschedule(): void {
    if (!this.validateRescheduleForm()) return;
    if (!this.rescheduleClass()) return;

    this.isRescheduling.set(true);
    const form = this.rescheduleForm();
    const cls = this.rescheduleClass()!;

    try {
      this.dataService.rescheduleClass(
        cls.id,
        form.date,
        form.startTime,
        form.endTime,
        form.reason.trim()
      );
      this.closeRescheduleModal();
    } catch (e) {
      this.rescheduleErrors.set({ submit: 'Error al reagendar la clase' });
    } finally {
      this.isRescheduling.set(false);
    }
  }

  openChat(classId: string): void {
    const cls = this.dataService.scheduledClasses().find(c => c.id === classId);
    if (cls) {
      this.selectedClass.set(cls);
      this.showChat.set(true);
      this.chatMessage.set('');
      // Mark all student messages in this class as read
      this.markClassMessagesAsRead(classId);
    }
  }

  closeChat(): void {
    this.showChat.set(false);
    this.selectedClass.set(null);
  }

  private markClassMessagesAsRead(classId: string): void {
    const messages = this.dataService.getClassMessages(classId);
    const studentMessageIds = messages
      .filter((m) => m.senderRole === 'student')
      .map((m) => m.id);

    if (studentMessageIds.length > 0) {
      this.readMessageIds.update((ids) => {
        const newIds = new Set(ids);
        for (const id of studentMessageIds) {
          newIds.add(id);
        }
        return newIds;
      });
    }
  }

  sendMessage(): void {
    if (!this.chatMessage().trim() || !this.selectedClass()) return;

    this.dataService.sendClassMessage(this.selectedClass()!.id, this.chatMessage().trim());
    this.chatMessage.set('');
  }

  getCurrentUserRole(): 'student' | 'tutor' {
    return this.dataService.currentUser()?.role || 'student';
  }

  formatMessageTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}