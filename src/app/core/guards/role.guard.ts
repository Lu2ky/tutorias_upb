import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DataService } from '../services/data.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const dataService = inject(DataService);
  const router = inject(Router);

  const expectedRole = route.data['role'] as 'student' | 'tutor';
  const currentUser = dataService.currentUser();

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  if (currentUser.role === expectedRole) {
    return true;
  }

  // Redirect to appropriate dashboard based on role
  if (currentUser.role === 'tutor') {
    router.navigate(['/tutor/dashboard']);
  } else {
    router.navigate(['/student/dashboard']);
  }

  return false;
};