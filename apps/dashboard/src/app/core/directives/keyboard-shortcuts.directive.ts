import { Directive, HostListener, input, output } from '@angular/core';

@Directive({
  selector: '[appKeyboardShortcuts]',
  standalone: true,
})
export class KeyboardShortcutsDirective {
  onNewTask = output<void>();
  onCancel = output<void>();

  canCreate = input<boolean>(false);

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'n' || e.key === 'N') {
      if (this.canCreate() && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.onNewTask.emit();
      }
    }
    if (e.key === 'Escape') {
      this.onCancel.emit();
    }
  }
}
