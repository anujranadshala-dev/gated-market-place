import { Injectable, signal, effect, computed } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'gatedpulse_theme_preference';

  // Current active theme signal ('light' | 'dark')
  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());

  // Computed helper for quick checks
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Synchronize DOM classes whenever the theme signal changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyThemeToDOM(theme);
    });
  }

  /**
   * Determine initial theme from localStorage or system preferences
   */
  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') {
      return 'light';
    }

    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback in case of storage sandboxing
    }

    return 'light';
  }

  /**
   * Toggle between light and dark mode
   */
  public toggleTheme(): void {
    const nextTheme: ThemeMode = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  /**
   * Set explicit theme mode
   */
  public setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }

  /**
   * Apply CSS class to document root
   */
  private applyThemeToDOM(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }
}
