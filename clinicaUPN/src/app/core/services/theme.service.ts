import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'clinica_theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());

  theme$: Observable<Theme> = this.themeSubject.asObservable();

  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  constructor() {
    this.applyTheme(this.currentTheme);
  }

  toggle(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.themeSubject.next(theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
