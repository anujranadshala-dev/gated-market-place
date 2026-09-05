import { Injectable, signal, WritableSignal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts: WritableSignal<Toast[]> = this._toasts;

  showSuccess(message: string): void {
    this.addToast({ type: 'success', message });
  }

  showError(message: string): void {
    this.addToast({ type: 'error', message });
  }

  showInfo(message: string): void {
    this.addToast({ type: 'info', message });
  }

  private addToast(toast: Omit<Toast, 'id'>): void {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
    const newToast: Toast = { id, ...toast };
    this._toasts.update((current) => {
      const updated = [...current, newToast];
      return updated.slice(-5);
    });

    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
