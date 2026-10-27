export interface User {
  id: string;
  email: string;
  password: string; // En producción esto sería hash, pero es mock
  name: string;
  career: string;
  semester: number;
  avatar?: string;
  createdAt: string;
  role: 'student' | 'tutor';
  tutorId?: string; // Link to tutor profile if role is tutor
}

export interface Tutor {
  id: string;
  name: string;
  email: string;
  career: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  avatar?: string;
  bio: string;
  hourlyRate: number;
  availability: TutorAvailability[];
}

export interface TutorAvailability {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface ScheduledClass {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string; // Student notes when booking
  cancellationReason?: string; // Tutor/student cancellation reason
  cancelledBy?: 'student' | 'tutor';
  cancelledAt?: string;
  rescheduledFrom?: string; // Original class ID if rescheduled
  rescheduledTo?: string; // New date/time info
  createdAt: string;
  updatedAt: string;
}

export interface ClassMessage {
  id: string;
  classId: string;
  senderId: string;
  senderRole: 'student' | 'tutor';
  message: string;
  createdAt: string;
}

export interface KnowledgeEntry {
  id: string;
  career: string;
  subject: string;
  topic: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
}

export interface Career {
  id: string;
  name: string;
  code: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  careerId: string;
}

export interface AppData {
  users: User[];
  tutors: Tutor[];
  scheduledClasses: ScheduledClass[];
  classMessages: ClassMessage[];
  knowledgeBase: KnowledgeEntry[];
  careers: Career[];
  currentUser: User | null;
}

export type UserRole = 'student' | 'tutor' | 'admin';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}