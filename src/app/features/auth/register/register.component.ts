import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '@core/services/data.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private dataService = inject(DataService);
  private router = inject(Router);

  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  career = signal('');
  semester = signal(1);
  isLoading = signal(false);
  error = signal('');

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

  passwordsMatch = computed(() => this.password() === this.confirmPassword() && this.password().length > 0);

  passwordStrength = computed(() => {
    const pwd = this.password();
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  });

  getStrengthLabel(): string {
    const strength = this.passwordStrength();
    const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    return labels[strength - 1] || '';
  }

  async onSubmit(): Promise<void> {
    this.error.set('');

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!this.name() || !this.email() || !this.career()) {
      this.error.set('Por favor completa todos los campos obligatorios');
      return;
    }

    this.isLoading.set(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.dataService.register({
      name: this.name(),
      email: this.email(),
      password: this.password(),
      career: this.career(),
      semester: this.semester(),
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.name())}`,
    });

    if (user) {
      this.router.navigateByUrl('/student/dashboard');
    } else {
      this.error.set('Este email ya está registrado');
    }

    this.isLoading.set(false);
  }
}