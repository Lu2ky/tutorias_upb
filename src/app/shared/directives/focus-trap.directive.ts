import { 
  Directive, 
  ElementRef, 
  HostListener, 
  inject, 
  OnInit, 
  OnDestroy,
  signal 
} from '@angular/core';

@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
})
export class FocusTrapDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef<HTMLElement>);
  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private isActive = signal(false);

  ngOnInit(): void {
    setTimeout(() => this.activate(), 0);
  }

  ngOnDestroy(): void {
    this.deactivate();
  }

  private activate(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.updateFocusableElements();

    if (this.firstFocusable) {
      this.firstFocusable.focus();
    }

    this.isActive.set(true);
  }

  private deactivate(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
    this.isActive.set(false);
  }

  private updateFocusableElements(): void {
    const element = this.elementRef.nativeElement;
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    const elements = element.querySelectorAll(focusableSelectors);
    
    const elementArray: HTMLElement[] = [];
    elements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const style = window.getComputedStyle(htmlEl);
      if (style.display !== 'none' && style.visibility !== 'hidden' && htmlEl.offsetWidth > 0 && htmlEl.offsetHeight > 0) {
        elementArray.push(htmlEl);
      }
    });

    this.focusableElements = elementArray;
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isActive()) return;

    switch (event.key) {
      case 'Tab':
        this.handleTabKey(event);
        break;
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        this.handleArrowKeys(event);
        break;
      case 'Home':
      case 'End':
        this.handleHomeEndKeys(event);
        break;
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    event.preventDefault();
    const closeEvent = new CustomEvent('focusTrapEscape', { bubbles: true });
    this.elementRef.nativeElement.dispatchEvent(closeEvent);
  }

  private handleArrowKeys(event: KeyboardEvent): void {
    const focusableInputs = this.focusableElements.filter(
      (el: HTMLElement) => el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
    );

    if (focusableInputs.length === 0) return;

    const currentIndex = focusableInputs.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % focusableInputs.length;
    } else {
      nextIndex = (currentIndex - 1 + focusableInputs.length) % focusableInputs.length;
    }

    event.preventDefault();
    focusableInputs[nextIndex]?.focus();
  }

  private handleHomeEndKeys(event: KeyboardEvent): void {
    if (event.key === 'Home') {
      event.preventDefault();
      this.firstFocusable?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      this.lastFocusable?.focus();
    }
  }
}
