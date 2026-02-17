import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'secure_task_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>(this.getStoredTheme());

  theme = this.themeSignal.asReadonly();
  isDark = computed(() => this.themeSignal() === 'dark');

  private getStoredTheme(): Theme {
    if (typeof localStorage === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setTheme(theme: Theme) {
    this.themeSignal.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  toggle() {
    const next = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  init() {
    document.documentElement.classList.toggle('dark', this.themeSignal() === 'dark');
  }
}
