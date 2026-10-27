import { Component, computed, inject } from '@angular/core';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private dataService = inject(DataService);

  readonly currentYear = new Date().getFullYear();
  
  readonly footerLinks = [
    { label: 'Sobre Nosotros', href: '#' },
    { label: 'Términos de Uso', href: '#' },
    { label: 'Privacidad', href: '#' },
    { label: 'Contacto', href: '#' },
  ];

  readonly socialLinks = [
    { name: 'Facebook', icon: 'facebook', href: '#' },
    { name: 'Twitter', icon: 'twitter', href: '#' },
    { name: 'Instagram', icon: 'instagram', href: '#' },
    { name: 'LinkedIn', icon: 'linkedin', href: '#' },
  ];
}