import { Component, computed, inject, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private dataService = inject(DataService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  readonly currentUser = computed(() => this.dataService.currentUser());
  readonly isTutor = computed(() => this.dataService.isTutor());
  readonly isStudent = computed(() => this.dataService.isStudent());
  readonly theme = this.themeService.theme;

  showMenu = false;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showMenu) {
      this.showMenu = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showMenu && !target.closest('.user-menu')) {
      this.showMenu = false;
    }
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  readonly navLinks = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    if (this.isTutor()) {
      return [
        { label: 'Dashboard', route: '/tutor/dashboard', icon: 'dashboard' },
        { label: 'Mis Clases', route: '/tutor/classes', icon: 'calendar' },
        { label: 'Perfil', route: '/tutor/profile', icon: 'user' },
      ];
    }

    return [
      { label: 'Inicio', route: '/student/dashboard', icon: 'home' },
      { label: 'Agendar Clase', route: '/student/schedule', icon: 'calendar-plus' },
      { label: 'Mis Clases', route: '/student/classes', icon: 'calendar' },
      { label: 'Conocimiento', route: '/student/knowledge', icon: 'book' },
      { label: 'Perfil', route: '/student/profile', icon: 'user' },
    ];
  });

  logout(): void {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  onUserMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleMenu();
    } else if (event.key === 'ArrowDown' && !this.showMenu) {
      event.preventDefault();
      this.showMenu = true;
      // Focus the first menu item after the menu opens
      setTimeout(() => {
        const firstItem = document.querySelector('.dropdown-item') as HTMLElement;
        firstItem?.focus();
      }, 0);
    }
  }

  onDropdownKeydown(event: KeyboardEvent): void {
    const items = document.querySelectorAll('.dropdown-item') as NodeListOf<HTMLElement>;
    const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
    
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < items.length - 1) {
          (items[currentIndex + 1] as HTMLElement).focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          (items[currentIndex - 1] as HTMLElement).focus();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.showMenu = false;
        // Focus back on the user avatar button
        const avatarBtn = document.querySelector('.user-avatar') as HTMLElement;
        avatarBtn?.focus();
        break;
      case 'Tab':
        // Allow tab to close the menu
        this.showMenu = false;
        break;
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}