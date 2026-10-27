import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión - Tutorías UPB',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Registro - Tutorías UPB',
  },

  // Student routes (protected)
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'student' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
        title: 'Dashboard - Tutorías UPB',
      },
      {
        path: 'schedule',
        loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent),
        title: 'Agendar Clase - Tutorías UPB',
      },
      {
        path: 'classes',
        loadComponent: () => import('./features/classes/student-classes/student-classes.component').then(m => m.StudentClassesComponent),
        title: 'Mis Clases - Tutorías UPB',
      },
      {
        path: 'knowledge',
        loadComponent: () => import('./features/knowledge/knowledge.component').then(m => m.KnowledgeComponent),
        title: 'Base de Conocimiento - Tutorías UPB',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Mi Perfil - Tutorías UPB',
      },
    ],
  },

  // Tutor routes (protected)
  {
    path: 'tutor',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'tutor' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/tutor-dashboard/tutor-dashboard.component').then(m => m.TutorDashboardComponent),
        title: 'Dashboard Tutor - Tutorías UPB',
      },
      {
        path: 'classes',
        loadComponent: () => import('./features/classes/tutor-classes/tutor-classes.component').then(m => m.TutorClassesComponent),
        title: 'Mis Clases - Tutorías UPB',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Mi Perfil - Tutorías UPB',
      },
    ],
  },

  // Redirects
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];