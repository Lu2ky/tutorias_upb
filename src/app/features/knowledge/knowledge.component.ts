import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { KnowledgeEntry } from '@core/models';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';

@Component({
  selector: 'app-knowledge',
  standalone: true,
  imports: [CommonModule, FormsModule, FocusTrapDirective],
  templateUrl: './knowledge.component.html',
  styleUrl: './knowledge.component.scss',
})
export class KnowledgeComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);

  readonly knowledgeEntries = computed(() => this.dataService.knowledgeByCareer());
  readonly subjects = computed(() => this.dataService.subjectsByCareer());

  searchQuery = signal('');
  selectedSubject = signal('');
  selectedEntry = signal<KnowledgeEntry | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');
  showAddModal = signal(false);

  // New entry form
  newEntry = signal({
    subject: '',
    topic: '',
    content: '',
    tags: '',
  });

  isLoading = signal(false);

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }

  filteredEntries = computed(() => {
    let entries = this.knowledgeEntries();
    const query = this.searchQuery().toLowerCase().trim();
    const subject = this.selectedSubject();

    if (subject) {
      entries = entries.filter(e => e.subject === subject);
    }

    if (query) {
      entries = entries.filter(e => 
        e.topic.toLowerCase().includes(query) ||
        e.subject.toLowerCase().includes(query) ||
        e.content.toLowerCase().includes(query) ||
        e.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  ngOnInit(): void {
    this.dataService.refreshFromStorage();
  }

  onSearch(): void {
    // Trigger filteredEntries computed
  }

  openEntry(entry: KnowledgeEntry): void {
    this.dataService.incrementViews(entry.id);
    this.selectedEntry.set(entry);
  }

  closeEntry(): void {
    this.selectedEntry.set(null);
  }

  likeEntry(entry: KnowledgeEntry): void {
    this.dataService.likeKnowledgeEntry(entry.id);
  }

  openAddModal(): void {
    this.showAddModal.set(true);
    this.newEntry.set({ subject: '', topic: '', content: '', tags: '' });
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  async saveEntry(): Promise<void> {
    const entry = this.newEntry();
    if (!entry.subject || !entry.topic || !entry.content) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    this.isLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.dataService.currentUser();
    this.dataService.addKnowledgeEntry({
      career: user!.career,
      subject: entry.subject,
      topic: entry.topic,
      content: entry.content,
      tags: entry.tags.split(',').map(t => t.trim()).filter(t => t),
      authorId: user!.id,
      authorName: user!.name,
    });

    this.closeAddModal();
    this.isLoading.set(false);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getExcerpt(content: string, length = 150): string {
    const text = content.replace(/[#*`\[\]]/g, '').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  renderMarkdown(content: string): string {
    // Parse markdown with marked, then sanitize with DOMPurify
    const html = marked.parse(content, { 
      async: false,
      breaks: true,
      gfm: true 
    });
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'style'],
    });
  }
}