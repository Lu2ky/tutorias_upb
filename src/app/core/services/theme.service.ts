import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  
  readonly theme = signal<Theme>('light');
  
  constructor() {
    // Load from localStorage or system preference
    const saved = localStorage.getItem('theme') as Theme | null;
    const prefersDark = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (prefersDark ? 'dark' : 'light');
    this.theme.set(initialTheme);
    this.applyTheme(initialTheme);
    
    // Listen for system preference changes
    this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.theme.set(e.matches ? 'dark' : 'light');
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    // Apply theme changes
    effect(() => {
      this.applyTheme(this.theme());
    });
  }
  
  private applyTheme(theme: Theme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  
  toggle(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
    this.applyTheme(newTheme);
  }
  
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}