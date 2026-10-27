import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { User } from '@core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  isLoading = signal(false);
  error = signal('');
  showUserPicker = signal(false);

  // Get all users from data service
  users = computed(() => this.dataService.users());

  // Group users by role
  students = computed(() => this.users().filter(u => u.role === 'student'));
  tutors = computed(() => this.users().filter(u => u.role === 'tutor'));

  returnUrl = computed(() => this.route.snapshot.queryParams['returnUrl'] || '/');

  selectUser(user: User): void {
    this.email.set(user.email);
    this.password.set(user.password);
    this.error.set('');
  }

  async onSubmit(): Promise<void> {
    this.error.set('');
    this.isLoading.set(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = this.dataService.login(this.email(), this.password());
    console.log('Login result:', user);

    if (user) {
      // Redirect based on user role
      const targetUrl = user.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard';
      console.log('Navigating to:', targetUrl);
      await this.router.navigateByUrl(targetUrl);
    } else {
      this.error.set('Credenciales inválidas. Verifica tu email y contraseña.');
    }

    this.isLoading.set(false);
  }

  toggleUserPicker(): void {
    this.showUserPicker.update(v => !v);
  }
}